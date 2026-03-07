<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WebhookLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class WorkspaceAnalyticsController extends Controller
{
    /**
     * Display the workspace analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        Gate::authorize('update', $workspace);

        $memberIds = $workspace->users()->pluck('users.id');
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // --- Member Growth (last 6 months, monthly) ---
        $memberGrowth = collect(range(5, 0))->map(function ($monthsAgo) use ($workspace) {
            $start = Carbon::now()->subMonths($monthsAgo)->startOfMonth();
            $end = Carbon::now()->subMonths($monthsAgo)->endOfMonth();

            $joined = DB::table('workspace_user')
                ->where('workspace_id', $workspace->id)
                ->whereBetween('created_at', [$start, $end])
                ->count();

            return [
                'month' => $start->format('M Y'),
                'joined' => $joined,
            ];
        })->values();

        // --- Overview Stats ---
        $totalMembers = $workspace->users()->count();
        $activeApiKeys = $workspace->apiKeys()
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })->count();
        $webhookEndpoints = $workspace->webhookEndpoints()->count();
        $activeWebhookEndpoints = $workspace->webhookEndpoints()->where('is_active', true)->count();
        $pendingInvitations = $workspace->invitations()->count();

        // --- API Key Usage ---
        $apiKeys = $workspace->apiKeys()
            ->select('id', 'name', 'key_prefix', 'last_used_at', 'expires_at', 'created_at')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($key) => [
                'id' => $key->id,
                'name' => $key->name,
                'key_prefix' => $key->key_prefix,
                'last_used_at' => $key->last_used_at?->toISOString(),
                'expires_at' => $key->expires_at?->toISOString(),
                'is_expired' => $key->expires_at && $key->expires_at->isPast(),
                'created_at' => $key->created_at->toISOString(),
            ]);

        // --- Webhook Delivery Stats (last 30 days) ---
        $webhookStats = WebhookLog::where('workspace_id', $workspace->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $webhookDeliveries = [
            'success' => $webhookStats->get('success', 0),
            'failed' => $webhookStats->get('failed', 0),
            'pending' => $webhookStats->get('pending', 0),
            'total' => $webhookStats->sum(),
        ];

        // --- Weekly Activity Volume (last 8 weeks) ---
        $weeklyActivity = collect(range(7, 0))->map(function ($weeksAgo) use ($memberIds) {
            $start = Carbon::now()->subWeeks($weeksAgo)->startOfWeek();
            $end = Carbon::now()->subWeeks($weeksAgo)->endOfWeek();

            $actions = Activity::whereIn('causer_id', $memberIds)
                ->where('causer_type', User::class)
                ->whereBetween('created_at', [$start, $end])
                ->count();

            return [
                'week' => $start->format('M d'),
                'actions' => $actions,
            ];
        })->values();

        // --- Recent Activity (last 10 events) ---
        $recentActivity = Activity::where(function ($q) use ($workspace, $memberIds) {
            $q->where(function ($sub) use ($workspace) {
                $sub->where('subject_type', $workspace->getMorphClass())
                    ->where('subject_id', $workspace->id);
            })->orWhere(function ($sub) use ($memberIds) {
                $sub->whereIn('causer_id', $memberIds)
                    ->where('causer_type', User::class);
            });
        })
            ->with('causer:id,name')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'description' => $a->description,
                'event' => $a->event,
                'causer_name' => $a->causer?->name ?? 'System',
                'created_at' => $a->created_at?->toISOString(),
            ]);

        return Inertia::render('workspaces/analytics/index', [
            'overview' => [
                'totalMembers' => $totalMembers,
                'activeApiKeys' => $activeApiKeys,
                'webhookEndpoints' => $webhookEndpoints,
                'activeWebhookEndpoints' => $activeWebhookEndpoints,
                'pendingInvitations' => $pendingInvitations,
            ],
            'memberGrowth' => $memberGrowth,
            'apiKeys' => $apiKeys,
            'webhookDeliveries' => $webhookDeliveries,
            'weeklyActivity' => $weeklyActivity,
            'recentActivity' => $recentActivity,
        ]);
    }
}
