<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
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
    Route::get('settings/api-tokens', [\App\Http\Controllers\Settings\ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('settings/api-tokens', [\App\Http\Controllers\Settings\ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('settings/api-tokens/{tokenId}', [\App\Http\Controllers\Settings\ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    // Data Export
    Route::post('settings/export-data', [\App\Http\Controllers\Settings\SecurityController::class, 'exportData'])->name('security.export-data');
    Route::get('settings/export-data/{filename}', [\App\Http\Controllers\Settings\SecurityController::class, 'downloadExport'])
        ->name('security.export-download')
        ->middleware('signed');
});
