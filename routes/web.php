<?php

use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BroadcastController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeatureFlagController;
use App\Http\Controllers\Admin\ImpersonationController;
use App\Http\Controllers\Admin\ImpersonationLogController;
use App\Http\Controllers\Admin\LogViewerController;
use App\Http\Controllers\Admin\MailTemplateController;
use App\Http\Controllers\Admin\MaintenanceController;
use App\Http\Controllers\Admin\NotificationAnalyticsController;
use App\Http\Controllers\Admin\OnboardingInsightsController;
use App\Http\Controllers\Admin\PermissionPresetController;
use App\Http\Controllers\Admin\RetentionController;
use App\Http\Controllers\Admin\RevenueAnalyticsController;
use App\Http\Controllers\Admin\ScheduledTaskController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\SeoMetadataController;
use App\Http\Controllers\Admin\SystemHealthController;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\UserAnalyticsController;
use App\Http\Controllers\Admin\UserApiTokenController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserSessionController;
use App\Http\Controllers\ApiUsageController;
use App\Http\Controllers\Auth\MagicLinkController;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ChangelogController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MemberActivityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingChecklistController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Settings\WorkspaceLogoController;
use App\Http\Controllers\Settings\WorkspaceSecurityController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamImportController;
use App\Http\Controllers\UsageController;
use App\Http\Controllers\WebhookEndpointController;
use App\Http\Controllers\WebhookLogController;
use App\Http\Controllers\WorkspaceActivityController;
use App\Http\Controllers\WorkspaceAnalyticsController;
use App\Http\Controllers\WorkspaceApiKeyController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceExportController;
use App\Http\Controllers\WorkspaceInviteLinkController;
use App\Http\Controllers\WorkspaceTrashController;
use App\Http\Middleware\RequireAdminTwoFactor;
use Illuminate\Http\Request;
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
    Route::get('/magic-login', [MagicLinkController::class, 'create'])->name('magic-link.create');
    Route::post('/magic-login', [MagicLinkController::class, 'store'])->name('magic-link.store');
    Route::get('/magic-login/{user}', [MagicLinkController::class, 'authenticate'])
        ->middleware('signed')
        ->name('magic-link.authenticate');
});

