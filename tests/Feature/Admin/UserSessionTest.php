<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('blocks non-superadmins from viewing user sessions', function () {
    $this->actingAs($this->user)
        ->get(route('admin.users.sessions.index', $this->user))
        ->assertForbidden();
});

it('allows superadmins to view user sessions', function () {
    DB::table('sessions')->insert([
        'id' => 'test-session-123',
        'user_id' => $this->user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'payload' => 'dummy',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($this->superadmin)
        ->get(route('admin.users.sessions.index', $this->user))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('admin/user-sessions')
                ->has('sessions', 1)
                ->where('sessions.0.id', 'test-session-123')
        );
});

it('allows superadmin to terminate a specific session', function () {
    DB::table('sessions')->insert([
        'id' => 'test-session-123',
        'user_id' => $this->user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'payload' => 'dummy',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($this->superadmin)
        ->delete(route('admin.users.sessions.destroy', [$this->user, 'test-session-123']))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(DB::table('sessions')->where('id', 'test-session-123')->exists())->toBeFalse();
});

it('allows superadmin to terminate all sessions for a user', function () {
    DB::table('sessions')->insert([
        ['id' => 's1', 'user_id' => $this->user->id, 'payload' => 'd', 'last_activity' => 1],
        ['id' => 's2', 'user_id' => $this->user->id, 'payload' => 'd', 'last_activity' => 1],
        ['id' => 's3', 'user_id' => $this->superadmin->id, 'payload' => 'd', 'last_activity' => 1],
    ]);

    $this->actingAs($this->superadmin)
        ->delete(route('admin.users.sessions.destroy-all', $this->user))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(DB::table('sessions')->where('user_id', $this->user->id)->count())->toBe(0)
        ->and(DB::table('sessions')->where('user_id', $this->superadmin->id)->count())->toBe(1);
});

it('blocks non-superadmins from terminating a specific user session', function () {
    DB::table('sessions')->insert([
        'id' => 'test-session-456',
        'user_id' => $this->superadmin->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test Agent',
        'payload' => 'dummy',
        'last_activity' => now()->timestamp,
    ]);

    $this->actingAs($this->user)
        ->delete(route('admin.users.sessions.destroy', [$this->superadmin, 'test-session-456']))
        ->assertForbidden();
});

it('blocks non-superadmins from terminating all sessions for a user', function () {
    DB::table('sessions')->insert([
        ['id' => 'sx-1', 'user_id' => $this->superadmin->id, 'payload' => 'd', 'last_activity' => now()->timestamp],
        ['id' => 'sx-2', 'user_id' => $this->superadmin->id, 'payload' => 'd', 'last_activity' => now()->timestamp],
    ]);

    $this->actingAs($this->user)
        ->delete(route('admin.users.sessions.destroy-all', $this->superadmin))
        ->assertForbidden();

    expect(DB::table('sessions')->where('user_id', $this->superadmin->id)->count())->toBe(2);
});
