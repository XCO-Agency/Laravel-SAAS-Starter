<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('requires authentication to access the api tokens page', function () {
    $response = $this->get('/settings/api-tokens');

    $response->assertRedirect('/login');
});

it('allows an authenticated user to view the api tokens page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings/api-tokens');

    $response->assertSuccessful();

    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('settings/api-tokens')
        ->has('tokens') // Verify it passes down the token collection
    );
});

it('allows a user to create a new api token', function () {
    $user = User::factory()->create();

    $this->assertCount(0, $user->tokens);

    $response = $this->actingAs($user)->post('/settings/api-tokens', [
        'name' => 'GitHub Actions',
    ]);

    $response->assertRedirect(); // Typically redirects back

    // Assert flash session token
    $response->assertSessionHas('token');

    // Re-fetch user explicitly to check relationships
    $user->refresh();

    $this->assertCount(1, $user->tokens);
    $this->assertEquals('GitHub Actions', $user->tokens->first()->name);
});

it('requires a name when creating an api token', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/api-tokens', [
        'name' => '',
    ]);

    $response->assertSessionHasErrors('name');
    $this->assertCount(0, $user->tokens);
});

it('allows users to revoke their own api tokens', function () {
    $user = User::factory()->create();

    $token = $user->createToken('My Phone');

    $this->assertCount(1, $user->tokens);

    $response = $this->actingAs($user)->delete("/settings/api-tokens/{$token->accessToken->id}");

    $response->assertRedirect();

    $user->refresh();

    $this->assertCount(0, $user->tokens);
});
