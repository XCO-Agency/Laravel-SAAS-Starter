<?php

use App\Listeners\LogFailedLogin;
use App\Listeners\LogSuccessfulLogin;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;

it('logs successful login activity', function () {
    $user = User::factory()->create();

    $event = new Login('web', $user, false);
    $listener = new LogSuccessfulLogin;
    $listener->handle($event);

    $activity = LoginActivity::where('user_id', $user->id)->first();

    expect($activity)->not->toBeNull();
    expect($activity->is_successful)->toBeTrue();
    expect($activity->email)->toBe($user->email);
});

it('logs failed login activity with user', function () {
    $user = User::factory()->create();

    $event = new Failed('web', $user, ['email' => $user->email, 'password' => 'wrong']);
    $listener = new LogFailedLogin;
    $listener->handle($event);

    $activity = LoginActivity::where('email', $user->email)->first();

    expect($activity)->not->toBeNull();
    expect($activity->is_successful)->toBeFalse();
    expect($activity->user_id)->toBe($user->id);
});

it('logs failed login activity without user', function () {
    $event = new Failed('web', null, ['email' => 'unknown@example.com', 'password' => 'wrong']);
    $listener = new LogFailedLogin;
    $listener->handle($event);

    $activity = LoginActivity::where('email', 'unknown@example.com')->first();

    expect($activity)->not->toBeNull();
    expect($activity->is_successful)->toBeFalse();
    expect($activity->user_id)->toBeNull();
});
