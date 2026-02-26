<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
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

// Public changelog
Route::get('/changelog', [\App\Http\Controllers\ChangelogController::class, 'index'])->name('changelog');

// Public invitation acceptance route
Route::get('/invitations/{token}', [InvitationController::class, 'show'])
    ->name('invitations.show');
Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])
    ->middleware('auth')
    ->name('invitations.accept');

Route::middleware(['auth', 'verified', 'onboarded', 'workspace', 'require2fa'])->group(function () {
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
        Route::get('/export', [\App\Http\Controllers\WorkspaceExportController::class, 'export'])->name('export');
        Route::delete('/', [WorkspaceController::class, 'destroy'])->name('destroy');
        Route::post('/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('switch');

        Route::get('/{workspace}/activity', [\App\Http\Controllers\WorkspaceActivityController::class, 'index'])->name('activity');

        // Workspace API Keys
        Route::get('/api-keys', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'index'])->name('api-keys.index');
        Route::post('/api-keys', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'store'])->name('api-keys.store');
        Route::delete('/api-keys/{id}', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'destroy'])->name('api-keys.destroy');

        // Webhook routes
        Route::prefix('{workspace}/webhooks')->name('webhooks.')->group(function () {
            Route::get('/', [\App\Http\Controllers\WebhookEndpointController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\WebhookEndpointController::class, 'store'])->name('store');
            Route::put('/{webhookEndpoint}', [\App\Http\Controllers\WebhookEndpointController::class, 'update'])->name('update');
            Route::delete('/{webhookEndpoint}', [\App\Http\Controllers\WebhookEndpointController::class, 'destroy'])->name('destroy');
            Route::post('/{webhookEndpoint}/ping', [\App\Http\Controllers\WebhookEndpointController::class, 'ping'])->name('ping');

            Route::get('/logs', [\App\Http\Controllers\WebhookLogController::class, 'index'])->name('logs.index');
        });
    });

    // Team routes
    Route::prefix('team')->name('team.')->group(function () {
        Route::get('/', [TeamController::class, 'index'])->name('index');
        Route::post('/invite', [TeamController::class, 'invite'])->middleware('throttle:invitations')->name('invite');
        Route::delete('/members/{user}', [TeamController::class, 'removeMember'])->name('remove');
        Route::put('/members/{user}/role', [TeamController::class, 'updateRole'])->name('update-role');
        Route::put('/members/{user}/permissions', [TeamController::class, 'updatePermissions'])->name('update-permissions');
        Route::post('/transfer-ownership/{user}', [TeamController::class, 'transferOwnership'])->name('transfer-ownership');
        Route::delete('/invitations/{invitation}', [TeamController::class, 'cancelInvitation'])->name('cancel-invitation');
    });

    // Billing routes
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('index');
        Route::get('/plans', [BillingController::class, 'plans'])->name('plans');
        Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
        Route::post('/cancel', [BillingController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [BillingController::class, 'resume'])->name('resume');
        Route::get('/portal', [BillingController::class, 'portal'])->name('portal');
    });
    // Workspace Security Settings
    Route::get('/settings/workspace-security', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'index'])->name('workspace.security');
    Route::put('/settings/workspace-security', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'update'])->name('workspace.security.update');

    // Onboarding Checklist
    Route::get('/onboarding-checklist', [\App\Http\Controllers\OnboardingChecklistController::class, 'index'])->name('onboarding-checklist.index');
    Route::post('/onboarding-checklist/dismiss', [\App\Http\Controllers\OnboardingChecklistController::class, 'dismiss'])->name('onboarding-checklist.dismiss');
});

// 2FA Enforcement Wall (auth only, no require2fa to avoid infinite redirect)
Route::middleware(['auth', 'verified', 'onboarded', 'workspace'])->group(function () {
    Route::get('/workspace/2fa-required', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'twoFactorRequired'])->name('workspace.2fa-required');
});

