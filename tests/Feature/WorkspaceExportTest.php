<?php

use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->user->forceFill(['current_workspace_id' => $this->workspace->id])->save();
    $this->user->refresh();
});

it('cannot be accessed by guests', function () {
    get(route('workspaces.export'))
        ->assertRedirect(route('login'));
});

it('allows workspace owners to export data', function () {
    actingAs($this->user)
        ->get(route('workspaces.export'))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'application/json')
        ->assertHeader('Content-Disposition', 'attachment; filename=workspace-export-'.$this->workspace->slug.'-'.now()->format('Y-m-d').'.json');
});

it('contains the expected data structure', function () {
    // Add some data to export
    $this->workspace->invitations()->create([
        'email' => 'test@example.com',
        'role' => 'member',
        'token' => 'test-token',
    ]);

    $this->workspace->apiKeys()->create([
        'name' => 'Test Key',
        'key_hash' => hash('sha256', 'test-key'),
        'key_prefix' => 'test-pre',
        'created_by' => $this->user->id,
    ]);

    $this->workspace->webhookEndpoints()->create([
        'url' => 'https://example.com/webhook',
        'description' => 'Test Webhook',
        'secret' => 'test-secret',
    ]);

    // Log an activity
    activity('workspace')
        ->performedOn($this->workspace)
        ->log('test activity');

    $response = actingAs($this->user)
        ->get(route('workspaces.export'));

    $response->assertJsonStructure([
        'workspace' => ['id', 'name', 'slug', 'created_at', 'updated_at'],
        'members' => [
            '*' => ['id', 'name', 'email', 'role', 'joined_at'],
        ],
        'invitations' => [
            '*' => ['id', 'email', 'role', 'created_at'],
        ],
        'api_keys' => [
            '*' => ['id', 'name', 'created_at', 'last_used_at'],
        ],
        'webhook_endpoints' => [
            '*' => ['id', 'url', 'description', 'created_at'],
        ],
        'activity_logs' => [
            '*' => ['id', 'description', 'event', 'properties', 'created_at'],
        ],
    ]);
});
