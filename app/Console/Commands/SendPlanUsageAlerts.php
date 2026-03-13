<?php

namespace App\Console\Commands;

use App\Models\Workspace;
use App\Notifications\PlanUsageLimitNotification;
use App\Services\PlanLimitService;
use Illuminate\Console\Command;

class SendPlanUsageAlerts extends Command
{
    /** @var string */
    protected $signature = 'app:send-plan-usage-alerts
                            {--dry-run : Show what would be sent without actually sending}';

    /** @var string */
    protected $description = 'Alert workspace owners when they are approaching their plan limits (≥80%)';

    /**
     * Percentage threshold above which a usage alert is triggered.
     */
    private const THRESHOLD = 80;

    public function handle(PlanLimitService $planLimitService): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->components->warn('DRY RUN — no alerts will be sent.');
        }

        $alertCount = 0;

        Workspace::query()
            ->with(['owner', 'users', 'invitations', 'apiKeys', 'webhookEndpoints'])
            ->chunk(100, function ($workspaces) use ($planLimitService, $dryRun, &$alertCount) {
                foreach ($workspaces as $workspace) {
                    $owner = $workspace->owner;

                    if (! $owner) {
                        continue;
                    }

                    $nearLimits = $this->computeNearLimits($workspace, $planLimitService);

                    if (empty($nearLimits)) {
                        continue;
                    }

                    if ($dryRun) {
                        foreach ($nearLimits as $limit) {
                            $this->components->twoColumnDetail(
                                "Usage alert: {$workspace->name} — {$limit['label']}",
                                "{$limit['used']}/{$limit['limit']} ({$limit['percent']}%)"
                            );
                        }
                    } else {
                        $owner->notify(new PlanUsageLimitNotification($workspace->name, $nearLimits));
                    }

                    $alertCount++;
                }
            });

        $this->components->info("Plan usage alerts processed: {$alertCount} workspace(s) notified.");

        return self::SUCCESS;
    }

    /**
     * Compute which resource dimensions are at or above the alert threshold.
     *
     * @return array<int, array{label: string, used: int, limit: int, percent: int}>
     */
    private function computeNearLimits(Workspace $workspace, PlanLimitService $planLimitService): array
    {
        $limits = $planLimitService->getLimits($workspace->plan_name);
        $nearLimits = [];

        $dimensions = [
            'team_members' => [
                'label' => 'Team Members',
                'used' => $workspace->users->count() + $workspace->invitations->count(),
            ],
            'api_keys' => [
                'label' => 'API Keys',
                'used' => $workspace->apiKeys->count(),
            ],
            'webhooks' => [
                'label' => 'Webhooks',
                'used' => $workspace->webhookEndpoints->count(),
            ],
        ];

        foreach ($dimensions as $key => $dimension) {
            if (! isset($limits[$key])) {
                continue;
            }

            $limit = $limits[$key];

            // Skip unlimited (-1) or very large limits
            if ($limit === -1 || $limit >= 999) {
                continue;
            }

            $used = $dimension['used'];
            $percent = $limit > 0 ? (int) round(($used / $limit) * 100) : 100;

            if ($percent >= self::THRESHOLD) {
                $nearLimits[] = [
                    'label' => $dimension['label'],
                    'used' => $used,
                    'limit' => $limit,
                    'percent' => $percent,
                ];
            }
        }

        return $nearLimits;
    }
}
