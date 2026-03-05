<?php

use App\Models\PasswordHistory;
use App\Models\User;
use App\Services\WorkspaceService;

beforeEach(function () {
    $this->user = User::factory()->create();
    app(WorkspaceService::class)->createPersonalWorkspace($this->user);
});

it('records a password change in the history', function () {
    $this->actingAs($this->user)
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

    expect(PasswordHistory::where('user_id', $this->user->id)->count())->toBe(1);

    $entry = PasswordHistory::where('user_id', $this->user->id)->first();
    expect($entry->ip_address)->not->toBeNull();
    expect($entry->changed_at)->not->toBeNull();
});

it('displays password history on the settings page', function () {
    PasswordHistory::create([
        'user_id' => $this->user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'TestBrowser/1.0',
        'changed_at' => now()->subDays(3),
    ]);

    PasswordHistory::create([
        'user_id' => $this->user->id,
        'ip_address' => '10.0.0.1',
        'user_agent' => 'MobileBrowser/2.0',
        'changed_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($this->user)
        ->get('/settings/password');

    $response->assertSuccessful();
    $response->assertInertia(
        fn ($page) => $page
            ->has('passwordHistory', 2)
    );
});

it('limits history to 10 entries', function () {
    for ($i = 0; $i < 15; $i++) {
        PasswordHistory::create([
            'user_id' => $this->user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'changed_at' => now()->subDays($i),
        ]);
    }

    $response = $this->actingAs($this->user)
        ->get('/settings/password');

    $response->assertInertia(
        fn ($page) => $page
            ->has('passwordHistory', 10)
    );
});

it('does not show other users password history', function () {
    $otherUser = User::factory()->create();
    app(WorkspaceService::class)->createPersonalWorkspace($otherUser);

    PasswordHistory::create([
        'user_id' => $otherUser->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'changed_at' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get('/settings/password');

    $response->assertInertia(
        fn ($page) => $page
            ->has('passwordHistory', 0)
    );
});

it('restricts password history to authenticated users', function () {
    $this->get('/settings/password')->assertRedirect('/login');
});
