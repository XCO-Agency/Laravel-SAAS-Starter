<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MemberActivityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamImportController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceInviteLinkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Magic Link Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/magic-login', [\App\Http\Controllers\Auth\MagicLinkController::class, 'create'])->name('magic-link.create');
    Route::post('/magic-login', [\App\Http\Controllers\Auth\MagicLinkController::class, 'store'])->name('magic-link.store');
    Route::get('/magic-login/{user}', [\App\Http\Controllers\Auth\MagicLinkController::class, 'authenticate'])
        ->middleware('signed')
        ->name('magic-link.authenticate');
});

// Public changelog
Route::get('/changelog', [\App\Http\Controllers\ChangelogController::class, 'index'])->name('changelog');

// Public invitation acceptance route
Route::get('/invitations/{token}', [InvitationController::class, 'show'])
    ->name('invitations.show');
Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])
    ->middleware('auth')
    ->name('invitations.accept');

// Public invite link routes
Route::get('/join/{token}', [WorkspaceInviteLinkController::class, 'show'])->name('invite-links.show');
Route::post('/join/{token}', [WorkspaceInviteLinkController::class, 'join'])->middleware('auth')->name('invite-links.join');

Route::middleware(['auth', 'verified', 'onboarded', 'workspace', 'require2fa', 'workspace.ip', 'workspace.suspended'])->group(function () {
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
        Route::post('/settings/logo', [\App\Http\Controllers\Settings\WorkspaceLogoController::class, 'update'])->name('logo.update');
        Route::delete('/settings/logo', [\App\Http\Controllers\Settings\WorkspaceLogoController::class, 'destroy'])->name('logo.destroy');
        Route::get('/export', [\App\Http\Controllers\WorkspaceExportController::class, 'export'])->name('export');
        Route::delete('/', [WorkspaceController::class, 'destroy'])->name('destroy');
        Route::post('/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('switch');

        // Workspace Trash
        Route::get('/trash', [\App\Http\Controllers\WorkspaceTrashController::class, 'index'])->name('trash');
        Route::post('/trash/{workspace}/restore', [\App\Http\Controllers\WorkspaceTrashController::class, 'restore'])->name('trash.restore');
        Route::delete('/trash/{workspace}', [\App\Http\Controllers\WorkspaceTrashController::class, 'forceDelete'])->name('trash.force-delete');

        Route::get('/{workspace}/activity', [\App\Http\Controllers\WorkspaceActivityController::class, 'index'])->name('activity');
        Route::get('/analytics', [\App\Http\Controllers\WorkspaceAnalyticsController::class, 'index'])->name('analytics');

        // Workspace API Keys
        Route::get('/api-keys', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'index'])->name('api-keys.index');
        Route::post('/api-keys', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'store'])->name('api-keys.store');
        Route::delete('/api-keys/{id}', [\App\Http\Controllers\WorkspaceApiKeyController::class, 'destroy'])->name('api-keys.destroy');

        // API Usage Dashboard
        Route::get('/api-usage', [\App\Http\Controllers\ApiUsageController::class, 'index'])->name('api-usage.index');

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
        Route::get('/activity-report', [MemberActivityController::class, 'index'])->name('activity-report');

        // CSV Import
        Route::get('/import', [TeamImportController::class, 'index'])->name('import');
        Route::post('/import/preview', [TeamImportController::class, 'preview'])->name('import.preview');
        Route::post('/import/process', [TeamImportController::class, 'process'])->name('import.process');

        // Invite Links
        Route::post('/invite-links', [WorkspaceInviteLinkController::class, 'store'])->name('invite-links.store');
        Route::delete('/invite-links/{id}', [WorkspaceInviteLinkController::class, 'destroy'])->name('invite-links.destroy');
    });

    // Billing routes
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('index');
        Route::get('/plans', [BillingController::class, 'plans'])->name('plans');
        Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
        Route::post('/cancel', [BillingController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [BillingController::class, 'resume'])->name('resume');
        Route::get('/portal', [BillingController::class, 'portal'])->name('portal');
        Route::get('/invoices/{invoice}', [BillingController::class, 'downloadInvoice'])->name('invoice.download');
    });
    // Workspace Security Settings
    Route::get('/settings/workspace-security', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'index'])->name('workspace.security');
    Route::put('/settings/workspace-security', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'update'])->name('workspace.security.update');

    // Onboarding Checklist
    Route::get('/onboarding-checklist', [\App\Http\Controllers\OnboardingChecklistController::class, 'index'])->name('onboarding-checklist.index');
    Route::post('/onboarding-checklist/dismiss', [\App\Http\Controllers\OnboardingChecklistController::class, 'dismiss'])->name('onboarding-checklist.dismiss');

    // Usage Dashboard
    Route::get('/usage', [\App\Http\Controllers\UsageController::class, 'index'])->name('usage.index');

    // Impersonation
    Route::post('/admin/impersonate/leave', [\App\Http\Controllers\Admin\ImpersonationController::class, 'leave'])->name('admin.impersonate.leave');
});

