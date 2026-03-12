<?php

use App\Http\Controllers\Settings\ApiTokenController;
use App\Http\Controllers\Settings\LoginActivityController;
use App\Http\Controllers\Settings\NotificationPreferenceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SessionController;
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

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

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
});
