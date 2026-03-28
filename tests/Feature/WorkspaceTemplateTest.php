<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceTemplate;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->user->switchWorkspace($this->workspace);
});

it('lists public and user templates', function () {
    WorkspaceTemplate::factory()->count(3)->public()->create();
    WorkspaceTemplate::factory()->count(2)->forUser($this->user->id)->create();

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-templates');

    $response->assertOk()
        ->assertJsonPath('meta.total', 5);
});

it('creates a template from workspace', function () {
    $response = $this->actingAs($this->user)
        ->postJson('/workspace-templates', [
            'workspace_id' => $this->workspace->id,
            'name' => 'My Template',
            'description' => 'A test template',
            'icon' => 'rocket',
            'is_public' => false,
            'category' => 'development',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'My Template');

    $this->assertDatabaseHas('workspace_templates', [
        'user_id' => $this->user->id,
        'workspace_id' => $this->workspace->id,
        'name' => 'My Template',
        'category' => 'development',
    ]);
});

it('prevents creating template when user has no workspace', function () {
    $user = User::factory()->create();
    // User has no workspaces, so currentWorkspace will be null

    $response = $this->actingAs($user)
        ->postJson('/workspace-templates', [
            'name' => 'My Template',
            'category' => 'general',
        ]);

    // Should fail because user has no current workspace
    $response->assertStatus(403);
});

it('shows template details', function () {
    $template = WorkspaceTemplate::factory()->public()->create();

    $response = $this->actingAs($this->user)
        ->getJson("/workspace-templates/{$template->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $template->id);
});

it('prevents viewing private template of another user', function () {
    $otherUser = User::factory()->create();
    $template = WorkspaceTemplate::factory()->forUser($otherUser->id)->create();

    $response = $this->actingAs($this->user)
        ->getJson("/workspace-templates/{$template->id}");

    $response->assertForbidden();
});

it('allows creator to update template', function () {
    $template = WorkspaceTemplate::factory()->forUser($this->user->id)->create();

    $response = $this->actingAs($this->user)
        ->putJson("/workspace-templates/{$template->id}", [
            'name' => 'Updated Name',
            'icon' => 'star',
            'category' => 'marketing',
            'is_public' => true,
        ]);

    $response->assertOk()
        ->assertJsonPath('data.name', 'Updated Name');

    $this->assertDatabaseHas('workspace_templates', [
        'id' => $template->id,
        'name' => 'Updated Name',
        'is_public' => true,
    ]);
});

it('prevents non-creator from updating template', function () {
    $otherUser = User::factory()->create();
    $template = WorkspaceTemplate::factory()->forUser($otherUser->id)->create();

    $response = $this->actingAs($this->user)
        ->putJson("/workspace-templates/{$template->id}", [
            'name' => 'Updated Name',
            'icon' => 'star',
            'category' => 'marketing',
        ]);

    $response->assertForbidden();
});

it('allows creator to delete template', function () {
    $template = WorkspaceTemplate::factory()->forUser($this->user->id)->create();

    $response = $this->actingAs($this->user)
        ->deleteJson("/workspace-templates/{$template->id}");

    $response->assertOk();
    $this->assertSoftDeleted('workspace_templates', ['id' => $template->id]);
});

it('creates workspace from template', function () {
    $template = WorkspaceTemplate::factory()->public()->create([
        'name' => 'Test Template',
        'configuration' => [
            'settings' => ['timezone' => 'America/New_York'],
            'features' => [],
            'webhooks_structure' => [],
            'api_keys_structure' => [],
            'default_roles' => [],
            'custom_fields' => [],
        ],
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/workspace-templates/{$template->id}/use");

    $response->assertCreated();

    // Workspace name should be based on template name with "Copy" suffix
    $this->assertDatabaseHas('workspaces', [
        'name' => 'Test Template Copy',
        'owner_id' => $this->user->id,
    ]);

    // Check usage count was incremented
    $this->assertDatabaseHas('workspace_templates', [
        'id' => $template->id,
        'usage_count' => 1,
    ]);
});

it('duplicates a template', function () {
    $template = WorkspaceTemplate::factory()->public()->create([
        'name' => 'Original Template',
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/workspace-templates/{$template->id}/duplicate");

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Original Template (Copy)');

    $this->assertDatabaseHas('workspace_templates', [
        'name' => 'Original Template (Copy)',
        'user_id' => $this->user->id,
        'is_public' => false,
    ]);
});

it('lists user templates', function () {
    WorkspaceTemplate::factory()->count(3)->forUser($this->user->id)->create();
    WorkspaceTemplate::factory()->count(2)->public()->create();

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-templates/my');

    $response->assertOk()
        ->assertJsonPath('meta.total', 3);
});

it('filters templates by category', function () {
    WorkspaceTemplate::factory()->count(2)->public()->category('development')->create();
    WorkspaceTemplate::factory()->count(3)->public()->category('marketing')->create();

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-templates?category=development');

    $response->assertOk()
        ->assertJsonPath('meta.total', 2);
});

it('searches templates by name', function () {
    WorkspaceTemplate::factory()->public()->create(['name' => 'Alpha Template']);
    WorkspaceTemplate::factory()->public()->create(['name' => 'Beta Template']);
    WorkspaceTemplate::factory()->public()->create(['name' => 'Gamma Project']);

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-templates?search=Template');

    $response->assertOk()
        ->assertJsonPath('meta.total', 2);
});
