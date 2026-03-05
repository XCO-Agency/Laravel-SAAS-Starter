<?php

use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

it('resets the user password', function () {
    $user = User::factory()->create(['password' => 'OldPassword123!']);

    $action = new ResetUserPassword;

    $action->reset($user, [
        'password' => 'NewPassword456!',
        'password_confirmation' => 'NewPassword456!',
    ]);

    $user->refresh();

    expect(Hash::check('NewPassword456!', $user->password))->toBeTrue();
});

it('sets password_updated_at timestamp', function () {
    $user = User::factory()->create(['password_updated_at' => null]);

    $action = new ResetUserPassword;

    $action->reset($user, [
        'password' => 'NewPassword456!',
        'password_confirmation' => 'NewPassword456!',
    ]);

    $user->refresh();

    expect($user->password_updated_at)->not->toBeNull();
});

it('fails validation when password confirmation does not match', function () {
    $user = User::factory()->create();

    $action = new ResetUserPassword;

    $action->reset($user, [
        'password' => 'NewPassword456!',
        'password_confirmation' => 'DifferentPassword!',
    ]);
})->throws(ValidationException::class);

it('fails validation when password is missing', function () {
    $user = User::factory()->create();

    $action = new ResetUserPassword;

    $action->reset($user, []);
})->throws(ValidationException::class);
