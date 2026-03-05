<?php

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Validation\ValidationException;

it('creates a user with valid input', function () {
    $action = app(CreateNewUser::class);

    $user = $action->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    expect($user)->toBeInstanceOf(User::class);
    expect($user->name)->toBe('John Doe');
    expect($user->email)->toBe('john@example.com');
    expect($user->exists)->toBeTrue();
});

it('fails validation when name is missing', function () {
    $action = app(CreateNewUser::class);

    $action->create([
        'email' => 'john@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);
})->throws(ValidationException::class);

it('fails validation when email is invalid', function () {
    $action = app(CreateNewUser::class);

    $action->create([
        'name' => 'John Doe',
        'email' => 'not-an-email',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);
})->throws(ValidationException::class);

it('fails validation when email is already taken', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $action = app(CreateNewUser::class);

    $action->create([
        'name' => 'John Doe',
        'email' => 'existing@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);
})->throws(ValidationException::class);

it('fails validation when password confirmation does not match', function () {
    $action = app(CreateNewUser::class);

    $action->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'DifferentPassword!',
    ]);
})->throws(ValidationException::class);

it('fails validation when password is missing', function () {
    $action = app(CreateNewUser::class);

    $action->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
})->throws(ValidationException::class);

it('hashes the password', function () {
    $action = app(CreateNewUser::class);

    $user = $action->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    expect($user->password)->not->toBe('Password123!');
    expect(Hash::check('Password123!', $user->password))->toBeTrue();
});
