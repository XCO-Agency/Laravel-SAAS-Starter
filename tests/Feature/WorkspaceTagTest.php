<?php

use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->owner->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->owner->switchWorkspace($this->workspace);

    $this->member = User::factory()->create();
    $this->member->workspaces()->attach($this->workspace, ['role' => 'member']);
    $this->member->switchWorkspace($this->workspace);
});

it('lists workspace tags', function () {
    $tag = Tag::factory()->forWorkspace($this->workspace)->create();
    $this->workspace->tags()->attach($tag->id);

    $response = $this->actingAs($this->owner)
        ->getJson("/workspaces/{$this->workspace->id}/tags");

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

it('creates and assigns tag to workspace', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/tags", [
            'name' => 'Urgent',
            'color' => '#ef4444',
            'description' => 'High priority items',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Urgent')
        ->assertJsonPath('data.color', '#ef4444');

    $this->assertDatabaseHas('tags', [
        'name' => 'Urgent',
        'workspace_id' => $this->workspace->id,
    ]);

    $this->assertDatabaseHas('taggables', [
        'taggable_type' => Workspace::class,
        'taggable_id' => $this->workspace->id,
    ]);
});

it('generates unique slug for duplicate tag names', function () {
    Tag::factory()->forWorkspace($this->workspace)->create([
        'name' => 'Test Tag',
        'slug' => 'test-tag',
    ]);

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/tags", [
            'name' => 'Test Tag',
            'color' => '#3b82f6',
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('tags', [
        'name' => 'Test Tag',
        'slug' => 'test-tag-1',
        'workspace_id' => $this->workspace->id,
    ]);
});

it('validates color format', function () {
    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/tags", [
            'name' => 'Invalid Color',
            'color' => 'not-a-color',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['color']);
});

it('allows tag creator to update tag', function () {
    $tag = Tag::factory()->forWorkspace($this->workspace)->create([
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/tags/{$tag->id}", [
            'name' => 'Updated Name',
            'color' => '#22c55e',
            'description' => 'Updated description',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Name');
});

it('allows admin to update any workspace tag', function () {
    $tag = Tag::factory()->forWorkspace($this->workspace)->create([
        'user_id' => $this->member->id,
    ]);

    $response = $this->actingAs($this->owner)
        ->putJson("/workspaces/{$this->workspace->id}/tags/{$tag->id}", [
            'name' => 'Admin Updated',
            'color' => '#22c55e',
        ]);

    $response->assertOk();
});

it('prevents non-admin non-creator from updating tag', function () {
    $tag = Tag::factory()->forWorkspace($this->workspace)->create([
        'user_id' => $this->owner->id,
    ]);

    $response = $this->actingAs($this->member)
        ->putJson("/workspaces/{$this->workspace->id}/tags/{$tag->id}", [
            'name' => 'Hacked',
            'color' => '#000000',
        ]);

    $response->assertForbidden();
});

it('removes tag from workspace', function () {
    $tag = Tag::factory()->forWorkspace($this->workspace)->create();
    $this->workspace->tags()->attach($tag->id);

    $response = $this->actingAs($this->owner)
        ->deleteJson("/workspaces/{$this->workspace->id}/tags/{$tag->id}");

    $response->assertOk();

    $this->assertDatabaseMissing('taggables', [
        'tag_id' => $tag->id,
        'taggable_type' => Workspace::class,
        'taggable_id' => $this->workspace->id,
    ]);
});

it('attaches existing tag to workspace', function () {
    $tag = Tag::factory()->global()->create();

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/tags/attach", [
            'tag_id' => $tag->id,
        ]);

    $response->assertOk();

    $this->assertDatabaseHas('taggables', [
        'tag_id' => $tag->id,
        'taggable_type' => Workspace::class,
        'taggable_id' => $this->workspace->id,
    ]);
});

it('prevents attaching already attached tag', function () {
    $tag = Tag::factory()->global()->create();
    $this->workspace->tags()->attach($tag->id);

    $response = $this->actingAs($this->owner)
        ->postJson("/workspaces/{$this->workspace->id}/tags/attach", [
            'tag_id' => $tag->id,
        ]);

    $response->assertUnprocessable();
});

it('detaches tag from workspace', function () {
    $tag = Tag::factory()->global()->create();
    $this->workspace->tags()->attach($tag->id);

    $response = $this->actingAs($this->owner)
        ->deleteJson("/workspaces/{$this->workspace->id}/tags/{$tag->id}/detach");

    $response->assertOk();

    $this->assertDatabaseMissing('taggables', [
        'tag_id' => $tag->id,
        'taggable_type' => Workspace::class,
        'taggable_id' => $this->workspace->id,
    ]);
});

it('lists available tags not yet assigned', function () {
    $assignedTag = Tag::factory()->global()->create(['name' => 'Assigned']);
    $availableTag = Tag::factory()->global()->create(['name' => 'Available']);
    $this->workspace->tags()->attach($assignedTag->id);

    $response = $this->actingAs($this->owner)
        ->getJson("/workspaces/{$this->workspace->id}/tags/available");

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Available');
});

it('prevents non-member from accessing workspace tags', function () {
    $nonMember = User::factory()->create();

    $response = $this->actingAs($nonMember)
        ->getJson("/workspaces/{$this->workspace->id}/tags");

    $response->assertForbidden();
});
