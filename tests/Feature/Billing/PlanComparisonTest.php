<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

it('displays plan comparison page', function () {
    $this->actingAs($this->owner)
        ->get('/billing/compare')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Billing/compare')
            ->has('plans')
            ->has('currentPlan')
            ->has('userRole')
        );
});

it('shows all available plans in comparison', function () {
    $this->actingAs($this->owner)
        ->get('/billing/compare')
        ->assertInertia(fn ($page) => $page
            ->component('Billing/compare')
            ->has('plans', 3) // Free, Pro, Business
        );
});

it('identifies current plan correctly', function () {
    $this->workspace->update(['plan_override' => 'pro']);

    $this->actingAs($this->owner)
        ->get('/billing/compare')
        ->assertInertia(fn ($page) => $page
            ->component('Billing/compare')
            ->where('currentPlan', 'pro')
        );
});

it('allows workspace members to view comparison', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $this->actingAs($member)
        ->get('/billing/compare')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Billing/compare')
            ->where('userRole', 'member')
        );
});

it('requires authentication', function () {
    $this->get('/billing/compare')
        ->assertRedirect('/login');
});

it('shows plan limits in comparison data', function () {
    $this->actingAs($this->owner)
        ->get('/billing/compare')
        ->assertInertia(fn ($page) => $page
            ->component('Billing/compare')
            ->has('plans.0.limits')
            ->has('plans.0.features')
            ->has('plans.0.price')
        );
});
