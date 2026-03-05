<?php

use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

it('passes validation with valid profile data', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'timezone' => 'America/New_York',
        'date_format' => 'Y-m-d',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
});

it('requires name and email', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('name'))->toBeTrue()
        ->and($validator->errors()->has('email'))->toBeTrue();
});

it('requires email to be unique ignoring current user', function () {
    $existing = User::factory()->withoutTwoFactor()->create(['email' => 'taken@example.com']);
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'taken@example.com',
        'timezone' => 'UTC',
        'date_format' => 'Y-m-d',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('email'))->toBeTrue();
});

it('allows user to keep their own email', function () {
    $user = User::factory()->withoutTwoFactor()->create(['email' => 'mine@example.com']);

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'mine@example.com',
        'timezone' => 'UTC',
        'date_format' => 'Y-m-d',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
});

it('limits bio to 1000 characters', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'user@example.com',
        'timezone' => 'UTC',
        'date_format' => 'Y-m-d',
        'bio' => str_repeat('x', 1001),
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('bio'))->toBeTrue();
});

it('requires a valid timezone', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'user@example.com',
        'timezone' => 'Not/A/Timezone',
        'date_format' => 'Y-m-d',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('timezone'))->toBeTrue();
});

it('accepts only valid date formats', function (string $format) {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'user@example.com',
        'timezone' => 'UTC',
        'date_format' => $format,
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
})->with(['Y-m-d', 'd/m/Y', 'm/d/Y', 'Y/m/d', 'M j, Y']);

it('rejects invalid date formats', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    $request = new ProfileUpdateRequest;
    $request->setUserResolver(fn () => $user);

    $validator = Validator::make([
        'name' => 'User',
        'email' => 'user@example.com',
        'timezone' => 'UTC',
        'date_format' => 'DD-MM-YYYY',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('date_format'))->toBeTrue();
});
