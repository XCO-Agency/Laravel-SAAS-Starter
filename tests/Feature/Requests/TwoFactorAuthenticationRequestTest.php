<?php

use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Laravel\Fortify\Features;

it('authorizes when two factor authentication feature is enabled', function () {
    // Feature is enabled by default in config/fortify.php
    $request = new TwoFactorAuthenticationRequest;

    expect($request->authorize())->toBe(Features::enabled(Features::twoFactorAuthentication()));
});

it('has empty validation rules', function () {
    $request = new TwoFactorAuthenticationRequest;

    expect($request->rules())->toBe([]);
});
