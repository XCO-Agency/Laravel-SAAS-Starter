<?php

use App\Models\User;
use App\Models\Workspace;

it('returns 0% when no optional fields are filled', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => null,
        'bio' => null,
        'timezone' => 'UTC', // Default — counts as not configured
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['score'])->toBe(0);
    expect($result['missing'])->toHaveCount(4);
});

it('returns 100% when all fields are filled', function () {
    $user = User::factory()->create([
        'avatar_url' => 'https://example.com/avatar.jpg',
        'bio' => 'A short bio',
        'timezone' => 'America/New_York',
        'two_factor_confirmed_at' => now(),
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['score'])->toBe(100);
    expect($result['missing'])->toBeEmpty();
});

it('returns 25% when only avatar is set', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => 'https://example.com/avatar.jpg',
        'bio' => null,
        'timezone' => 'UTC',
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['score'])->toBe(25);
    expect($result['missing'])->toContain('Bio');
    expect($result['missing'])->toContain('Timezone');
    expect($result['missing'])->toContain('Two-factor authentication');
});

it('lists the correct missing fields', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => null,
        'bio' => 'I have a bio',
        'timezone' => 'UTC',
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['missing'])->toContain('Profile photo');
    expect($result['missing'])->toContain('Timezone');
    expect($result['missing'])->toContain('Two-factor authentication');
    expect($result['missing'])->not->toContain('Bio');
});

it('treats UTC timezone as not configured', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => null,
        'bio' => null,
        'timezone' => 'UTC',
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['missing'])->toContain('Timezone');
});

it('treats non-UTC timezone as configured', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => null,
        'bio' => null,
        'timezone' => 'Europe/Paris',
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['missing'])->not->toContain('Timezone');
});

it('profile completeness is shared in Inertia shared data', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => null,
        'bio' => null,
        'timezone' => 'UTC',
    ]);
    $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
    $workspace->addUser($user, 'owner');
    $user->switchWorkspace($workspace);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('auth.user.profile_completeness')
            ->has('auth.user.profile_completeness.score')
            ->has('auth.user.profile_completeness.missing')
            ->where('auth.user.profile_completeness.score', 0)
        );
});

it('returns 50% when two fields are filled', function () {
    $user = User::factory()->withoutTwoFactor()->create([
        'avatar_url' => 'https://example.com/avatar.jpg',
        'bio' => 'My bio',
        'timezone' => 'UTC',
    ]);

    $result = $user->profileCompletenessScore();

    expect($result['score'])->toBe(50);
});
