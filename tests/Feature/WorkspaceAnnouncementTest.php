<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceAnnouncement;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->owner->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->owner->switchWorkspace($this->workspace);

    $this->member = User::factory()->create();
    $this->member->workspaces()->attach($this->workspace, ['role' => 'member']);
    $this->member->switchWorkspace($this->workspace);

    $this->admin = User::factory()->create();
    $this->admin->workspaces()->attach($this->workspace, ['role' => 'admin']);
    $this->admin->switchWorkspace($this->workspace);
});

it('lists active announcements for workspace members', function () {
    WorkspaceAnnouncement::factory()->count(3)->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->member)
        ->getJson("/workspaces/{$this->workspace->id}/announcements");

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

it('allows workspace owner to create announcement', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => 'Important Update',
            'content' => 'This is an important announcement for all members.',
            'type' => 'info',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.title', 'Important Update');

    $this->assertDatabaseHas('workspace_announcements', [
        'workspace_id' => $this->workspace->id,
        'title' => 'Important Update',
        'type' => 'info',
    ]);
});

it('allows workspace admin to create announcement', function () {
    $response = $this->actingAs($this->admin)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => 'Admin Update',
            'content' => 'This is an admin announcement.',
            'type' => 'warning',
        ]);

    $response->assertCreated();
});

it('prevents regular member from creating announcement', function () {
    $response = $this->actingAs($this->member)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => 'Member Update',
            'content' => 'This should not work.',
            'type' => 'info',
        ]);

    $response->assertForbidden();
});

it('validates announcement title is required', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => '',
            'content' => 'Some content here.',
            'type' => 'info',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['title']);
});

it('validates announcement content minimum length', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => 'Short Update',
            'content' => 'Short',
            'type' => 'info',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['content']);
});

it('validates announcement type', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/announcements", [
            'title' => 'Update',
            'content' => 'This is an announcement with invalid type.',
            'type' => 'invalid_type',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

it('allows owner to update announcement', function () {
    $announcement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/announcements/{$announcement->id}", [
            'title' => 'Updated Title',
            'content' => 'Updated content for the announcement.',
            'type' => 'success',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.title', 'Updated Title');
});

it('allows owner to delete announcement', function () {
    $announcement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->owner)
        ->deleteJson("/workspaces/{$this->workspace->id}/announcements/{$announcement->id}");

    $response->assertOk();
    $this->assertSoftDeleted('workspace_announcements', ['id' => $announcement->id]);
});

it('allows user to dismiss dismissible announcement', function () {
    $announcement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'dismissible' => true,
    ]);

    $response = $this->actingAs($this->member)
        ->postJson("/workspaces/{$this->workspace->id}/announcements/{$announcement->id}/dismiss");

    $response->assertOk();

    $this->assertDatabaseHas('workspace_announcement_reads', [
        'announcement_id' => $announcement->id,
        'user_id' => $this->member->id,
    ]);
});

it('tracks read status for user', function () {
    $announcement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
    ]);

    $announcement->markAsReadBy($this->member);

    expect($announcement->isReadBy($this->member))->toBeTrue();
    expect($announcement->isReadBy($this->owner))->toBeFalse();
});

it('allows pinning announcement', function () {
    $announcement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'pinned' => false,
    ]);

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/announcements/{$announcement->id}/pin", [
            'pinned' => true,
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('workspace_announcements', [
        'id' => $announcement->id,
        'pinned' => true,
    ]);
});

it('returns active banners for workspace', function () {
    // Create pinned announcement (should appear in banners)
    $pinned = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'pinned' => true,
        'type' => 'warning',
    ]);

    // Create regular announcement and mark as read (should not appear)
    $regular = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'pinned' => false,
    ]);
    $regular->markAsReadBy($this->member);

    $response = $this->actingAs($this->member)
        ->getJson("/workspaces/{$this->workspace->id}/announcements/banners/active");

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

it('excludes expired announcements from active list', function () {
    WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($this->member)
        ->getJson("/workspaces/{$this->workspace->id}/announcements");

    $response->assertOk()
        ->assertJsonCount(0, 'data');
});

it('excludes future published announcements from active list', function () {
    WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'published_at' => now()->addDay(),
    ]);

    $response = $this->actingAs($this->member)
        ->getJson("/workspaces/{$this->workspace->id}/announcements");

    $response->assertOk()
        ->assertJsonCount(0, 'data');
});

it('returns correct type styles for each announcement type', function () {
    $infoAnnouncement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'type' => 'info',
    ]);

    $warningAnnouncement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'type' => 'warning',
    ]);

    $successAnnouncement = WorkspaceAnnouncement::factory()->create([
        'workspace_id' => $this->workspace->id,
        'user_id' => $this->owner->id,
        'type' => 'success',
    ]);

    expect($infoAnnouncement->getTypeStyles()['icon'])->toBe('info');
    expect($warningAnnouncement->getTypeStyles()['icon'])->toBe('alert-triangle');
    expect($successAnnouncement->getTypeStyles()['icon'])->toBe('check-circle');
});
