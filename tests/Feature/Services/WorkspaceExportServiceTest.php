<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Services\WorkspaceExportService;

it('returns workspace basic info', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data)->toHaveKey('workspace');
    expect($data['workspace']['id'])->toBe($workspace->id);
    expect($data['workspace']['name'])->toBe($workspace->name);
    expect($data['workspace']['slug'])->toBe($workspace->slug);
});

it('returns workspace members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
    $workspace->users()->attach($owner->id, ['role' => 'owner']);
    $workspace->users()->attach($member->id, ['role' => 'member']);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data['members'])->toHaveCount(2);
    expect(collect($data['members'])->pluck('email')->toArray())
        ->toContain($owner->email, $member->email);
});

it('returns workspace invitations', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    WorkspaceInvitation::create([
        'workspace_id' => $workspace->id,
        'email' => 'invited@example.com',
        'role' => 'member',
    ]);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data['invitations'])->toHaveCount(1);
    expect($data['invitations'][0]['email'])->toBe('invited@example.com');
});

it('returns webhook endpoints', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    WebhookEndpoint::factory()->create([
        'workspace_id' => $workspace->id,
        'url' => 'https://example.com/webhook',
    ]);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data['webhook_endpoints'])->toHaveCount(1);
    expect($data['webhook_endpoints'][0]['url'])->toBe('https://example.com/webhook');
});

it('handles workspace with no related data', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data['invitations'])->toBeEmpty();
    expect($data['api_keys'])->toBeEmpty();
    expect($data['webhook_endpoints'])->toBeEmpty();
    expect($data['members'])->toHaveCount(1); // Just the owner
});

it('returns export data with correct structure', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);

    $service = new WorkspaceExportService;
    $data = $service->getExportData($workspace);

    expect($data)->toHaveKeys([
        'workspace',
        'members',
        'invitations',
        'api_keys',
        'webhook_endpoints',
        'activity_logs',
    ]);
});
