<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceComment;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->user->switchWorkspace($this->workspace);
});

it('lists comments for a workspace', function () {
    WorkspaceComment::factory()->count(5)->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/workspaces/{$this->workspace->id}/comments");

    $response->assertOk()
        ->assertJsonCount(5, 'data');
});

it('creates a comment successfully', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/comments", [
            'content' => 'This is a test comment',
            'commentable_type' => 'activity',
            'commentable_id' => 1,
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.content', 'This is a test comment');

    $this->assertDatabaseHas('workspace_comments', [
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
        'content' => 'This is a test comment',
    ]);
});

it('validates comment content is required', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/comments", [
            'content' => '',
            'commentable_type' => 'activity',
            'commentable_id' => 1,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['content']);
});

it('validates comment content max length', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/comments", [
            'content' => str_repeat('a', 5001),
            'commentable_type' => 'activity',
            'commentable_id' => 1,
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['content']);
});

it('allows comment author to update their comment', function () {
    $comment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->putJson("/workspaces/{$this->workspace->id}/comments/{$comment->id}", [
            'content' => 'Updated comment content',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.content', 'Updated comment content');

    $this->assertDatabaseHas('workspace_comments', [
        'id' => $comment->id,
        'content' => 'Updated comment content',
    ]);
});

it('prevents non-author from updating comment', function () {
    $otherUser = User::factory()->create();
    $otherUser->workspaces()->attach($this->workspace, ['role' => 'member']);

    $comment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($otherUser)
        ->putJson("/workspaces/{$this->workspace->id}/comments/{$comment->id}", [
            'content' => 'Updated comment content',
        ]);

    $response->assertForbidden();
});

it('allows comment author to delete their comment', function () {
    $comment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->deleteJson("/workspaces/{$this->workspace->id}/comments/{$comment->id}");

    $response->assertOk();
    $this->assertSoftDeleted('workspace_comments', ['id' => $comment->id]);
});

it('allows workspace admin to delete any comment', function () {
    $admin = User::factory()->create();
    $admin->workspaces()->attach($this->workspace, ['role' => 'admin']);
    $admin->switchWorkspace($this->workspace);

    $member = User::factory()->create();
    $member->workspaces()->attach($this->workspace, ['role' => 'member']);

    $comment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $member->id,
    ]);

    $response = $this->actingAs($admin)
        ->deleteJson("/workspaces/{$this->workspace->id}/comments/{$comment->id}");

    $response->assertOk();
    $this->assertSoftDeleted('workspace_comments', ['id' => $comment->id]);
});

it('prevents non-member from accessing comments', function () {
    $nonMember = User::factory()->create();
    $nonMemberWorkspace = Workspace::factory()->create(['owner_id' => $nonMember->id]);
    $nonMember->workspaces()->attach($nonMemberWorkspace, ['role' => 'owner']);
    $nonMember->switchWorkspace($nonMemberWorkspace);

    $response = $this->actingAs($nonMember)
        ->getJson("/workspaces/{$this->workspace->id}/comments");

    $response->assertForbidden();
});

it('creates nested reply comments', function () {
    $parentComment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/comments", [
            'content' => 'This is a reply',
            'parent_id' => $parentComment->id,
            'commentable_type' => 'activity',
            'commentable_id' => 1,
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('workspace_comments', [
        'parent_id' => $parentComment->id,
        'content' => 'This is a reply',
    ]);
});

it('lists replies for a comment', function () {
    $parentComment = WorkspaceComment::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
    ]);

    WorkspaceComment::factory()->count(3)->create([
        'workspace_id' => $this->workspace->id,
        'parent_id' => $parentComment->id,
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/workspaces/{$this->workspace->id}/comments/{$parentComment->id}/replies");

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

it('filters comments by commentable type and id', function () {
    WorkspaceComment::factory()->count(3)->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
        'commentable_type' => 'activity',
        'commentable_id' => 1,
    ]);

    WorkspaceComment::factory()->count(2)->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->user->id,
        'commentable_type' => 'activity',
        'commentable_id' => 2,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/workspaces/{$this->workspace->id}/comments?commentable_type=activity&commentable_id=1");

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});
