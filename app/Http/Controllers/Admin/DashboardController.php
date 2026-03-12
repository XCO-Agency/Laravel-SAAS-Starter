<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with SaaS metrics.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Core counts
        $totalUsers = User::count();
        $totalWorkspaces = Workspace::count();
        $activeSubscriptions = Subscription::where('stripe_status', 'active')->count();

        // Growth: users registered in last 30d vs prior 30d
        $newUsersThisPeriod = User::where('created_at', '>=', $thirtyDaysAgo)->count();
        $newUsersPriorPeriod = User::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $userGrowthPercent = $newUsersPriorPeriod > 0
            ? round((($newUsersThisPeriod - $newUsersPriorPeriod) / $newUsersPriorPeriod) * 100, 1)
            : ($newUsersThisPeriod > 0 ? 100 : 0);

        // Growth: workspaces created in last 30d vs prior 30d
        $newWorkspacesThisPeriod = Workspace::where('created_at', '>=', $thirtyDaysAgo)->count();
        $newWorkspacesPriorPeriod = Workspace::whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();
        $workspaceGrowthPercent = $newWorkspacesPriorPeriod > 0
            ? round((($newWorkspacesThisPeriod - $newWorkspacesPriorPeriod) / $newWorkspacesPriorPeriod) * 100, 1)
            : ($newWorkspacesThisPeriod > 0 ? 100 : 0);

        // ── MRR Calculation ──
        $plans = config('billing.plans', []);
        $mrr = $this->calculateMrr($plans);

        // ── Churn rate (canceled in last 30 days / active at start of period) ──
        $canceledLast30 = Subscription::where('stripe_status', 'canceled')
            ->where('updated_at', '>=', $now->copy()->subDays(30))
            ->count();

        $activeAtPeriodStart = Subscription::whereIn('stripe_status', ['active', 'trialing'])
            ->where('created_at', '<', $now->copy()->subDays(30))
            ->count();

        $churnRate = $activeAtPeriodStart > 0
            ? round(($canceledLast30 / ($activeAtPeriodStart + $canceledLast30)) * 100, 1)
            : 0;

        // Daily signups for the last 14 days (for sparkline chart)
        $dailySignups = collect(range(13, 0))->map(function ($daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'count' => User::whereDate('created_at', $date)->count(),
            ];
        })->values();

        // Daily workspaces for the last 14 days
        $dailyWorkspaces = collect(range(13, 0))->map(function ($daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'count' => Workspace::whereDate('created_at', $date)->count(),
            ];
        })->values();

        // Plan distribution
        $planDistribution = [];
        foreach ($plans as $key => $plan) {
            if ($key === 'free') {
                $planDistribution[] = [
                    'plan' => $plan['name'],
                    'count' => Workspace::count() - $activeSubscriptions,
                ];
            } else {
                $monthlyPriceId = $plan['stripe_price_id']['monthly'] ?? null;
                $yearlyPriceId = $plan['stripe_price_id']['yearly'] ?? null;
                $priceIds = array_filter([$monthlyPriceId, $yearlyPriceId]);

                $count = $priceIds
                    ? Subscription::where('stripe_status', 'active')->whereIn('stripe_price', $priceIds)->count()
                    : 0;

                $planDistribution[] = [
                    'plan' => $plan['name'],
                    'count' => $count,
                ];
            }
        }

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'total_users' => $totalUsers,
                'total_workspaces' => $totalWorkspaces,
                'active_subscriptions' => $activeSubscriptions,
                'new_users_30d' => $newUsersThisPeriod,
                'user_growth_percent' => $userGrowthPercent,
                'workspace_growth_percent' => $workspaceGrowthPercent,
                'mrr' => $mrr,
                'churn_rate' => $churnRate,
            ],
            'dailySignups' => $dailySignups,
            'dailyWorkspaces' => $dailyWorkspaces,
            'planDistribution' => $planDistribution,
            'recent_users' => User::latest()->limit(5)->get(['id', 'name', 'email', 'created_at']),
        ]);
    }

    /**
     * Calculate estimated Monthly Recurring Revenue from active subscriptions.
     */
    private function calculateMrr(array $plans): float
    {
        $mrr = 0.0;

        foreach ($plans as $key => $plan) {
            if ($key === 'free') {
                continue;
            }

            $monthlyPriceId = $plan['stripe_price_id']['monthly'] ?? null;
            $yearlyPriceId = $plan['stripe_price_id']['yearly'] ?? null;

            if ($monthlyPriceId) {
                $count = Subscription::where('stripe_price', $monthlyPriceId)
                    ->whereIn('stripe_status', ['active', 'trialing'])
                    ->sum(DB::raw('COALESCE(quantity, 1)'));
                $mrr += $count * ($plan['price']['monthly'] ?? 0);
            }

            if ($yearlyPriceId) {
                $count = Subscription::where('stripe_price', $yearlyPriceId)
                    ->whereIn('stripe_status', ['active', 'trialing'])
                    ->sum(DB::raw('COALESCE(quantity, 1)'));
                $mrr += $count * round(($plan['price']['yearly'] ?? 0) / 12, 2);
            }
        }

        return round($mrr, 2);
    }
}
