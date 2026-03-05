<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class UserAnalyticsController extends Controller
{
    /**
     * Display user analytics dashboard.
     */
    public function index(): Response
    {
        $now = Carbon::now();

        // ── Growth: daily signups for the last 30 days ──
        $dailySignups = collect(range(29, 0))->map(function (int $daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'count' => User::whereDate('created_at', $date)->count(),
            ];
        })->values();

        // ── Cumulative user growth (monthly for last 6 months) ──
        $monthlyGrowth = collect(range(5, 0))->map(function (int $monthsAgo) use ($now) {
            $end = $now->copy()->subMonths($monthsAgo)->endOfMonth();

            return [
                'month' => $end->format('M Y'),
                'total' => User::where('created_at', '<=', $end)->count(),
            ];
        })->values();

        // ── Active users: unique users with login activity in time windows ──
        $activeToday = LoginActivity::where('is_successful', true)
            ->where('login_at', '>=', $now->copy()->startOfDay())
            ->distinct('user_id')
            ->count('user_id');

        $activeWeek = LoginActivity::where('is_successful', true)
            ->where('login_at', '>=', $now->copy()->subDays(7))
            ->distinct('user_id')
            ->count('user_id');

        $activeMonth = LoginActivity::where('is_successful', true)
            ->where('login_at', '>=', $now->copy()->subDays(30))
            ->distinct('user_id')
            ->count('user_id');

        // ── Retention: users who signed up 30+ days ago and logged in within last 30 days ──
        $totalUsers = User::count();
        $matureUsers = User::where('created_at', '<=', $now->copy()->subDays(30))->count();
        $retainedUsers = 0;

        if ($matureUsers > 0) {
            $retainedUsers = LoginActivity::where('is_successful', true)
                ->where('login_at', '>=', $now->copy()->subDays(30))
                ->whereIn('user_id', User::where('created_at', '<=', $now->copy()->subDays(30))->pluck('id'))
                ->distinct('user_id')
                ->count('user_id');
        }

        $retentionRate = $matureUsers > 0 ? round(($retainedUsers / $matureUsers) * 100, 1) : 0;

        // ── Top referral sources (if login_activities has user_agent diversity) ──
        $topDevices = LoginActivity::where('is_successful', true)
            ->where('login_at', '>=', $now->copy()->subDays(30))
            ->selectRaw("
                CASE
                    WHEN user_agent LIKE '%iPhone%' OR user_agent LIKE '%iPad%' THEN 'iOS'
                    WHEN user_agent LIKE '%Android%' THEN 'Android'
                    WHEN user_agent LIKE '%Windows%' THEN 'Windows'
                    WHEN user_agent LIKE '%Macintosh%' THEN 'macOS'
                    WHEN user_agent LIKE '%Linux%' THEN 'Linux'
                    ELSE 'Other'
                END as platform,
                COUNT(DISTINCT user_id) as users
            ")
            ->groupBy('platform')
            ->orderByDesc('users')
            ->limit(5)
            ->get();

        return Inertia::render('admin/user-analytics', [
            'dailySignups' => $dailySignups,
            'monthlyGrowth' => $monthlyGrowth,
            'activeUsers' => [
                'today' => $activeToday,
                'week' => $activeWeek,
                'month' => $activeMonth,
            ],
            'retention' => [
                'rate' => $retentionRate,
                'mature_users' => $matureUsers,
                'retained_users' => $retainedUsers,
            ],
            'totalUsers' => $totalUsers,
            'topDevices' => $topDevices,
        ]);
    }
}
