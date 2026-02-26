<?php

use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->withoutTwoFactor()->create(['onboarded_at' => now()]);
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);
});

it('blocks guests from the onboarding checklist', function () {
    $this->getJson('/onboarding-checklist')
        ->assertUnauthorized();
});

it('returns the checklist steps for authenticated users', function () {
    actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk()
        ->assertJsonStructure([
            'dismissed',
            'steps' => [
                '*' => ['id', 'label', 'description', 'completed', 'href'],
            ],
            'completed',
            'total',
        ])
        ->assertJson(['dismissed' => false, 'total' => 4]);
});

it('marks complete_profile as completed when user has a bio', function () {
    $this->user->update(['bio' => 'Hello world']);

    $response = actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk();

    $steps = collect($response->json('steps'));
    expect($steps->firstWhere('id', 'complete_profile')['completed'])->toBeTrue();
});

it('marks enable_2fa as completed when 2FA is confirmed', function () {
    $this->user->forceFill(['two_factor_confirmed_at' => now()])->save();

    $response = actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk();

    $steps = collect($response->json('steps'));
    expect($steps->firstWhere('id', 'enable_2fa')['completed'])->toBeTrue();
});

it('marks invite_member as completed when workspace has more than one user', function () {
    $another = User::factory()->create();
    $this->workspace->addUser($another, 'member');

    $response = actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk();

    $steps = collect($response->json('steps'));
    expect($steps->firstWhere('id', 'invite_member')['completed'])->toBeTrue();
});

it('allows dismissing the onboarding checklist', function () {
    actingAs($this->user)
        ->postJson('/onboarding-checklist/dismiss')
        ->assertOk()
        ->assertJson(['success' => true]);

    $this->user->refresh();
    expect($this->user->onboarding_checklist_dismissed_at)->not->toBeNull();
});

it('returns dismissed state after checklist is dismissed', function () {
    $this->user->update(['onboarding_checklist_dismissed_at' => now()]);

    actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk()
        ->assertJson(['dismissed' => true, 'steps' => []]);
});

it('counts completed steps correctly', function () {
    // No bio, no 2FA, only 1 user, no subscription — should have 0/4 complete
    $response = actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk();

    expect($response->json('completed'))->toBe(0);
    expect($response->json('total'))->toBe(4);

    // Set bio — 1/4 complete
    $this->user->update(['bio' => 'Test bio']);

    $response = actingAs($this->user)
        ->getJson('/onboarding-checklist')
        ->assertOk();

    expect($response->json('completed'))->toBe(1);
});
