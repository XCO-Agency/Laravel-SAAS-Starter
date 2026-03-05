<?php

use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Set a dummy route to test the middleware
    Route::middleware(['web', 'auth', \App\Http\Middleware\EnsurePasswordNotExpired::class])->group(function () {
        Route::get('/dashboard-test', function () {
            return 'dashboard content';
        })->name('dashboard.test');
    });

    Config::set('auth.password_expiry_days', 90);
});

it('allows access if password is not expired', function () {
    $user = User::factory()->create([
        'password_updated_at' => now()->subDays(30),
    ]);

    $this->actingAs($user)
        ->get('/dashboard-test')
        ->assertOk()
        ->assertSee('dashboard content');
});

it('allows access if password_updated_at is null but created_at is recent', function () {
    $user = User::factory()->create([
        'password_updated_at' => null,
        'created_at' => now()->subDays(30),
    ]);

    $this->actingAs($user)
        ->get('/dashboard-test')
        ->assertOk()
        ->assertSee('dashboard content');
});

it('redirects to profile settings if password is expired', function () {
    $user = User::factory()->create([
        'password_updated_at' => now()->subDays(91),
    ]);

    $this->actingAs($user)
        ->get('/dashboard-test')
        ->assertRedirect(route('settings.profile'))
        ->assertSessionHas('error', 'Your password has expired. Please update it immediately.');
});

it('redirects to profile settings if password_updated_at is null and created_at is expired', function () {
    $user = User::factory()->create([
        'password_updated_at' => null,
        'created_at' => now()->subDays(91),
    ]);

    $this->actingAs($user)
        ->get('/dashboard-test')
        ->assertRedirect(route('settings.profile'))
        ->assertSessionHas('error', 'Your password has expired. Please update it immediately.');
});

it('allows access if expiry is disabled in config', function () {
    Config::set('auth.password_expiry_days', 0);

    $user = User::factory()->create([
        'password_updated_at' => now()->subDays(100),
    ]);

    $this->actingAs($user)
        ->get('/dashboard-test')
        ->assertOk()
        ->assertSee('dashboard content');
});

it('allows access to password reset routes even if expired', function () {
    // Define a dummy password route that uses the middleware
    Route::middleware(['web', 'auth', \App\Http\Middleware\EnsurePasswordNotExpired::class])->group(function () {
        Route::get('/password/reset/test', function () {
            return 'password reset content';
        })->name('password.reset.test');
    });

    $user = User::factory()->create([
        'password_updated_at' => now()->subDays(100),
    ]);

    $this->actingAs($user)
        ->get('/password/reset/test')
        ->assertOk()
        ->assertSee('password reset content');
});
