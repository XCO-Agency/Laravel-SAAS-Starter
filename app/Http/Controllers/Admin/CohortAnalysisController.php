<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CohortAnalysisController extends Controller
{
    /**
     * Number of months of cohort history to show.
     */
    private const COHORT_MONTHS = 6;

    /**
     * Number of retention months to track per cohort.
     */
    private const RETENTION_MONTHS = 3;

    /**
     * Display the admin cohort retention analysis dashboard.
     */
    public function index(): Response
    {
        $cohorts = $this->buildCohorts();

        return Inertia::render('admin/cohort-analysis', [
            'cohorts' => $cohorts,
        ]);
    }

    /**
     * Build retention cohort data for the last N months.
     *
     * Each cohort row contains:
     *   - month: formatted label (e.g. "Oct 2025")
     *   - size: number of users who signed up in that month
     *   - retention: array of percentages [month_0=100, month_1, month_2, month_3]
     *
     * @return array<int, array{month: string, size: int, retention: array<int, int>}>
     */
    private function buildCohorts(): array
    {
        $now = Carbon::now();
        $cohorts = [];

        for ($i = self::COHORT_MONTHS - 1; $i >= 0; $i--) {
            $cohortStart = $now->copy()->subMonths($i)->startOfMonth();
            $cohortEnd = $now->copy()->subMonths($i)->endOfMonth();

            // Users who signed up in this calendar month
            $cohortUserIds = User::whereBetween('created_at', [$cohortStart, $cohortEnd])
                ->pluck('id');

            $cohortSize = $cohortUserIds->count();

            $retention = [100]; // month_0 is always 100%

            for ($m = 1; $m <= self::RETENTION_MONTHS; $m++) {
                if ($cohortSize === 0) {
                    $retention[] = 0;

                    continue;
                }

                // Retention window: the Mth calendar month after cohort signup
                $windowStart = $cohortStart->copy()->addMonths($m)->startOfMonth();
                $windowEnd = $cohortStart->copy()->addMonths($m)->endOfMonth();

                // Don't calculate future months
                if ($windowStart->isAfter($now)) {
                    $retention[] = null;

                    continue;
                }

                $retained = LoginActivity::where('is_successful', true)
                    ->whereBetween('login_at', [$windowStart, $windowEnd])
                    ->whereIn('user_id', $cohortUserIds)
                    ->distinct('user_id')
                    ->count('user_id');

                $retention[] = $cohortSize > 0 ? (int) round(($retained / $cohortSize) * 100) : 0;
            }

            $cohorts[] = [
                'month' => $cohortStart->format('M Y'),
                'size' => $cohortSize,
                'retention' => $retention,
            ];
        }

        return $cohorts;
    }
}