// 2FA Enforcement Wall (auth only, no require2fa to avoid infinite redirect)
Route::middleware(['auth', 'verified', 'onboarded', 'workspace'])->group(function () {
    Route::get('/workspace/2fa-required', [\App\Http\Controllers\Settings\WorkspaceSecurityController::class, 'twoFactorRequired'])->name('workspace.2fa-required');
});

// Workspace Suspension Wall
Route::middleware(['auth', 'verified', 'onboarded', 'workspace'])->group(function () {
    Route::get('/workspace/suspended', function (\Illuminate\Http\Request $request) {
        $workspace = $request->user()->currentWorkspace;

        if (! $workspace || ! $workspace->suspended_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('workspace-suspended', [
            'workspace' => [
                'name' => $workspace->name,
                'suspended_at' => $workspace->suspended_at->toIso8601String(),
                'suspension_reason' => $workspace->suspension_reason,
            ],
        ]);
    })->name('workspace.suspended');
});

Route::middleware(['auth'])->group(function () {
    // Onboarding Sequences (Exempt from onboarded check)
    Route::get('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding', [\App\Http\Controllers\OnboardingController::class, 'store'])->name('onboarding.store');
    Route::post('/onboarding/track-step', [\App\Http\Controllers\OnboardingController::class, 'trackStep'])->name('onboarding.track-step');

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

require __DIR__ . '/settings.php';

// Admin routes
Route::middleware(['auth', 'superadmin'])->prefix('admin')->name('admin.')->group(function () {
    // 2FA Enforcement Wall
    Route::get('/2fa-required', [\App\Http\Controllers\Admin\SecurityController::class, 'twoFactorRequired'])->name('2fa-required');

    Route::middleware([\App\Http\Middleware\RequireAdminTwoFactor::class])->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::post('/impersonate/{user}', [\App\Http\Controllers\Admin\ImpersonationController::class, 'impersonate'])->name('impersonate');

        // User Management
        Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
        Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/restore', [\App\Http\Controllers\Admin\UserController::class, 'restore'])->name('users.restore');
        Route::post('/users/bulk-verify-email', [\App\Http\Controllers\Admin\UserController::class, 'bulkVerifyEmail'])->name('users.bulk-verify-email');
        Route::post('/users/bulk-suspend', [\App\Http\Controllers\Admin\UserController::class, 'bulkSuspend'])->name('users.bulk-suspend');
        Route::post('/users/bulk-export', [\App\Http\Controllers\Admin\UserController::class, 'bulkExport'])->name('users.bulk-export');

        // User Sessions
        Route::get('/users/{user}/sessions', [\App\Http\Controllers\Admin\UserSessionController::class, 'index'])->name('users.sessions.index');
        Route::delete('/users/{user}/sessions/{id}', [\App\Http\Controllers\Admin\UserSessionController::class, 'destroy'])->name('users.sessions.destroy');
        Route::delete('/users/{user}/sessions', [\App\Http\Controllers\Admin\UserSessionController::class, 'destroyAll'])->name('users.sessions.destroy-all');

        // System Logs
        Route::get('/logs', [\App\Http\Controllers\Admin\LogViewerController::class, 'index'])->name('logs.index');
        Route::get('/logs/{file}/download', [\App\Http\Controllers\Admin\LogViewerController::class, 'download'])->name('logs.download')->where('file', '.*');
        Route::get('/logs/{file}', [\App\Http\Controllers\Admin\LogViewerController::class, 'show'])->name('logs.show')->where('file', '.*');
        Route::delete('/logs/{file}', [\App\Http\Controllers\Admin\LogViewerController::class, 'destroy'])->name('logs.destroy')->where('file', '.*');

        // Workspace Management
        Route::get('/workspaces', [\App\Http\Controllers\Admin\WorkspaceController::class, 'index'])->name('workspaces.index');
        Route::post('/workspaces/{workspace}/suspend', [\App\Http\Controllers\Admin\WorkspaceController::class, 'suspend'])->name('workspaces.suspend');
        Route::post('/workspaces/{workspace}/unsuspend', [\App\Http\Controllers\Admin\WorkspaceController::class, 'unsuspend'])->name('workspaces.unsuspend');

        // Audit Logs
        Route::get('/audit-logs', [\App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/impersonation-logs', [\App\Http\Controllers\Admin\ImpersonationLogController::class, 'index'])->name('impersonation-logs.index');

        // Broadcasts
        Route::get('/broadcasts', [\App\Http\Controllers\Admin\BroadcastController::class, 'index'])->name('broadcasts.index');
        Route::post('/broadcasts', [\App\Http\Controllers\Admin\BroadcastController::class, 'store'])->name('broadcasts.store');

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

        // SEO Metadata
        Route::get('/seo', [\App\Http\Controllers\Admin\SeoMetadataController::class, 'index'])->name('seo.index');
        Route::post('/seo', [\App\Http\Controllers\Admin\SeoMetadataController::class, 'store'])->name('seo.store');
        Route::put('/seo/{seoMetadata}', [\App\Http\Controllers\Admin\SeoMetadataController::class, 'update'])->name('seo.update');
        Route::delete('/seo/{seoMetadata}', [\App\Http\Controllers\Admin\SeoMetadataController::class, 'destroy'])->name('seo.destroy');

        // Support Tickets
        Route::controller(\App\Http\Controllers\Admin\TicketController::class)->group(function () {
            Route::get('/tickets', 'index')->name('tickets.index');
            Route::get('/tickets/{ticket}', 'show')->name('tickets.show');
            Route::patch('/tickets/{ticket}', 'update')->name('tickets.update');
            Route::post('/tickets/{ticket}/replies', 'storeReply')->name('tickets.reply.store');
        });

        // Maintenance Mode
        Route::get('/maintenance', [\App\Http\Controllers\Admin\MaintenanceController::class, 'index'])->name('maintenance.index');
        Route::post('/maintenance/toggle', [\App\Http\Controllers\Admin\MaintenanceController::class, 'toggle'])->name('maintenance.toggle');

        // User Analytics
        Route::get('/user-analytics', [\App\Http\Controllers\Admin\UserAnalyticsController::class, 'index'])->name('user-analytics.index');

        // Revenue Analytics
        Route::get('/revenue-analytics', [\App\Http\Controllers\Admin\RevenueAnalyticsController::class, 'index'])->name('revenue-analytics.index');

        // Notification Analytics
        Route::get('/notification-analytics', [\App\Http\Controllers\Admin\NotificationAnalyticsController::class, 'index'])->name('notification-analytics.index');

        // Onboarding Insights
        Route::get('/onboarding-insights', [\App\Http\Controllers\Admin\OnboardingInsightsController::class, 'index'])->name('onboarding-insights.index');

        // Permission Presets
        Route::get('/permission-presets', [\App\Http\Controllers\Admin\PermissionPresetController::class, 'index'])->name('permission-presets.index');
        Route::post('/permission-presets', [\App\Http\Controllers\Admin\PermissionPresetController::class, 'store'])->name('permission-presets.store');
        Route::put('/permission-presets/{permissionPreset}', [\App\Http\Controllers\Admin\PermissionPresetController::class, 'update'])->name('permission-presets.update');
        Route::delete('/permission-presets/{permissionPreset}', [\App\Http\Controllers\Admin\PermissionPresetController::class, 'destroy'])->name('permission-presets.destroy');

        // System Notifications
        Route::get('/system-notifications', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'index'])->name('system-notifications.index');
        Route::patch('/system-notifications/{adminNotification}/read', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAsRead'])->name('system-notifications.read');
        Route::patch('/system-notifications/read-all', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'markAllAsRead'])->name('system-notifications.read-all');
        Route::delete('/system-notifications/{adminNotification}', [\App\Http\Controllers\Admin\AdminNotificationController::class, 'destroy'])->name('system-notifications.destroy');

        // Localization Management
        Route::get('/translations', [\App\Http\Controllers\Admin\TranslationController::class, 'index'])->name('translations.index');
        Route::post('/translations', [\App\Http\Controllers\Admin\TranslationController::class, 'store'])->name('translations.store');
        Route::get('/translations/{locale}', [\App\Http\Controllers\Admin\TranslationController::class, 'show'])->name('translations.show');
        Route::put('/translations/{locale}', [\App\Http\Controllers\Admin\TranslationController::class, 'update'])->name('translations.update');
    });
});
