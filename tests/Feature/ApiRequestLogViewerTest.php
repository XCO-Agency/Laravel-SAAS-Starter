<?php

use App\Models\ApiRequestLog;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);

    $this->apiKey = WorkspaceApiKey::factory()->create(['workspace_id' => $this->workspace->id]);
});

it('requires authentication', function () {
    $this->get('/workspaces/api-usage/logs')->assertRedirect('/login');
});

it('returns logs page for workspace owner', function () {
    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('workspaces/api-usage/logs'));
});

it('forbids non-owners from viewing logs', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/workspaces/api-usage/logs')
        ->assertForbidden();
});

it('returns paginated logs with correct structure', function () {
    ApiRequestLog::factory()->count(3)->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('logs')
            ->has('logs.data')
            ->has('logs.current_page')
            ->has('logs.last_page')
            ->has('logs.total')
            ->has('filters')
        );
});

it('only returns logs for the current workspace', function () {
    $otherWorkspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $otherKey = WorkspaceApiKey::factory()->create(['workspace_id' => $otherWorkspace->id]);

    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'path' => 'api/v1/mine',
    ]);

    ApiRequestLog::factory()->create([
        'workspace_id' => $otherWorkspace->id,
        'api_key_id' => $otherKey->id,
        'path' => 'api/v1/other',
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
            ->where('logs.data.0.path', 'api/v1/mine')
        );
});

it('filters logs by method', function () {
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'method' => 'GET',
    ]);
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'method' => 'POST',
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs?method=GET')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
            ->where('logs.data.0.method', 'GET')
            ->where('filters.method', 'GET')
        );
});

it('filters logs by status group', function () {
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'status_code' => 200,
    ]);
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'status_code' => 404,
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs?status=4xx')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
            ->where('logs.data.0.status_code', 404)
        );
});

it('filters logs by path search', function () {
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'path' => 'api/v1/users',
    ]);
    ApiRequestLog::factory()->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
        'path' => 'api/v1/orders',
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs?path=users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
            ->where('logs.data.0.path', 'api/v1/users')
        );
});

it('paginates with 15 items per page', function () {
    ApiRequestLog::factory()->count(20)->create([
        'workspace_id' => $this->workspace->id,
        'api_key_id' => $this->apiKey->id,
    ]);

    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 20)
            ->where('logs.per_page', 15)
            ->where('logs.last_page', 2)
        );
});

it('passes filters back to the page', function () {
    $this->actingAs($this->user)
        ->get('/workspaces/api-usage/logs?method=POST&status=4xx&path=users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.method', 'POST')
            ->where('filters.status', '4xx')
            ->where('filters.path', 'users')
        );
});
