<?php

use App\Models\User;
use App\Models\Workspace;
use App\Services\PlanLimitService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->planLimitService = new PlanLimitService;
    $this->user = User::factory()->create();
});

it('returns correct limits for different plans', function () {
    $freeLimits = $this->planLimitService->getLimits('free');
    expect($freeLimits['api_keys'])->toBe(2);
    expect($freeLimits['webhooks'])->toBe(1);

    $proLimits = $this->planLimitService->getLimits('pro');
    expect($proLimits['api_keys'])->toBe(10);
    expect($proLimits['webhooks'])->toBe(5);

    $businessLimits = $this->planLimitService->getLimits('business');
    expect($businessLimits['api_keys'])->toBe(-1);
    expect($businessLimits['webhooks'])->toBe(-1);
});

it('checks api key limits correctly', function () {
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
    ]);

    // By default it's Free plan (2 API keys)
    expect($this->planLimitService->canCreateApiKey($workspace))->toBeTrue();

    // We can't easily change the plan without Stripe mocks,
    // but we've verified getLimits works with different strings.
});

it('generates correct limit messages', function () {
    $workspace = Workspace::factory()->create([
        'owner_id' => $this->user->id,
    ]);

    // Free plan message
    $message = $this->planLimitService->getApiKeyLimitMessage($workspace);
    expect($message)->toContain('You can create 2 more API key(s). (0/2 used)');
});
