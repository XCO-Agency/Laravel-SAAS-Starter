<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminNotificationController extends Controller
{
    /**
     * Display a paginated, filterable list of admin notifications.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type', '');
        $severity = $request->input('severity', '');
        $status = $request->input('status', '');

        $notifications = AdminNotification::query()
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($severity, fn ($query) => $query->where('severity', $severity))
            ->when($status === 'read', fn ($query) => $query->whereNotNull('read_at'))
            ->when($status === 'unread', fn ($query) => $query->whereNull('read_at'))
            ->latest()
            ->paginate(20)
            ->through(fn (AdminNotification $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'severity' => $notification->severity,
                'title' => $notification->title,
                'message' => $notification->message,
                'metadata' => $notification->metadata,
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at?->toISOString(),
            ])
            ->withQueryString();

        $unreadCount = AdminNotification::query()->whereNull('read_at')->count();

        $summary = [
            'total' => AdminNotification::count(),
            'unread' => $unreadCount,
            'critical' => AdminNotification::query()->where('severity', AdminNotification::SEVERITY_CRITICAL)->whereNull('read_at')->count(),
            'warning' => AdminNotification::query()->where('severity', AdminNotification::SEVERITY_WARNING)->whereNull('read_at')->count(),
        ];

        return Inertia::render('admin/system-notifications', [
            'notifications' => $notifications,
            'filters' => [
                'type' => $type,
                'severity' => $severity,
                'status' => $status,
            ],
            'summary' => $summary,
            'types' => [
                AdminNotification::TYPE_WEBHOOK_FAILURE,
                AdminNotification::TYPE_SUBSCRIPTION_CANCELED,
                AdminNotification::TYPE_SUBSCRIPTION_PAST_DUE,
                AdminNotification::TYPE_SYSTEM_ERROR,
                AdminNotification::TYPE_NEW_SIGNUP,
            ],
            'severities' => [
                AdminNotification::SEVERITY_INFO,
                AdminNotification::SEVERITY_WARNING,
                AdminNotification::SEVERITY_CRITICAL,
            ],
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(AdminNotification $adminNotification): RedirectResponse
    {
        $adminNotification->markAsRead();

        return back();
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(): RedirectResponse
    {
        AdminNotification::query()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }

    /**
     * Delete a notification.
     */
    public function destroy(AdminNotification $adminNotification): RedirectResponse
    {
        $adminNotification->delete();

        return back();
    }
}
