<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public invitation acceptance route
Route::get('/invitations/{token}', [InvitationController::class, 'show'])
    ->name('invitations.show');
Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])
    ->middleware('auth')
    ->name('invitations.accept');

Route::middleware(['auth', 'verified', 'workspace'])->group(function () {
    Route::get('dashboard', function () {
        $user = request()->user();
        $workspace = $user->currentWorkspace;

        return Inertia::render('dashboard', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'plan' => $workspace->plan_name,
                'members_count' => $workspace->users()->count(),
            ],
        ]);
    })->name('dashboard');

    // Workspace routes
    Route::prefix('workspaces')->name('workspaces.')->group(function () {
        Route::get('/', [WorkspaceController::class, 'index'])->name('index');
        Route::get('/create', [WorkspaceController::class, 'create'])->name('create');
        Route::post('/', [WorkspaceController::class, 'store'])->name('store');
        Route::get('/settings', [WorkspaceController::class, 'settings'])->name('settings');
        Route::put('/settings', [WorkspaceController::class, 'update'])->name('update');
        Route::delete('/', [WorkspaceController::class, 'destroy'])
            ->middleware('workspace.owner')
            ->name('destroy');
        Route::post('/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('switch');

        Route::get('/{workspace}/activity', [\App\Http\Controllers\WorkspaceActivityController::class, 'index'])
            ->middleware('workspace.admin')
            ->name('activity');

        // Webhook routes
        Route::middleware('workspace.admin')->prefix('{workspace}/webhooks')->name('webhooks.')->group(function () {
            Route::get('/', [\App\Http\Controllers\WebhookEndpointController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\WebhookEndpointController::class, 'store'])->name('store');
            Route::put('/{webhookEndpoint}', [\App\Http\Controllers\WebhookEndpointController::class, 'update'])->name('update');
            Route::delete('/{webhookEndpoint}', [\App\Http\Controllers\WebhookEndpointController::class, 'destroy'])->name('destroy');
            Route::post('/{webhookEndpoint}/ping', [\App\Http\Controllers\WebhookEndpointController::class, 'ping'])->name('ping');
        });
    });

    // Team routes
    Route::prefix('team')->name('team.')->group(function () {
        Route::get('/', [TeamController::class, 'index'])->name('index');
        Route::post('/invite', [TeamController::class, 'invite'])
            ->middleware('workspace.admin')
            ->name('invite');
        Route::delete('/members/{user}', [TeamController::class, 'removeMember'])
            ->middleware('workspace.admin')
            ->name('remove');
        Route::put('/members/{user}/role', [TeamController::class, 'updateRole'])
            ->middleware('workspace.admin')
            ->name('update-role');
        Route::post('/transfer-ownership/{user}', [TeamController::class, 'transferOwnership'])
            ->middleware('workspace.owner')
            ->name('transfer-ownership');
        Route::delete('/invitations/{invitation}', [TeamController::class, 'cancelInvitation'])
            ->middleware('workspace.admin')
            ->name('cancel-invitation');
    });

    // Billing routes
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('index');
        Route::get('/plans', [BillingController::class, 'plans'])->name('plans');
        Route::post('/subscribe', [BillingController::class, 'subscribe'])
            ->middleware('workspace.owner')
            ->name('subscribe');
        Route::post('/cancel', [BillingController::class, 'cancel'])
            ->middleware('workspace.owner')
            ->name('cancel');
        Route::post('/resume', [BillingController::class, 'resume'])
            ->middleware('workspace.owner')
            ->name('resume');
        Route::get('/portal', [BillingController::class, 'portal'])
            ->middleware('workspace.owner')
            ->name('portal');
    });
});

// Stripe webhook (no CSRF, no auth)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->name('cashier.webhook');

// Public locale switch
Route::patch('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware('guest')->group(function () {
    Route::get('auth/{provider}/redirect', [\App\Http\Controllers\Auth\SocialiteController::class, 'redirect'])
        ->name('socialite.redirect')
        ->where('provider', 'github|google');

    Route::get('auth/{provider}/callback', [\App\Http\Controllers\Auth\SocialiteController::class, 'callback'])
        ->name('socialite.callback')
        ->where('provider', 'github|google');
});

require __DIR__.'/settings.php';

// Admin routes
Route::middleware(['auth', 'superadmin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
});
