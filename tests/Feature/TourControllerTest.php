<?php

use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create(['tour_completed_at' => null]);
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);
});

it('authenticated user can mark tour as complete', function () {
    actingAs($this->user)
        ->postJson('/tour/complete')
        ->assertOk()
        ->assertJson(['success' => true]);
});

it('sets tour_completed_at after POST', function () {
    actingAs($this->user)->postJson('/tour/complete');

    expect($this->user->fresh()->tour_completed_at)->not->toBeNull();
});

it('unauthenticated request returns 401', function () {
    $this->postJson('/tour/complete')->assertUnauthorized();
});
