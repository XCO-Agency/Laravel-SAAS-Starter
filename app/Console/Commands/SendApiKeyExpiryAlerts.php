<?php

namespace App\Console\Commands;

use App\Models\WorkspaceApiKey;
use App\Notifications\ApiKeyExpiryNotification;
use Illuminate\Console\Command;

class SendApiKeyExpiryAlerts extends Command
{
    /** @var string */
    protected $signature = 'app:send-api-key-expiry-alerts
                            {--dry-run : Show what would be sent without actually sending}';

    /** @var string */
    protected $description = 'Send expiry alerts for workspace API keys expiring within 7 days';

    /**
     * Days ahead to warn about expiring API keys.
     */
    private const WARNING_DAYS = [1, 3, 7];

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->components->warn('DRY RUN — no notifications will be sent.');
        }

        $alertCount = 0;

        WorkspaceApiKey::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(max(self::WARNING_DAYS)))
            ->with(['workspace.owner'])
            ->chunk(100, function ($keys) use ($dryRun, &$alertCount) {
                foreach ($keys as $key) {
                    $workspace = $key->workspace;
                    $owner = $workspace?->owner;

                    if (! $workspace || ! $owner) {
                        continue;
                    }

                    $daysUntilExpiry = max(0, (int) ceil(now()->floatDiffInDays($key->expires_at, false)));

                    if (! in_array($daysUntilExpiry, self::WARNING_DAYS)) {
                        continue;
                    }

                    if ($dryRun) {
                        $this->components->twoColumnDetail(
                            "API key expiring: {$key->name} ({$workspace->name})",
                            "{$owner->name} ({$daysUntilExpiry} day(s) left)"
                        );
                    } else {
                        $owner->notify(new ApiKeyExpiryNotification(
                            $workspace->name,
                            $key->name,
                            $daysUntilExpiry,
                        ));
                    }

                    $alertCount++;
                }
            });

        $this->components->info("API key expiry alerts processed: {$alertCount} key(s) notified.");

        return self::SUCCESS;
    }
}
