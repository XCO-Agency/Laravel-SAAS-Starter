<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription;

class RevenueAnalyticsController extends Controller
{
    /**
     * Display revenue analytics dashboard.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $plans = config('billing.plans', []);
        $priceToplan = $this->buildPriceMap($plans);

        // ── Subscription summary by status ──
        $statusCounts = Subscription::query()
            ->selectRaw('stripe_status, COUNT(*) as count')
            ->groupBy('stripe_status')
            ->pluck('count', 'stripe_status')
            ->toArray();

        $totalActive = $statusCounts['active'] ?? 0;
        $totalTrialing = $statusCounts['trialing'] ?? 0;
        $totalCanceled = $statusCounts['canceled'] ?? 0;
        $totalPastDue = $statusCounts['past_due'] ?? 0;

        // ── Plan distribution (active + trialing subs) ──
        $planDistribution = Subscription::query()
            ->whereIn('stripe_status', ['active', 'trialing'])
            ->selectRaw('stripe_price, COUNT(*) as count')
            ->groupBy('stripe_price')
            ->get()
            ->map(function ($row) use ($priceToplan) {
                return [
                    'plan' => $priceToplan[$row->stripe_price] ?? 'Unknown',
                    'price_id' => $row->stripe_price,
                    'count' => $row->count,
                ];
            })
            ->values();

        // ── MRR Calculation ──
        $mrr = $this->calculateMrr($plans);

        // ── Monthly subscription growth (last 6 months) ──
        $monthlySubscriptions = collect(range(5, 0))->map(function (int $monthsAgo) use ($now) {
            $start = $now->copy()->subMonths($monthsAgo)->startOfMonth();
            $end = $now->copy()->subMonths($monthsAgo)->endOfMonth();

            $newSubs = Subscription::whereBetween('created_at', [$start, $end])->count();
            $canceledSubs = Subscription::where('stripe_status', 'canceled')
                ->whereBetween('updated_at', [$start, $end])
                ->count();

            return [
                'month' => $start->format('M Y'),
                'new' => $newSubs,
                'canceled' => $canceledSubs,
                'net' => $newSubs - $canceledSubs,
            ];
        })->values();

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

        // ── Trial conversion rate ──
        $totalTrialsEver = Subscription::whereNotNull('trial_ends_at')->count();
        $convertedTrials = Subscription::whereNotNull('trial_ends_at')
            ->where('stripe_status', 'active')
            ->where('trial_ends_at', '<=', $now)
            ->count();

        $trialConversionRate = $totalTrialsEver > 0
            ? round(($convertedTrials / $totalTrialsEver) * 100, 1)
            : 0;

        // ── Workspaces on trial ──
        $workspacesOnTrial = Workspace::whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', $now)
            ->count();

        // ── Daily new subscriptions (last 30 days) ──
        $dailyNewSubs = collect(range(29, 0))->map(function (int $daysAgo) use ($now) {
            $date = $now->copy()->subDays($daysAgo)->toDateString();

            return [
                'date' => Carbon::parse($date)->format('M d'),
                'count' => Subscription::whereDate('created_at', $date)->count(),
            ];
        })->values();

        // ── Revenue by plan (estimated) ──
        $revenueByPlan = [];
        foreach ($plans as $key => $plan) {
            if ($key === 'free') {
                continue;
            }

            $monthlyPriceId = $plan['stripe_price_id']['monthly'] ?? null;
            $yearlyPriceId = $plan['stripe_price_id']['yearly'] ?? null;

            $monthlyCount = 0;
            $yearlyCount = 0;

            if ($monthlyPriceId) {
                $monthlyCount = Subscription::where('stripe_price', $monthlyPriceId)
                    ->whereIn('stripe_status', ['active', 'trialing'])
                    ->count();
            }

            if ($yearlyPriceId) {
                $yearlyCount = Subscription::where('stripe_price', $yearlyPriceId)
                    ->whereIn('stripe_status', ['active', 'trialing'])
                    ->count();
            }

            $monthlyRevenue = $monthlyCount * ($plan['price']['monthly'] ?? 0);
            $yearlyRevenue = $yearlyCount * round(($plan['price']['yearly'] ?? 0) / 12, 2);

            $revenueByPlan[] = [
                'plan' => $plan['name'],
                'monthly_subs' => $monthlyCount,
                'yearly_subs' => $yearlyCount,
                'estimated_mrr' => round($monthlyRevenue + $yearlyRevenue, 2),
            ];
        }

        return Inertia::render('admin/revenue-analytics', [
            'summary' => [
                'total_active' => $totalActive,
                'total_trialing' => $totalTrialing,
                'total_canceled' => $totalCanceled,
                'total_past_due' => $totalPastDue,
                'workspaces_on_trial' => $workspacesOnTrial,
            ],
            'mrr' => $mrr,
            'churnRate' => $churnRate,
            'trialConversionRate' => $trialConversionRate,
            'planDistribution' => $planDistribution,
            'monthlySubscriptions' => $monthlySubscriptions,
            'dailyNewSubs' => $dailyNewSubs,
            'revenueByPlan' => $revenueByPlan,
        ]);
    }

    /**
     * Build a map of stripe_price_id => plan name.
     *
     * @param  array<string, array<string, mixed>>  $plans
     * @return array<string, string>
     */
    private function buildPriceMap(array $plans): array
    {
        $map = [];
        foreach ($plans as $key => $plan) {
            $name = $plan['name'] ?? ucfirst($key);
            foreach (['monthly', 'yearly'] as $interval) {
                $priceId = $plan['stripe_price_id'][$interval] ?? null;
                if ($priceId) {
                    $map[$priceId] = $name.' ('.ucfirst($interval).')';
                }
            }
        }

        return $map;
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
