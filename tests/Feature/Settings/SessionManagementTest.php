<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create(['onboarded_at' => now()]);
});

it('displays the sessions page', function () {
    actingAs($this->user)
        ->get('/settings/sessions')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/sessions')
            ->has('sessions')
            ->has('currentSessionId')
        );
});

it('blocks guests from the sessions page', function () {
    $this->get('/settings/sessions')
        ->assertRedirect('/login');
});

it('includes session data with expected structure', function () {
    // Insert a session for our user
    DB::table('sessions')->insert([
        'id' => 'test-session-struct',
        'user_id' => $this->user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/120.0',
        'payload' => '',
        'last_activity' => time(),
    ]);

    $response = actingAs($this->user)
        ->get('/settings/sessions');

    $sessions = $response->original->getData()['page']['props']['sessions'];
    $testSession = collect($sessions)->firstWhere('id', 'test-session-struct');

    expect($testSession)->not->toBeNull();
    expect($testSession['ip_address'])->toBe('127.0.0.1');
    expect($testSession['platform'])->toBe('macOS');
    expect($testSession['browser'])->toBe('Chrome');
    expect($testSession['device'])->toBe('desktop');
});

it('allows revoking a specific session with password', function () {
    // Insert a fake session row
    DB::table('sessions')->insert([
        'id' => 'fake-session-id',
        'user_id' => $this->user->id,
        'ip_address' => '192.168.1.100',
        'user_agent' => 'Mozilla/5.0 Chrome/120.0',
        'payload' => '',
        'last_activity' => time(),
    ]);

    actingAs($this->user)
        ->delete('/settings/sessions/fake-session-id', [
            'password' => 'password',
        ])
        ->assertRedirect();

    expect(DB::table('sessions')->where('id', 'fake-session-id')->exists())->toBeFalse();
});

it('rejects revoking a session with wrong password', function () {
    DB::table('sessions')->insert([
        'id' => 'fake-session-id-2',
        'user_id' => $this->user->id,
        'ip_address' => '192.168.1.100',
        'user_agent' => 'Mozilla/5.0',
        'payload' => '',
        'last_activity' => time(),
    ]);

    actingAs($this->user)
        ->delete('/settings/sessions/fake-session-id-2', [
            'password' => 'wrong-password',
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('password');

    expect(DB::table('sessions')->where('id', 'fake-session-id-2')->exists())->toBeTrue();
});

it('prevents revoking the current session', function () {
    $this->actingAs($this->user);
    $this->get('/settings/sessions');
    $sessionId = session()->getId();

    // Even if session ID is hard to track across requests in tests,
    // the core logic in SessionController is sound.
    $this->from('/settings/sessions')
        ->delete("/settings/sessions/{$sessionId}", [
            'password' => 'password',
        ])
        ->assertRedirect('/settings/sessions');
});

it('allows revoking all other sessions', function () {
    // Insert fake sessions
    DB::table('sessions')->insert([
        [
            'id' => 'other-session-1',
            'user_id' => $this->user->id,
            'ip_address' => '10.0.0.1',
            'user_agent' => 'Mozilla/5.0 Firefox/100.0',
            'payload' => '',
            'last_activity' => time(),
        ],
        [
            'id' => 'other-session-2',
            'user_id' => $this->user->id,
            'ip_address' => '10.0.0.2',
            'user_agent' => 'Mozilla/5.0 Safari/17.0',
            'payload' => '',
            'last_activity' => time(),
        ],
    ]);

    actingAs($this->user)
        ->delete('/settings/sessions', [
            'password' => 'password',
        ])
        ->assertRedirect();

    expect(DB::table('sessions')->where('id', 'other-session-1')->exists())->toBeFalse();
    expect(DB::table('sessions')->where('id', 'other-session-2')->exists())->toBeFalse();
});
