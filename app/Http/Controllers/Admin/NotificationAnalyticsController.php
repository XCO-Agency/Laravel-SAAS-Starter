<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationDeliveryLog;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class NotificationAnalyticsController extends Controller
{
    /**
     * Display notification delivery analytics.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // ── Total delivery counts ──
        $totalDeliveries = NotificationDeliveryLog::where('delivered_at', '>=', $thirtyDaysAgo)->count();
        $emailDeliveries = NotificationDeliveryLog::where('channel', 'email')
            ->where('delivered_at', '>=', $thirtyDaysAgo)
            ->count();
        $inAppDeliveries = NotificationDeliveryLog::where('channel', 'in_app')
            ->where('delivered_at', '>=', $thirtyDaysAgo)
            ->count();

        // ── Daily deliveries per channel (last 14 days) ──
        $dailyDeliveries = collect(range(13, 0))->map(function (int $daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'email' => NotificationDeliveryLog::where('channel', 'email')
                    ->whereDate('delivered_at', $date)
                    ->count(),
                'in_app' => NotificationDeliveryLog::where('channel', 'in_app')
                    ->whereDate('delivered_at', $date)
                    ->count(),
            ];
        })->values();

        // ── Delivery by notification type (top 10) ──
        $byType = NotificationDeliveryLog::where('delivered_at', '>=', $thirtyDaysAgo)
            ->selectRaw('notification_type, channel, count(*) as total')
            ->groupBy('notification_type', 'channel')
            ->orderByDesc('total')
            ->limit(20)
            ->get()
            ->groupBy('notification_type')
            ->map(function ($rows, $type) {
                $channels = [];
                foreach ($rows as $row) {
                    $channels[$row->channel] = $row->total;
                }

                return [
                    'type' => $type,
                    'email' => $channels['email'] ?? 0,
                    'in_app' => $channels['in_app'] ?? 0,
                    'total' => ($channels['email'] ?? 0) + ($channels['in_app'] ?? 0),
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->take(10);

        // ── Delivery by category ──
        $byCategory = NotificationDeliveryLog::where('delivered_at', '>=', $thirtyDaysAgo)
            ->whereNotNull('category')
            ->selectRaw('category, channel, count(*) as total')
            ->groupBy('category', 'channel')
            ->orderByDesc('total')
            ->get()
            ->groupBy('category')
            ->map(function ($rows, $category) {
                $channels = [];
                foreach ($rows as $row) {
                    $channels[$row->channel] = $row->total;
                }

                return [
                    'category' => $category,
                    'email' => $channels['email'] ?? 0,
                    'in_app' => $channels['in_app'] ?? 0,
                    'total' => ($channels['email'] ?? 0) + ($channels['in_app'] ?? 0),
                ];
            })
            ->sortByDesc('total')
            ->values();

        // ── Channel split ratio ──
        $channelSplit = [
            'email' => $totalDeliveries > 0 ? round(($emailDeliveries / $totalDeliveries) * 100, 1) : 0,
            'in_app' => $totalDeliveries > 0 ? round(($inAppDeliveries / $totalDeliveries) * 100, 1) : 0,
        ];

        // ── Week-over-week trend ──
        $thisWeek = NotificationDeliveryLog::where('delivered_at', '>=', $now->copy()->subDays(7))->count();
        $lastWeek = NotificationDeliveryLog::whereBetween('delivered_at', [
            $now->copy()->subDays(14),
            $now->copy()->subDays(7),
        ])->count();
        $weeklyTrend = $lastWeek > 0
            ? round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1)
            : ($thisWeek > 0 ? 100 : 0);

        return Inertia::render('admin/notification-analytics', [
            'metrics' => [
                'total' => $totalDeliveries,
                'email' => $emailDeliveries,
                'in_app' => $inAppDeliveries,
                'weekly_trend' => $weeklyTrend,
            ],
            'dailyDeliveries' => $dailyDeliveries,
            'byType' => $byType,
            'byCategory' => $byCategory,
            'channelSplit' => $channelSplit,
        ]);
    }
}
