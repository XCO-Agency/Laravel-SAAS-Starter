<?php

namespace App\Http\Controllers;

use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class MemberActivityController extends Controller
{
    /**
     * Display the workspace member activity report.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        Gate::authorize('manageTeam', $workspace);

        $memberIds = $workspace->users()->pluck('users.id');

        $members = $workspace->users()
            ->select('users.id', 'users.name', 'users.email', 'users.created_at')
            ->get();

        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $sevenDaysAgo = Carbon::now()->subDays(7);

        // Last successful login per member
        $lastLogins = LoginActivity::whereIn('user_id', $memberIds)
            ->where('is_successful', true)
            ->select('user_id', DB::raw('MAX(login_at) as last_login'))
            ->groupBy('user_id')
            ->pluck('last_login', 'user_id');

        // Login count in last 30 days per member
        $loginCounts30d = LoginActivity::whereIn('user_id', $memberIds)
            ->where('is_successful', true)
            ->where('login_at', '>=', $thirtyDaysAgo)
            ->select('user_id', DB::raw('COUNT(*) as count'))
            ->groupBy('user_id')
            ->pluck('count', 'user_id');

        // Activity log action count in last 30 days per member
        $actionCounts30d = Activity::whereIn('causer_id', $memberIds)
            ->where('causer_type', User::class)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->select('causer_id', DB::raw('COUNT(*) as count'))
            ->groupBy('causer_id')
            ->pluck('count', 'causer_id');

        // Sessions: last activity per member (from sessions table)
        $lastSessions = DB::table('sessions')
            ->whereIn('user_id', $memberIds)
            ->select('user_id', DB::raw('MAX(last_activity) as last_active'))
            ->groupBy('user_id')
            ->pluck('last_active', 'user_id');

        // Build member activity data
        $memberActivity = $members->map(function ($member) use ($lastLogins, $loginCounts30d, $actionCounts30d, $lastSessions, $sevenDaysAgo) {
            $logins = $loginCounts30d->get($member->id, 0);
            $actions = $actionCounts30d->get($member->id, 0);
            $lastLogin = $lastLogins->get($member->id);
            $lastActive = $lastSessions->get($member->id);

            // Engagement score: weighted formula max 100
            // Login frequency (40%): max at 30 logins/30d
            // Action frequency (60%): max at 100 actions/30d
            $loginScore = min($logins / 30, 1) * 40;
            $actionScore = min($actions / 100, 1) * 60;
            $engagementScore = (int) round($loginScore + $actionScore);

            // Status: active (session in last 5 min), recent (last 7 days), inactive
            $status = 'inactive';
            if ($lastActive && Carbon::createFromTimestamp($lastActive)->isAfter(Carbon::now()->subMinutes(5))) {
                $status = 'online';
            } elseif ($lastLogin && Carbon::parse($lastLogin)->isAfter($sevenDaysAgo)) {
                $status = 'recent';
            }

            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->pivot->role,
                'joined_at' => $member->pivot->created_at?->toISOString(),
                'last_login' => $lastLogin ? Carbon::parse($lastLogin)->toISOString() : null,
                'last_active' => $lastActive ? Carbon::createFromTimestamp($lastActive)->toISOString() : null,
                'logins_30d' => $logins,
                'actions_30d' => $actions,
                'engagement_score' => $engagementScore,
                'status' => $status,
            ];
        });

        // Summary stats
        $totalMembers = $members->count();
        $activeMembers = $memberActivity->whereIn('status', ['online', 'recent'])->count();
        $averageEngagement = $totalMembers > 0 ? (int) round($memberActivity->avg('engagement_score')) : 0;
        $totalActions30d = $memberActivity->sum('actions_30d');

        // Daily activity chart (last 14 days)
        $dailyActivity = collect(range(13, 0))->map(function ($daysAgo) use ($memberIds) {
            $date = Carbon::now()->subDays($daysAgo)->toDateString();

            $actions = Activity::whereIn('causer_id', $memberIds)
                ->where('causer_type', User::class)
                ->whereDate('created_at', $date)
                ->count();

            $logins = LoginActivity::whereIn('user_id', $memberIds)
                ->where('is_successful', true)
                ->whereDate('login_at', $date)
                ->count();

            return [
                'date' => $date,
                'actions' => $actions,
                'logins' => $logins,
            ];
        })->values();

        return Inertia::render('Team/activity-report', [
            'members' => $memberActivity->sortByDesc('engagement_score')->values(),
            'summary' => [
                'totalMembers' => $totalMembers,
                'activeMembers' => $activeMembers,
                'averageEngagement' => $averageEngagement,
                'totalActions30d' => $totalActions30d,
            ],
            'dailyActivity' => $dailyActivity,
        ]);
    }
}
