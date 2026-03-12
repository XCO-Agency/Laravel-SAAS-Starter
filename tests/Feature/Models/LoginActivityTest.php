<?php

use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Support\Carbon;

it('belongs to a user', function () {
    $user = User::factory()->create();
    $activity = LoginActivity::factory()->create(['user_id' => $user->id]);

    expect($activity->user)->toBeInstanceOf(User::class);
    expect($activity->user->id)->toBe($user->id);
});

it('casts is_successful to boolean', function () {
    $activity = LoginActivity::factory()->create(['is_successful' => 1]);
    expect($activity->is_successful)->toBeTrue();
});

it('casts login_at to datetime', function () {
    $activity = LoginActivity::factory()->create(['login_at' => '2025-01-01 12:00:00']);
    expect($activity->login_at)->toBeInstanceOf(Carbon::class);
});

it('parses Chrome on Windows user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0.0.0']);
    expect($activity->parsedDevice())->toBe('Chrome on Windows');
});

it('parses Safari on macOS user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15']);
    expect($activity->parsedDevice())->toBe('Safari on macOS');
});

it('parses Firefox on Linux user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0']);
    expect($activity->parsedDevice())->toBe('Firefox on Linux');
});

it('parses Edge on Windows user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0.0.0 Edg/120.0.0.0']);
    expect($activity->parsedDevice())->toBe('Edge on Windows');
});

it('parses mobile Safari on iOS user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1']);
    expect($activity->parsedDevice())->toBe('Safari on iOS');
});

it('parses Chrome on Android user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.6099.0']);
    expect($activity->parsedDevice())->toBe('Chrome on Android');
});

it('handles null user agent gracefully', function () {
    $activity = new LoginActivity(['user_agent' => null]);
    expect($activity->parsedDevice())->toBe('Unknown Browser on Unknown OS');
});

it('handles unknown user agent', function () {
    $activity = new LoginActivity(['user_agent' => 'SomeBot/1.0']);
    expect($activity->parsedDevice())->toBe('Unknown Browser on Unknown OS');
});
