<?php

use App\Models\LoginActivity;
use App\Models\User;
use App\Models\Workspace;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);
});

it('requires authentication', function () {
    $this->getJson('/workspace-retention-insights')->assertUnauthorized();
});

it('returns retention data structure', function () {
    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    $response->assertJsonStructure(['total_members', 'active_last_30_days', 'retention_rate']);
});

it('counts total workspace members', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('total_members'))->toBe(2);
});

it('counts members active in the last 30 days', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');

    LoginActivity::create([
        'user_id' => $member->id,
        'email' => $member->email,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'login_at' => now()->subDays(10),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('active_last_30_days'))->toBe(1);
});

it('excludes login activity older than 30 days', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');

    LoginActivity::create([
        'user_id' => $member->id,
        'email' => $member->email,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'login_at' => now()->subDays(45),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('active_last_30_days'))->toBe(0);
});

it('excludes failed login attempts', function () {
    LoginActivity::create([
        'user_id' => $this->user->id,
        'email' => $this->user->email,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'login_at' => now()->subDays(5),
        'is_successful' => false,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('active_last_30_days'))->toBe(0);
});

it('calculates retention rate correctly', function () {
    $member = User::factory()->create();
    $this->workspace->addUser($member, 'member');

    // Only the member logged in recently (not the owner)
    LoginActivity::create([
        'user_id' => $member->id,
        'email' => $member->email,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'login_at' => now()->subDays(5),
        'is_successful' => true,
    ]);

    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('retention_rate'))->toBe(50); // 1 of 2 members active
});

it('returns 0 retention rate when no members exist', function () {
    $emptyWorkspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $emptyWorkspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($emptyWorkspace);

    // No additional members — just the owner (1 member, 0 active)
    $response = $this->actingAs($this->user)
        ->getJson('/workspace-retention-insights')
        ->assertOk();

    expect($response->json('total_members'))->toBe(1);
    expect($response->json('active_last_30_days'))->toBe(0);
    expect($response->json('retention_rate'))->toBe(0);
});