// Public changelog
Route::get('/changelog', [ChangelogController::class, 'index'])->name('changelog');

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
        Route::post('/settings/logo', [WorkspaceLogoController::class, 'update'])->name('logo.update');
        Route::delete('/settings/logo', [WorkspaceLogoController::class, 'destroy'])->name('logo.destroy');
        Route::get('/export', [WorkspaceExportController::class, 'export'])->name('export');
        Route::delete('/', [WorkspaceController::class, 'destroy'])->name('destroy');
        Route::post('/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('switch');

        // Workspace Trash
        Route::get('/trash', [WorkspaceTrashController::class, 'index'])->name('trash');
        Route::post('/trash/{workspace}/restore', [WorkspaceTrashController::class, 'restore'])->name('trash.restore');
        Route::delete('/trash/{workspace}', [WorkspaceTrashController::class, 'forceDelete'])->name('trash.force-delete');

        Route::get('/{workspace}/activity', [WorkspaceActivityController::class, 'index'])->name('activity');
        Route::get('/analytics', [WorkspaceAnalyticsController::class, 'index'])->name('analytics');

        // Workspace API Keys
        Route::get('/api-keys', [WorkspaceApiKeyController::class, 'index'])->name('api-keys.index');
        Route::post('/api-keys', [WorkspaceApiKeyController::class, 'store'])->name('api-keys.store');
        Route::delete('/api-keys/{id}', [WorkspaceApiKeyController::class, 'destroy'])->name('api-keys.destroy');

        // API Usage Dashboard
        Route::get('/api-usage', [ApiUsageController::class, 'index'])->name('api-usage.index');

        // Webhook routes
        Route::prefix('{workspace}/webhooks')->name('webhooks.')->group(function () {
            Route::get('/', [WebhookEndpointController::class, 'index'])->name('index');
            Route::post('/', [WebhookEndpointController::class, 'store'])->name('store');
            Route::put('/{webhookEndpoint}', [WebhookEndpointController::class, 'update'])->name('update');
            Route::delete('/{webhookEndpoint}', [WebhookEndpointController::class, 'destroy'])->name('destroy');
            Route::post('/{webhookEndpoint}/ping', [WebhookEndpointController::class, 'ping'])->name('ping');

            Route::get('/logs', [WebhookLogController::class, 'index'])->name('logs.index');
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
    Route::get('/settings/workspace-security', [WorkspaceSecurityController::class, 'index'])->name('workspace.security');
    Route::put('/settings/workspace-security', [WorkspaceSecurityController::class, 'update'])->name('workspace.security.update');

    // Onboarding Checklist
    Route::get('/onboarding-checklist', [OnboardingChecklistController::class, 'index'])->name('onboarding-checklist.index');
    Route::post('/onboarding-checklist/dismiss', [OnboardingChecklistController::class, 'dismiss'])->name('onboarding-checklist.dismiss');

    // Usage Dashboard
    Route::get('/usage', [UsageController::class, 'index'])->name('usage.index');

    // Impersonation
    Route::post('/admin/impersonate/leave', [ImpersonationController::class, 'leave'])->name('admin.impersonate.leave');
});

// 2FA Enforcement Wall (auth only, no require2fa to avoid infinite redirect)
Route::middleware(['auth', 'verified', 'onboarded', 'workspace'])->group(function () {
    Route::get('/workspace/2fa-required', [WorkspaceSecurityController::class, 'twoFactorRequired'])->name('workspace.2fa-required');
});

// Workspace Suspension Wall
Route::middleware(['auth', 'verified', 'onboarded', 'workspace'])->group(function () {
    Route::get('/workspace/suspended', function (Request $request) {
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
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
    Route::post('/onboarding/track-step', [OnboardingController::class, 'trackStep'])->name('onboarding.track-step');

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
    Route::post('/admin/impersonate/leave', [ImpersonationController::class, 'leave'])->name('admin.impersonate.leave');

    // User Feedback
    Route::post('/feedback', [FeedbackController::class, 'store'])->name('feedback.store');

    // Global Search
    Route::get('/api/search', [SearchController::class, 'index'])->name('search.index');
});

// Stripe webhook (no CSRF, no auth)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->name('cashier.webhook');

// Public locale switch
Route::patch('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware('guest')->group(function () {
    Route::get('auth/{provider}/redirect', [SocialiteController::class, 'redirect'])
        ->name('socialite.redirect')
        ->where('provider', 'github|google');

    Route::get('auth/{provider}/callback', [SocialiteController::class, 'callback'])
        ->name('socialite.callback')
        ->where('provider', 'github|google');
});

require __DIR__.'/settings.php';

// Admin routes
Route::middleware(['auth', 'superadmin'])->prefix('admin')->name('admin.')->group(function () {
    // 2FA Enforcement Wall
    Route::get('/2fa-required', [SecurityController::class, 'twoFactorRequired'])->name('2fa-required');

    Route::middleware([RequireAdminTwoFactor::class])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('/impersonate/{user}', [ImpersonationController::class, 'impersonate'])->name('impersonate');

        // User Management
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::post('/users/bulk-verify-email', [UserController::class, 'bulkVerifyEmail'])->name('users.bulk-verify-email');
        Route::post('/users/bulk-suspend', [UserController::class, 'bulkSuspend'])->name('users.bulk-suspend');
        Route::post('/users/bulk-export', [UserController::class, 'bulkExport'])->name('users.bulk-export');
        Route::get('/users/{user}/sessions', [UserSessionController::class, 'index'])->name('users.sessions.index');
        Route::delete('/users/{user}/sessions/{sessionId}', [UserSessionController::class, 'destroy'])->name('users.sessions.destroy');
        Route::delete('/users/{user}/sessions', [UserSessionController::class, 'destroyAll'])->name('users.sessions.destroy-all');
        Route::get('/users/{user}/api-tokens', [UserApiTokenController::class, 'index'])->name('users.api-tokens.index');
        Route::post('/users/{user}/api-tokens', [UserApiTokenController::class, 'store'])->name('users.api-tokens.store');
        Route::delete('/users/{user}/api-tokens/{tokenId}', [UserApiTokenController::class, 'destroy'])->name('users.api-tokens.destroy');

        // Workspace Management
        Route::get('/workspaces', [App\Http\Controllers\Admin\WorkspaceController::class, 'index'])->name('workspaces.index');
        Route::post('/workspaces/{workspace}/suspend', [App\Http\Controllers\Admin\WorkspaceController::class, 'suspend'])->name('workspaces.suspend');
        Route::post('/workspaces/{workspace}/unsuspend', [App\Http\Controllers\Admin\WorkspaceController::class, 'unsuspend'])->name('workspaces.unsuspend');

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/impersonation-logs', [ImpersonationLogController::class, 'index'])->name('impersonation-logs.index');

        // Broadcasts
        Route::get('/broadcasts', [BroadcastController::class, 'index'])->name('broadcasts.index');
        Route::post('/broadcasts', [BroadcastController::class, 'store'])->name('broadcasts.store');

        // System Logs
        Route::get('/logs', [LogViewerController::class, 'index'])->name('logs.index');
        Route::get('/logs/{file}/download', [LogViewerController::class, 'download'])->where('file', '.*')->name('logs.download');
        Route::get('/logs/{file}', [LogViewerController::class, 'show'])->where('file', '.*')->name('logs.show');
        Route::delete('/logs/{file}', [LogViewerController::class, 'destroy'])->where('file', '.*')->name('logs.destroy');

        // Announcements
        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::post('/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggle'])->name('announcements.toggle');
        Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

        // Feature Flags
        Route::get('/feature-flags', [FeatureFlagController::class, 'index'])->name('feature-flags.index');
        Route::post('/feature-flags', [FeatureFlagController::class, 'store'])->name('feature-flags.store');
        Route::put('/feature-flags/{featureFlag}', [FeatureFlagController::class, 'update'])->name('feature-flags.update');
        Route::delete('/feature-flags/{featureFlag}', [FeatureFlagController::class, 'destroy'])->name('feature-flags.destroy');

        // Email Templates
        Route::get('/mail-templates', [MailTemplateController::class, 'index'])->name('mail-templates.index');
        Route::get('/mail-templates/{mailTemplate}/edit', [MailTemplateController::class, 'edit'])->name('mail-templates.edit');
        Route::put('/mail-templates/{mailTemplate}', [MailTemplateController::class, 'update'])->name('mail-templates.update');

        // User Feedback
        Route::get('/feedback', [App\Http\Controllers\Admin\FeedbackController::class, 'index'])->name('feedback.index');
        Route::put('/feedback/{feedback}', [App\Http\Controllers\Admin\FeedbackController::class, 'update'])->name('feedback.update');
        Route::delete('/feedback/{feedback}', [App\Http\Controllers\Admin\FeedbackController::class, 'destroy'])->name('feedback.destroy');

        // Data Retention
        Route::get('/retention', [RetentionController::class, 'index'])->name('retention.index');
        Route::post('/retention/prune', [RetentionController::class, 'prune'])->name('retention.prune');

        // System Health
        Route::get('/system-health', [SystemHealthController::class, 'index'])->name('system-health.index');
        Route::post('/system-health/jobs/{id}/retry', [SystemHealthController::class, 'retryJob'])->name('system-health.retry-job');
        Route::delete('/system-health/jobs/{id}', [SystemHealthController::class, 'deleteJob'])->name('system-health.delete-job');
        Route::post('/system-health/jobs/flush', [SystemHealthController::class, 'flushJobs'])->name('system-health.flush-jobs');

        // Changelog
        Route::get('/changelog', [App\Http\Controllers\Admin\ChangelogController::class, 'index'])->name('changelog.index');
        Route::post('/changelog', [App\Http\Controllers\Admin\ChangelogController::class, 'store'])->name('changelog.store');
        Route::put('/changelog/{changelogEntry}', [App\Http\Controllers\Admin\ChangelogController::class, 'update'])->name('changelog.update');
        Route::delete('/changelog/{changelogEntry}', [App\Http\Controllers\Admin\ChangelogController::class, 'destroy'])->name('changelog.destroy');

        // Scheduled Tasks
        Route::get('/scheduled-tasks', [ScheduledTaskController::class, 'index'])->name('scheduled-tasks.index');

        // SEO Metadata
        Route::get('/seo', [SeoMetadataController::class, 'index'])->name('seo.index');
        Route::post('/seo', [SeoMetadataController::class, 'store'])->name('seo.store');
        Route::put('/seo/{seoMetadata}', [SeoMetadataController::class, 'update'])->name('seo.update');
        Route::delete('/seo/{seoMetadata}', [SeoMetadataController::class, 'destroy'])->name('seo.destroy');

        // Maintenance Mode
        Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
        Route::post('/maintenance/toggle', [MaintenanceController::class, 'toggle'])->name('maintenance.toggle');

        // User Analytics
        Route::get('/user-analytics', [UserAnalyticsController::class, 'index'])->name('user-analytics.index');

        // Revenue Analytics
        Route::get('/revenue-analytics', [RevenueAnalyticsController::class, 'index'])->name('revenue-analytics.index');

        // Notification Analytics
        Route::get('/notification-analytics', [NotificationAnalyticsController::class, 'index'])->name('notification-analytics.index');

        // Onboarding Insights
        Route::get('/onboarding-insights', [OnboardingInsightsController::class, 'index'])->name('onboarding-insights.index');

        // Permission Presets
        Route::get('/permission-presets', [PermissionPresetController::class, 'index'])->name('permission-presets.index');
        Route::post('/permission-presets', [PermissionPresetController::class, 'store'])->name('permission-presets.store');
        Route::put('/permission-presets/{permissionPreset}', [PermissionPresetController::class, 'update'])->name('permission-presets.update');
        Route::delete('/permission-presets/{permissionPreset}', [PermissionPresetController::class, 'destroy'])->name('permission-presets.destroy');

        // System Notifications
        Route::get('/system-notifications', [AdminNotificationController::class, 'index'])->name('system-notifications.index');
        Route::patch('/system-notifications/{adminNotification}/read', [AdminNotificationController::class, 'markAsRead'])->name('system-notifications.read');
        Route::patch('/system-notifications/read-all', [AdminNotificationController::class, 'markAllAsRead'])->name('system-notifications.read-all');
        Route::delete('/system-notifications/{adminNotification}', [AdminNotificationController::class, 'destroy'])->name('system-notifications.destroy');

        // Localization Management
        Route::get('/translations', [TranslationController::class, 'index'])->name('translations.index');
        Route::post('/translations', [TranslationController::class, 'store'])->name('translations.store');
        Route::get('/translations/{locale}', [TranslationController::class, 'show'])->name('translations.show');
        Route::put('/translations/{locale}', [TranslationController::class, 'update'])->name('translations.update');

        // Support Tickets
        Route::controller(TicketController::class)->group(function () {
            Route::get('/tickets', 'index')->name('tickets.index');
            Route::get('/tickets/{ticket}', 'show')->name('tickets.show');
            Route::patch('/tickets/{ticket}', 'update')->name('tickets.update');
            Route::post('/tickets/{ticket}/replies', 'storeReply')->name('tickets.reply.store');
        });
    });
});
