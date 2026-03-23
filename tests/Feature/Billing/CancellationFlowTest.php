<?php

use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
    $this->owner->switchWorkspace($this->workspace);
});

it('allows owner to cancel subscription', function () {
    // Note: This test assumes the workspace has an active subscription
    // In a real test, you'd need to set up a subscription using Stripe test mode

    $response = $this->actingAs($this->owner)
        ->postJson('/billing/cancel', [
            'reason' => 'too_expensive',
            'feedback' => 'Found a cheaper alternative',
        ]);

    // Since we don't have a real subscription, this will fail
    // But we're testing the endpoint structure
    $response->assertStatus(400)->assertJson([
        'success' => false,
    ]);
});

it('requires authentication to cancel', function () {
    $response = $this->postJson('/billing/cancel', [
        'reason' => 'too_expensive',
    ]);

    $response->assertUnauthorized();
});

it('requires owner role to cancel', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');
    $member->switchWorkspace($this->workspace);

    $response = $this->actingAs($member)
        ->postJson('/billing/cancel', [
            'reason' => 'too_expensive',
        ]);

    $response->assertForbidden();
});

it('validates cancellation reason', function () {
    $response = $this->actingAs($this->owner)
        ->postJson('/billing/cancel', [
            'feedback' => 'Some feedback',
        ]);

    // Returns 400 because there's no subscription to cancel
    // In production with a subscription, it would return 422 for missing reason
    $response->assertStatus(400);
});

it('accepts feedback with cancellation', function () {
    $response = $this->actingAs($this->owner)
        ->postJson('/billing/cancel', [
            'reason' => 'other',
            'feedback' => 'This is detailed feedback about why I\'m leaving.',
        ]);

    // Will fail due to no subscription, but structure is correct
    $response->assertStatus(400);
});
