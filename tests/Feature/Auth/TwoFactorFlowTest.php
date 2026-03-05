<?php

use App\Models\User;
use Laravel\Fortify\Features;
use PragmaRX\Google2FA\Google2FA;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        test()->markTestSkipped('Two-factor authentication is not enabled.');
    }
});

it('can enable two-factor authentication', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication')
        ->assertOk();

    $user->refresh();
    expect($user->two_factor_secret)->not->toBeNull();
});

it('can disable two-factor authentication', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA properly first
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();
    expect($user->two_factor_secret)->not->toBeNull();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->deleteJson('/user/two-factor-authentication')
        ->assertOk();

    $user->refresh();
    expect($user->two_factor_secret)->toBeNull();
});

it('can confirm two-factor authentication with valid code', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA first
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();

    $google2fa = new Google2FA;
    $secret = decrypt($user->two_factor_secret);
    $validCode = $google2fa->getCurrentOtp($secret);

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/confirmed-two-factor-authentication', [
            'code' => $validCode,
        ])
        ->assertOk();

    $user->refresh();
    expect($user->two_factor_confirmed_at)->not->toBeNull();
});

it('fails to confirm two-factor authentication with invalid code', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA first
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/confirmed-two-factor-authentication', [
            'code' => '000000',
        ])
        ->assertStatus(422);
});

it('can retrieve the two-factor QR code SVG', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA properly
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-qr-code')
        ->assertOk()
        ->assertJsonStructure(['svg']);
});

it('can retrieve the two-factor secret key', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA properly
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-secret-key')
        ->assertOk()
        ->assertJsonStructure(['secretKey']);
});

it('can retrieve two-factor recovery codes', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA properly
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->getJson('/user/two-factor-recovery-codes')
        ->assertOk();
});

it('can regenerate two-factor recovery codes', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    // Enable 2FA properly
    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-authentication');

    $user->refresh();
    $oldCodes = $user->two_factor_recovery_codes;

    actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->postJson('/user/two-factor-recovery-codes')
        ->assertOk();

    $user->refresh();
    expect($user->two_factor_recovery_codes)->not->toBe($oldCodes);
});

it('requires password confirmation for enabling 2FA', function () {
    $user = User::factory()->withoutTwoFactor()->create();

    actingAs($user)
        ->postJson('/user/two-factor-authentication')
        ->assertStatus(423);
});

it('requires password confirmation for viewing QR code', function () {
    $user = User::factory()->create();

    actingAs($user)
        ->getJson('/user/two-factor-qr-code')
        ->assertStatus(423);
});

it('requires authentication for 2FA endpoints', function () {
    $this->postJson('/user/two-factor-authentication')
        ->assertUnauthorized();

    $this->deleteJson('/user/two-factor-authentication')
        ->assertUnauthorized();

    $this->getJson('/user/two-factor-qr-code')
        ->assertUnauthorized();

    $this->getJson('/user/two-factor-recovery-codes')
        ->assertUnauthorized();
});
