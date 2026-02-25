<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Notification;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->users()->attach($this->owner, ['role' => 'owner']);
    $this->owner->update(['current_workspace_id' => $this->workspace->id]);
});

it('reports the correct seat count', function () {
    // Owner is already attached (1 seat)
    expect($this->workspace->activeSeatCount())->toBe(1);

    $member = User::factory()->create();
    $this->workspace->users()->attach($member, ['role' => 'member']);

    expect($this->workspace->activeSeatCount())->toBe(2);
});

it('returns the correct seat limit for the free plan', function () {
    // Workspace defaults to Free plan (no Stripe subscription)
    expect($this->workspace->seatLimit())->toBe(2);
});

it('has an available seat when under the limit', function () {
    // Only the owner — 1 of 2 used
    expect($this->workspace->hasAvailableSeat())->toBeTrue();
});

it('has no available seat when at the free limit', function () {
    $member = User::factory()->create();
    $this->workspace->users()->attach($member, ['role' => 'member']);

    // 2 of 2 used — at limit
    expect($this->workspace->hasAvailableSeat())->toBeFalse();
});

it('blocks invitation when workspace is at the seat limit', function () {
    $member = User::factory()->create();
    $this->workspace->users()->attach($member, ['role' => 'member']);

    actingAs($this->owner)
        ->post('/team/invite', ['email' => 'new@example.com', 'role' => 'member'])
        ->assertRedirect()
        ->assertSessionHas('error');
});

it('allows invitation when under the seat limit', function () {
    Notification::fake();

    // Only owner — 1 of 2 used
    actingAs($this->owner)
        ->post('/team/invite', ['email' => 'new@example.com', 'role' => 'member'])
        ->assertRedirect()
        ->assertSessionMissing('error');
});
