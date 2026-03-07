<?php

use App\Models\ApiRequestLog;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;

function setupApiUsageWorkspace(): array
{
    $owner = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $owner->switchWorkspace($workspace);

    return [$owner, $workspace];
}

function createApiKeyForWorkspace(Workspace $workspace, User $owner, string $name = 'Test Key'): WorkspaceApiKey
{
    $result = WorkspaceApiKey::generateKey($workspace, $owner, $name, ['read']);

    return WorkspaceApiKey::find($result['key']->id);
}

// --- Page Rendering ---

it('displays the API usage dashboard for workspace owners', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspaces/api-usage')
            ->has('overview')
            ->has('dailyVolume')
            ->has('perKeyUsage')
            ->has('statusDistribution')
            ->has('topEndpoints')
            ->has('period')
        );
});

it('prevents non-admin members from accessing API usage dashboard', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $member = User::factory()->create();
    $workspace->users()->attach($member->id, ['role' => 'member']);
    $member->switchWorkspace($workspace);

    $this->actingAs($member)
        ->get('/workspaces/api-usage')
        ->assertForbidden();
});

it('requires authentication to access API usage dashboard', function () {
    $this->get('/workspaces/api-usage')
        ->assertRedirect('/login');
});

// --- Overview Stats ---

it('returns correct overview statistics', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    // Create various request logs
    ApiRequestLog::factory()->count(5)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'status_code' => 200,
        'response_time_ms' => 100,
        'was_throttled' => false,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(2)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'status_code' => 500,
        'response_time_ms' => 300,
        'was_throttled' => false,
        'requested_at' => now()->subDays(1),
    ]);

    ApiRequestLog::factory()->count(1)->throttled()->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'response_time_ms' => 50,
        'requested_at' => now()->subDay(),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 8)
            ->where('overview.throttledRequests', 1)
            ->where('overview.errorRate', 37.5) // 3 errors (2x500 + 1x429) out of 8 = 37.5%
        );
});

// --- Period Filtering ---

it('filters data by period parameter', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    // Recent requests (within 7 days)
    ApiRequestLog::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => now()->subDays(3),
    ]);

    // Older requests (within 30 days but not 7)
    ApiRequestLog::factory()->count(5)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => now()->subDays(15),
    ]);

    // 7-day view should only show recent
    $this->actingAs($owner)
        ->get('/workspaces/api-usage?period=7')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 3)
            ->where('period', '7')
        );

    // 30-day view should show all
    $this->actingAs($owner)
        ->get('/workspaces/api-usage?period=30')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 8)
            ->where('period', '30')
        );
});

it('defaults to 30-day period when no period specified', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('period', '30')
        );
});

it('falls back to 30 days for invalid period values', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();

    $this->actingAs($owner)
        ->get('/workspaces/api-usage?period=999')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('period', '30')
        );
});

// --- Per-Key Usage ---

it('shows per-key usage breakdown', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $key1 = createApiKeyForWorkspace($workspace, $owner, 'Production Key');
    $key2 = createApiKeyForWorkspace($workspace, $owner, 'Staging Key');

    ApiRequestLog::factory()->count(10)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $key1->id,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $key2->id,
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('perKeyUsage', 2)
            ->where('perKeyUsage.0.name', 'Production Key')
            ->where('perKeyUsage.0.total_requests', 10)
            ->where('perKeyUsage.1.name', 'Staging Key')
            ->where('perKeyUsage.1.total_requests', 3)
        );
});

// --- Status Code Distribution ---

it('shows status code distribution', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    ApiRequestLog::factory()->count(6)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'status_code' => 200,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(2)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'status_code' => 404,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(1)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'status_code' => 500,
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('statusDistribution')
            ->where('statusDistribution.2xx', 6)
            ->where('statusDistribution.4xx', 2)
            ->where('statusDistribution.5xx', 1)
        );
});

// --- Top Endpoints ---

