<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OnboardingStepLog;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingInsightsController extends Controller
{
    /**
     * The ordered onboarding steps.
     *
     * @var list<string>
     */
    private const STEPS = ['welcome', 'workspace', 'plan'];

    /**
     * Display onboarding completion insights.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Total users who started onboarding (registered but tracked)
        $totalRegistered = User::where('created_at', '>=', $thirtyDaysAgo)->count();
        $totalOnboarded = User::whereNotNull('onboarded_at')
            ->where('onboarded_at', '>=', $thirtyDaysAgo)
            ->count();

        $completionRate = $totalRegistered > 0
            ? round(($totalOnboarded / $totalRegistered) * 100, 1)
            : 0;

        // ── Step funnel: unique users who viewed/completed each step ──
        $funnel = collect(self::STEPS)->map(function (string $step) use ($thirtyDaysAgo) {
            $viewed = OnboardingStepLog::where('step', $step)
                ->where('action', 'viewed')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->distinct('user_id')
                ->count('user_id');

            $completed = OnboardingStepLog::where('step', $step)
                ->where('action', 'completed')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->distinct('user_id')
                ->count('user_id');

            return [
                'step' => $step,
                'viewed' => $viewed,
                'completed' => $completed,
            ];
        })->values();

        // ── Drop-off points: users who viewed a step but didn't complete it ──
        $dropOff = collect(self::STEPS)->map(function (string $step) use ($thirtyDaysAgo) {
            $viewedUserIds = OnboardingStepLog::where('step', $step)
                ->where('action', 'viewed')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->pluck('user_id')
                ->unique();

            $completedUserIds = OnboardingStepLog::where('step', $step)
                ->where('action', 'completed')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->pluck('user_id')
                ->unique();

            $droppedCount = $viewedUserIds->diff($completedUserIds)->count();
            $dropRate = $viewedUserIds->count() > 0
                ? round(($droppedCount / $viewedUserIds->count()) * 100, 1)
                : 0;

            return [
                'step' => $step,
                'dropped' => $droppedCount,
                'drop_rate' => $dropRate,
            ];
        })->values();

        // ── Daily onboarding completions (14 days) ──
        $dailyCompletions = collect(range(13, 0))->map(function (int $daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'count' => User::whereNotNull('onboarded_at')
                    ->whereDate('onboarded_at', $date)
                    ->count(),
            ];
        })->values();

        // ── Average time to complete (onboarded users registered in last 30d) ──
        $avgMinutes = User::whereNotNull('onboarded_at')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('AVG(CAST((julianday(onboarded_at) - julianday(created_at)) * 1440 AS INTEGER)) as avg_minutes')
            ->value('avg_minutes');

        $avgTimeMinutes = $avgMinutes !== null ? round((float) $avgMinutes, 1) : null;

        return Inertia::render('admin/onboarding-insights', [
            'metrics' => [
                'total_registered' => $totalRegistered,
                'total_onboarded' => $totalOnboarded,
                'completion_rate' => $completionRate,
                'avg_time_minutes' => $avgTimeMinutes,
            ],
            'funnel' => $funnel,
            'dropOff' => $dropOff,
            'dailyCompletions' => $dailyCompletions,
        ]);
    }
}