Route::middleware(['auth'])->group(function () {
    // Onboarding Sequences (Exempt from onboarded check)
    Route::get('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'store'])->name('onboarding.store');

    Route::middleware(['onboarded'])->group(function () {
        Route::get('/notifications', [NotificationController::class, 'page'])->name('notifications.page');

        // Notifications API
        Route::prefix('api/notifications')->middleware('throttle:api')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-read');
        });
    });

    // Stop impersonating outside of superadmin middleware (since active user is standard user)
    Route::post('/admin/impersonate/leave', [\App\Http\Controllers\Admin\ImpersonationController::class, 'leave'])->name('admin.impersonate.leave');

    // User Feedback
    Route::post('/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])->name('feedback.store');

    // Global Search
    Route::get('/api/search', [\App\Http\Controllers\SearchController::class, 'index'])->name('search.index');
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
    Route::post('/impersonate/{user}', [\App\Http\Controllers\Admin\ImpersonationController::class, 'impersonate'])->name('impersonate');

    // User Management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/restore', [\App\Http\Controllers\Admin\UserController::class, 'restore'])->name('users.restore');

    // Workspace Management
    Route::get('/workspaces', [\App\Http\Controllers\Admin\WorkspaceController::class, 'index'])->name('workspaces.index');

    // Audit Logs
    Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('audit-logs.index');

    // Announcements
    Route::get('/announcements', [\App\Http\Controllers\Admin\AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [\App\Http\Controllers\Admin\AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement}', [\App\Http\Controllers\Admin\AnnouncementController::class, 'update'])->name('announcements.update');
    Route::post('/announcements/{announcement}/toggle', [\App\Http\Controllers\Admin\AnnouncementController::class, 'toggle'])->name('announcements.toggle');
    Route::delete('/announcements/{announcement}', [\App\Http\Controllers\Admin\AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // Feature Flags
    Route::get('/feature-flags', [\App\Http\Controllers\Admin\FeatureFlagController::class, 'index'])->name('feature-flags.index');
    Route::post('/feature-flags', [\App\Http\Controllers\Admin\FeatureFlagController::class, 'store'])->name('feature-flags.store');
    Route::put('/feature-flags/{featureFlag}', [\App\Http\Controllers\Admin\FeatureFlagController::class, 'update'])->name('feature-flags.update');
    Route::delete('/feature-flags/{featureFlag}', [\App\Http\Controllers\Admin\FeatureFlagController::class, 'destroy'])->name('feature-flags.destroy');

    // Email Templates
    Route::get('/mail-templates', [\App\Http\Controllers\Admin\MailTemplateController::class, 'index'])->name('mail-templates.index');
    Route::get('/mail-templates/{mailTemplate}/edit', [\App\Http\Controllers\Admin\MailTemplateController::class, 'edit'])->name('mail-templates.edit');
    Route::put('/mail-templates/{mailTemplate}', [\App\Http\Controllers\Admin\MailTemplateController::class, 'update'])->name('mail-templates.update');

    // User Feedback
    Route::get('/feedback', [\App\Http\Controllers\Admin\FeedbackController::class, 'index'])->name('feedback.index');
    Route::put('/feedback/{feedback}', [\App\Http\Controllers\Admin\FeedbackController::class, 'update'])->name('feedback.update');
    Route::delete('/feedback/{feedback}', [\App\Http\Controllers\Admin\FeedbackController::class, 'destroy'])->name('feedback.destroy');

    // Data Retention
    Route::get('/retention', [\App\Http\Controllers\Admin\RetentionController::class, 'index'])->name('retention.index');
    Route::post('/retention/prune', [\App\Http\Controllers\Admin\RetentionController::class, 'prune'])->name('retention.prune');

    // System Health
    Route::get('/system-health', [\App\Http\Controllers\Admin\SystemHealthController::class, 'index'])->name('system-health.index');
    Route::post('/system-health/jobs/{id}/retry', [\App\Http\Controllers\Admin\SystemHealthController::class, 'retryJob'])->name('system-health.retry-job');
    Route::delete('/system-health/jobs/{id}', [\App\Http\Controllers\Admin\SystemHealthController::class, 'deleteJob'])->name('system-health.delete-job');
    Route::post('/system-health/jobs/flush', [\App\Http\Controllers\Admin\SystemHealthController::class, 'flushJobs'])->name('system-health.flush-jobs');

    // Changelog
    Route::get('/changelog', [\App\Http\Controllers\Admin\ChangelogController::class, 'index'])->name('changelog.index');
    Route::post('/changelog', [\App\Http\Controllers\Admin\ChangelogController::class, 'store'])->name('changelog.store');
    Route::put('/changelog/{changelogEntry}', [\App\Http\Controllers\Admin\ChangelogController::class, 'update'])->name('changelog.update');
    Route::delete('/changelog/{changelogEntry}', [\App\Http\Controllers\Admin\ChangelogController::class, 'destroy'])->name('changelog.destroy');

    // Scheduled Tasks
    Route::get('/scheduled-tasks', [\App\Http\Controllers\Admin\ScheduledTaskController::class, 'index'])->name('scheduled-tasks.index');
});
