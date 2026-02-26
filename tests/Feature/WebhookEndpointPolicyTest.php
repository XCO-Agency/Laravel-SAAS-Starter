<?php

use App\Models\User;
use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->workspace = Workspace::factory()->create();
    $this->owner = User::factory()->create();
    $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);

    $this->member = User::factory()->create();
    $this->workspace->users()->attach($this->member->id, ['role' => 'member']);

    $this->stranger = User::factory()->create();
});

test('owner can manage webhooks', function () {
    expect(Gate::forUser($this->owner)->allows('viewAny', [WebhookEndpoint::class, $this->workspace]))->toBeTrue();

    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $this->workspace->id]);
    expect(Gate::forUser($this->owner)->allows('view', $endpoint))->toBeTrue();
    expect(Gate::forUser($this->owner)->allows('create', [WebhookEndpoint::class, $this->workspace]))->toBeTrue();
    expect(Gate::forUser($this->owner)->allows('update', $endpoint))->toBeTrue();
    expect(Gate::forUser($this->owner)->allows('delete', $endpoint))->toBeTrue();
});

test('member without permission cannot manage webhooks', function () {
    // By default members don't have manage_webhooks in most SaaS starters unless granted
    // We assume the default 'member' role doesn't have it based on WorkspacePolicy logic seen earlier.

    expect(Gate::forUser($this->member)->allows('viewAny', [WebhookEndpoint::class, $this->workspace]))->toBeFalse();

    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $this->workspace->id]);
    expect(Gate::forUser($this->member)->allows('view', $endpoint))->toBeFalse();
});

test('stranger cannot manage webhooks', function () {
    expect(Gate::forUser($this->stranger)->allows('viewAny', [WebhookEndpoint::class, $this->workspace]))->toBeFalse();

    $endpoint = WebhookEndpoint::factory()->create(['workspace_id' => $this->workspace->id]);
    expect(Gate::forUser($this->stranger)->allows('view', $endpoint))->toBeFalse();
});
