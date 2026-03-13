<?php

use App\Models\User;
use App\Models\Workspace;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);

    // Clear setup-generated activity log entries so tests start clean.
    Activity::query()->delete();
});

it('requires authentication', function () {
    $this->getJson('/workspace-activity-feed')->assertUnauthorized();
});

it('returns empty activities when there are none', function () {
    $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk()
        ->assertJsonCount(0, 'activities');
});

it('returns activities for the current workspace', function () {
    activity()
        ->on($this->workspace)
        ->event('updated')
        ->log('Workspace updated');

    $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk()
        ->assertJsonCount(1, 'activities')
        ->assertJsonPath('activities.0.description', 'Workspace updated')
        ->assertJsonPath('activities.0.event', 'updated');
});

it('returns at most 5 activities', function () {
    for ($i = 0; $i < 8; $i++) {
        activity()
            ->on($this->workspace)
            ->event('updated')
            ->log("Event $i");
    }

    $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk()
        ->assertJsonCount(5, 'activities');
});

it('returns activities with required fields', function () {
    activity()
        ->causedBy($this->user)
        ->on($this->workspace)
        ->event('created')
        ->log('Something happened');

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk();

    $entry = $response->json('activities.0');
    expect($entry)->toHaveKeys(['id', 'description', 'event', 'subject_type', 'causer_name', 'created_at']);
    expect($entry['causer_name'])->toBe($this->user->name);
    expect($entry['subject_type'])->toBe('Workspace');
});

it('shows System as causer when no user caused the activity', function () {
    activity()
        ->on($this->workspace)
        ->event('updated')
        ->log('System action');

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk();

    expect($response->json('activities.0.causer_name'))->toBe('System');
});

it('does not return activities from other workspaces', function () {
    $otherWorkspace = Workspace::factory()->create();

    activity()
        ->on($otherWorkspace)
        ->event('updated')
        ->log('Other workspace event');

    $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk()
        ->assertJsonCount(0, 'activities');
});

it('returns activities in descending chronological order', function () {
    activity()->on($this->workspace)->event('created')->log('First');
    activity()->on($this->workspace)->event('updated')->log('Second');
    activity()->on($this->workspace)->event('deleted')->log('Third');

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-activity-feed')
        ->assertOk();

    $descriptions = collect($response->json('activities'))->pluck('description')->values();
    expect($descriptions->first())->toBe('Third');
    expect($descriptions->last())->toBe('First');
});
