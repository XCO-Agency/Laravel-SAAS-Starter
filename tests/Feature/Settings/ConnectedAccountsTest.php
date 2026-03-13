<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->user->id]);
    $this->workspace->addUser($this->user, 'owner');
    $this->user->switchWorkspace($this->workspace);
});

it('redirects guests from connected accounts page', function () {
    $this->get('/settings/connected-accounts')->assertRedirect('/login');
});

it('renders connected accounts page for authenticated user', function () {
    $this->actingAs($this->user)
        ->get('/settings/connected-accounts')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('settings/connected-accounts')
            ->has('providers')
            ->has('hasPassword')
        );
});

it('lists providers with connection status', function () {
    $this->user->connectedAccounts()->create([
        'provider' => 'github',
        'provider_id' => '12345',
        'name' => 'octocat',
        'email' => 'octocat@github.com',
        'avatar' => null,
        'token' => 'token123',
    ]);

    $this->actingAs($this->user)
        ->get('/settings/connected-accounts')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('providers.0.provider', 'github')
            ->where('providers.0.connected', true)
            ->where('providers.0.account.email', 'octocat@github.com')
            ->where('providers.1.provider', 'google')
            ->where('providers.1.connected', false)
        );
});

it('shows hasPassword as true when user has a password', function () {
    $this->actingAs($this->user)
        ->get('/settings/connected-accounts')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hasPassword', true)
        );
});

it('shows hasPassword as false when user has no password', function () {
    DB::statement('UPDATE users SET password = NULL WHERE id = ?', [$this->user->id]);
    $this->user->refresh();

    $this->actingAs($this->user)
        ->get('/settings/connected-accounts')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hasPassword', false)
        );
});

it('can disconnect a connected account', function () {
    $this->user->connectedAccounts()->create([
        'provider' => 'github',
        'provider_id' => '12345',
        'name' => 'octocat',
        'email' => 'octocat@github.com',
        'token' => 'token123',
    ]);

    $this->actingAs($this->user)
        ->delete('/settings/connected-accounts/github')
        ->assertRedirect();

    expect($this->user->connectedAccounts()->where('provider', 'github')->exists())->toBeFalse();
});

it('cannot disconnect the only login method when user has no password', function () {
    DB::statement('UPDATE users SET password = NULL WHERE id = ?', [$this->user->id]);
    $this->user->refresh();

    $this->user->connectedAccounts()->create([
        'provider' => 'github',
        'provider_id' => '12345',
        'name' => 'octocat',
        'email' => 'octocat@github.com',
        'token' => 'token123',
    ]);

    $this->actingAs($this->user)
        ->delete('/settings/connected-accounts/github')
        ->assertRedirect();

    // Account should still exist
    expect($this->user->connectedAccounts()->where('provider', 'github')->exists())->toBeTrue();
});

it('rejects invalid provider names', function () {
    $this->actingAs($this->user)
        ->delete('/settings/connected-accounts/fakeProvider')
        ->assertRedirect();

    expect(session('error'))->toBe('Invalid provider.');
});

it('returns redirect when trying to disconnect a non-existent account', function () {
    $this->actingAs($this->user)
        ->delete('/settings/connected-accounts/github')
        ->assertRedirect();

    expect(session('error'))->toBe('No connected account found for this provider.');
});