it('shows top endpoints by request count', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    ApiRequestLog::factory()->count(8)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'method' => 'GET',
        'path' => 'api/v1/workspace',
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'method' => 'GET',
        'path' => 'api/v1/members',
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('topEndpoints', 2)
            ->where('topEndpoints.0.path', 'api/v1/workspace')
            ->where('topEndpoints.0.total', 8)
            ->where('topEndpoints.1.path', 'api/v1/members')
            ->where('topEndpoints.1.total', 3)
        );
});

// --- Daily Volume ---

it('shows daily request volume', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    $today = now()->startOfDay();
    $yesterday = now()->subDay()->startOfDay();

    ApiRequestLog::factory()->count(5)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => $today->copy()->addHours(3),
    ]);

    ApiRequestLog::factory()->count(2)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => $yesterday->copy()->addHours(3),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('dailyVolume', 2)
        );
});

// --- Workspace Isolation ---

it('only shows data for the current workspace', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    // Logs for different workspace
    $otherWorkspace = Workspace::factory()->create();
    $otherKey = WorkspaceApiKey::factory()->create(['workspace_id' => $otherWorkspace->id, 'created_by' => $owner->id]);

    ApiRequestLog::factory()->count(3)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(10)->create([
        'workspace_id' => $otherWorkspace->id,
        'api_key_id' => $otherKey->id,
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 3)
        );
});

// --- Empty State ---

it('handles empty state gracefully', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 0)
            ->where('overview.throttledRequests', 0)
            ->where('overview.avgResponseTime', 0)
            ->where('overview.errorRate', 0)
            ->has('dailyVolume', 0)
            ->has('perKeyUsage', 0)
            ->has('topEndpoints', 0)
        );
});

// --- Throttled Request Tracking ---

it('tracks throttled requests in overview', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    ApiRequestLog::factory()->count(4)->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'was_throttled' => false,
        'status_code' => 200,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->count(3)->throttled()->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.totalRequests', 7)
            ->where('overview.throttledRequests', 3)
        );
});

// --- Middleware Logging ---

it('logs API requests via middleware', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $result = WorkspaceApiKey::generateKey($workspace, $owner, 'Log Test', ['read']);

    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer '.$result['plainTextKey'],
    ])->assertOk();

    $this->assertDatabaseCount('api_request_logs', 1);
    $this->assertDatabaseHas('api_request_logs', [
        'workspace_id' => $workspace->id,
        'api_key_id' => $result['key']->id,
        'method' => 'GET',
        'status_code' => 200,
        'was_throttled' => false,
    ]);
});

it('does not log when authentication fails', function () {
    $this->getJson('/api/v1/workspace', [
        'Authorization' => 'Bearer wsk_invalidkey',
    ])->assertUnauthorized();

    $this->assertDatabaseCount('api_request_logs', 0);
});

// --- Admin Access ---

it('allows workspace admin to access API usage dashboard', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $admin = User::factory()->create();
    $workspace->users()->attach($admin->id, ['role' => 'admin']);
    $admin->switchWorkspace($workspace);

    $this->actingAs($admin)
        ->get('/workspaces/api-usage')
        ->assertOk();
});

// --- Average Response Time ---

it('calculates average response time correctly', function () {
    [$owner, $workspace] = setupApiUsageWorkspace();
    $apiKey = createApiKeyForWorkspace($workspace, $owner);

    ApiRequestLog::factory()->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'response_time_ms' => 100,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'response_time_ms' => 200,
        'requested_at' => now()->subDays(2),
    ]);

    ApiRequestLog::factory()->create([
        'workspace_id' => $workspace->id,
        'api_key_id' => $apiKey->id,
        'response_time_ms' => 300,
        'requested_at' => now()->subDays(2),
    ]);

    $this->actingAs($owner)
        ->get('/workspaces/api-usage')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('overview.avgResponseTime', fn ($val) => (float) $val === 200.0)
        );
});
