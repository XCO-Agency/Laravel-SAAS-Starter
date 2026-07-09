<?php

use App\Http\Controllers\Settings\ApiTokenController;
use App\Http\Controllers\Settings\ConnectedAccountController;
use App\Http\Controllers\Settings\LoginActivityController;
use App\Http\Controllers\Settings\NotificationPreferenceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SecuritySummaryController;
use App\Http\Controllers\Settings\SessionController;
use App\Http\Controllers\Settings\SessionSummaryController;
use App\Http\Controllers\Settings\TicketController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Http\Controllers\Settings\UserAvatarController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('settings/profile/avatar', [UserAvatarController::class, 'update'])->name('profile.avatar.update');
    Route::delete('settings/profile/avatar', [UserAvatarController::class, 'destroy'])->name('profile.avatar.destroy');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Password management (API endpoint for the authentication page)
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    // Appearance - merged into General/Profile page, redirect to profile
    Route::redirect('settings/appearance', '/settings/profile')->name('appearance.edit');

    Route::get('settings/privacy', function () {
        return Inertia::render('settings/privacy');
    })->name('privacy.show');

    // Two-Factor Auth routes (handled by Fortify, but we need the GET for the old page redirect)
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Combined Authentication page (Password + 2FA)
    Route::get('settings/security/authentication', [SecurityController::class, 'authentication'])
        ->name('security.authentication');

    // Redirect old password URL to new structure (GET only)
    Route::get('settings/password', function () {
        return redirect('/settings/security/authentication');
    });

    // API Tokens
    Route::get('settings/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('settings/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('settings/api-tokens/{tokenId}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    // Data Export
    Route::post('settings/export-data', [SecurityController::class, 'exportData'])->name('security.export-data');
    Route::get('settings/export-data/{filename}', [SecurityController::class, 'downloadExport'])
        ->name('security.export-download')
        ->middleware('signed');

    // Notifications
    Route::get('settings/notifications', [NotificationPreferenceController::class, 'show'])->name('notifications.show');
    Route::put('settings/notifications', [NotificationPreferenceController::class, 'update'])->name('notifications.update');
    Route::post('settings/notifications/test', [NotificationPreferenceController::class, 'sendTest'])
        ->middleware('throttle:5,1')
        ->name('notifications.test');

    // Sessions
    Route::get('settings/sessions', [SessionController::class, 'index'])->name('sessions.index');
    Route::delete('settings/sessions/{sessionId}', [SessionController::class, 'destroy'])->name('sessions.destroy');
    Route::delete('settings/sessions', [SessionController::class, 'destroyAll'])->name('sessions.destroy-all');

    // Login Activity
    Route::get('settings/login-history', [LoginActivityController::class, 'index'])->name('login-history.index');

    // Tickets
    Route::controller(TicketController::class)->group(function () {
        Route::get('settings/tickets', 'index')->name('settings.tickets.index');
        Route::post('settings/tickets', 'store')->name('settings.tickets.store');
        Route::get('settings/tickets/{ticket}', 'show')->name('settings.tickets.show');
        Route::post('settings/tickets/{ticket}/replies', 'storeReply')->name('settings.tickets.reply.store');
    });

    // Connected Accounts
    Route::get('settings/connected-accounts', [ConnectedAccountController::class, 'index'])->name('connected-accounts.index');
    Route::delete('settings/connected-accounts/{connectedAccount}', [ConnectedAccountController::class, 'destroy'])->name('connected-accounts.destroy');

    // Security Summary
    Route::get('settings/security-summary', SecuritySummaryController::class)->name('security-summary.index');

    // Session Summary
    Route::get('settings/session-summary', SessionSummaryController::class)->name('session-summary.index');
});
