<?php

use App\Models\ImpersonationLog;
use App\Models\User;
use Carbon\Carbon;

test('impersonation creates an audit log', function () {
    $superadmin = User::factory()->superadmin()->create();
    $targetUser = User::factory()->create();

    $this->actingAs($superadmin);

    $response = $this->post(route('admin.impersonate', $targetUser));

    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('impersonation_logs', [
        'impersonator_id' => $superadmin->id,
        'impersonated_id' => $targetUser->id,
        'ended_at' => null,
    ]);

    $log = ImpersonationLog::first();
    expect($log->started_at)->not->toBeNull();
});

test('leaving impersonation updates the audit log ended_at', function () {
    $superadmin = User::factory()->superadmin()->create();
    $targetUser = User::factory()->create();

    // First simulate starting the impersonation
    $this->actingAs($superadmin)
        ->withSession(['impersonated_by' => $superadmin->id])
        ->post(route('admin.impersonate', $targetUser));

    $log = ImpersonationLog::first();
    expect($log->ended_at)->toBeNull();

    Carbon::setTestNow(now()->addMinutes(5));

    // Now leave impersonation
    $response = $this->actingAs($targetUser)->post(route('admin.impersonate.leave'));
    $response->assertRedirect(route('admin.dashboard'));

    $log->refresh();

    expect($log->ended_at)->not->toBeNull();
    $this->assertDatabaseHas('impersonation_logs', [
        'id' => $log->id,
        'ended_at' => now()->toDateTimeString(),
    ]);

    Carbon::setTestNow();
});

test('only superadmins can view impersonation logs', function () {
    $superadmin = User::factory()->superadmin()->create();
    $user = User::factory()->create();

    ImpersonationLog::create([
        'impersonator_id' => $superadmin->id,
        'impersonated_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'started_at' => now(),
    ]);

    $this->actingAs($superadmin)
        ->get(route('admin.impersonation-logs.index'))
        ->assertSuccessful();

    $this->actingAs($user)
        ->get(route('admin.impersonation-logs.index'))
        ->assertForbidden();
});
