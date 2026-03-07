<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;
use App\Models\WorkspaceInvitation;

function setupWorkspaceAnalytics(): array
{
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $owner->switchWorkspace($workspace);

    return [$owner, $workspace];
}

it('displays the workspace analytics page for admins', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->has('overview')
        ->has('memberGrowth')
        ->has('apiKeys')
        ->has('webhookDeliveries')
        ->has('weeklyActivity')
        ->has('recentActivity')
    );
});

it('denies access to regular members', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $response = $this->actingAs($member)->get('/workspaces/analytics');

    $response->assertForbidden();
});

it('returns correct overview stats', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    // Add a member
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);

    // Add API keys
    WorkspaceApiKey::factory()->count(2)->create(['workspace_id' => $workspace->id]);
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $workspace->id,
        'expires_at' => now()->subDay(), // expired
    ]);

    // Add webhook endpoints
    WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id, 'is_active' => true]);
    WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id, 'is_active' => false]);

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->where('overview.totalMembers', 2)
        ->where('overview.activeApiKeys', 2)
        ->where('overview.webhookEndpoints', 2)
        ->where('overview.activeWebhookEndpoints', 1)
    );
});

it('returns member growth data for 6 months', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->has('memberGrowth', 6)
    );
});

it('returns 8 weeks of weekly activity data', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->has('weeklyActivity', 8)
    );
});

it('shows webhook delivery stats', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $workspace->id]);

    WebhookLog::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'status' => 'success',
    ]);
    WebhookLog::factory()->count(2)->create([
        'workspace_id' => $workspace->id,
        'webhook_endpoint_id' => $endpoint->id,
        'status' => 'failed',
    ]);

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->where('webhookDeliveries.success', 3)
        ->where('webhookDeliveries.failed', 2)
        ->where('webhookDeliveries.total', 5)
    );
});

it('lists API keys with usage info', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    WorkspaceApiKey::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Production Key',
        'last_used_at' => now()->subHour(),
    ]);

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->has('apiKeys', 1)
        ->where('apiKeys.0.name', 'Production Key')
    );
});

it('shows recent activity events', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    activity('test')
        ->causedBy($owner)
        ->performedOn($workspace)
        ->log('Test activity entry');

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();

    $activities = $response->original->getData()['page']['props']['recentActivity'];
    $descriptions = collect($activities)->pluck('description');
    expect($descriptions)->toContain('Test activity entry');
});

it('counts pending invitations', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    WorkspaceInvitation::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
    ]);

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->where('overview.pendingInvitations', 3)
    );
});

it('handles workspace with no resources', function () {
    [$owner, $workspace] = setupWorkspaceAnalytics();

    $response = $this->actingAs($owner)->get('/workspaces/analytics');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('workspaces/analytics/index')
        ->where('overview.activeApiKeys', 0)
        ->where('overview.webhookEndpoints', 0)
        ->where('overview.pendingInvitations', 0)
        ->where('webhookDeliveries.total', 0)
        ->has('apiKeys', 0)
    );
});
