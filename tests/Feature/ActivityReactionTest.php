<?php

use App\Models\ActivityReaction;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->user->workspaces()->attach($this->workspace, ['role' => 'owner']);
    $this->user->switchWorkspace($this->workspace);
});

it('allows user to add reaction to activity', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/reactions", [
            'activity_id' => 1,
            'reaction' => '👍',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.added', true);

    $this->assertDatabaseHas('activity_reactions', [
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);
});

it('toggles reaction off when adding same reaction again', function () {
    // First reaction
    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);

    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/reactions", [
            'activity_id' => 1,
            'reaction' => '👍',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.added', false);

    $this->assertDatabaseMissing('activity_reactions', [
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);
});

it('validates reaction is required', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/reactions", [
            'activity_id' => 1,
            'reaction' => '',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['reaction']);
});

it('validates activity_id is required', function () {
    $response = $this->actingAs($this->user)
        ->postJson("/workspaces/{$this->workspace->id}/reactions", [
            'reaction' => '👍',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['activity_id']);
});

it('allows user to remove their reaction', function () {
    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '❤️',
    ]);

    $response = $this->actingAs($this->user)
        ->deleteJson("/workspaces/{$this->workspace->id}/activities/1/reactions", [
            'reaction' => '❤️',
        ]);

    $response->assertOk();

    $this->assertDatabaseMissing('activity_reactions', [
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '❤️',
    ]);
});

it('lists reactions grouped by type for an activity', function () {
    $user2 = User::factory()->create();
    $user2->workspaces()->attach($this->workspace, ['role' => 'member']);

    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);

    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $user2->id,
        'reaction' => '👍',
    ]);

    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '🎉',
    ]);

    $response = $this->actingAs($this->user)
        ->getJson("/workspaces/{$this->workspace->id}/reactions?activity_id=1");

    $response->assertOk();

    $data = $response->json('data');
    expect($data['👍']['count'])->toBe(2);
    expect($data['🎉']['count'])->toBe(1);
    expect($data['👍']['has_reacted'])->toBeTrue();
});

it('prevents duplicate reactions from same user with same emoji', function () {
    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);

    // Try to create duplicate (should toggle off instead)
    $result = ActivityReaction::toggle(1, $this->user->id, '👍');

    expect($result)->toBeFalse(); // Reaction removed
    expect(ActivityReaction::where('activity_id', 1)->count())->toBe(0);
});

it('returns grouped reactions with correct counts', function () {
    $user2 = User::factory()->create();
    $user3 = User::factory()->create();

    ActivityReaction::create(['activity_id' => 1, 'user_id' => $this->user->id, 'reaction' => '👍']);
    ActivityReaction::create(['activity_id' => 1, 'user_id' => $user2->id, 'reaction' => '👍']);
    ActivityReaction::create(['activity_id' => 1, 'user_id' => $user3->id, 'reaction' => '👍']);
    ActivityReaction::create(['activity_id' => 1, 'user_id' => $this->user->id, 'reaction' => '❤️']);

    $grouped = ActivityReaction::getGroupedForActivity(1);

    expect($grouped)->toHaveCount(2);

    $thumbsUp = collect($grouped)->firstWhere('reaction', '👍');
    $heart = collect($grouped)->firstWhere('reaction', '❤️');

    expect($thumbsUp['count'])->toBe(3);
    expect($heart['count'])->toBe(1);
    expect($thumbsUp['user_ids'])->toContain($this->user->id);
});

it('checks if user has reacted with specific emoji', function () {
    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '🎉',
    ]);

    expect(ActivityReaction::hasUserReacted(1, $this->user->id, '🎉'))->toBeTrue();
    expect(ActivityReaction::hasUserReacted(1, $this->user->id, '👍'))->toBeFalse();
});

it('allows multiple different reactions from same user', function () {
    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '👍',
    ]);

    ActivityReaction::create([
        'activity_id' => 1,
        'user_id' => $this->user->id,
        'reaction' => '❤️',
    ]);

    expect(ActivityReaction::where('activity_id', 1)->count())->toBe(2);
    expect(ActivityReaction::hasUserReacted(1, $this->user->id, '👍'))->toBeTrue();
    expect(ActivityReaction::hasUserReacted(1, $this->user->id, '❤️'))->toBeTrue();
});
