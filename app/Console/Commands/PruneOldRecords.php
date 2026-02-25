<?php

namespace App\Console\Commands;

use App\Models\Feedback;
use App\Models\WebhookLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneOldRecords extends Command
{
    /** @var string */
    protected $signature = 'app:prune-old-records
                            {--dry-run : Report what would be deleted without actually deleting}';

    /** @var string */
    protected $description = 'Prune old records based on the retention policy in config/retention.php';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->components->warn('DRY RUN — no records will be deleted.');
        }

        $results = [];

        // 1. Notifications
        $cfg = config('retention.notifications');
        if ($cfg['enabled']) {
            $cutoff = now()->subDays((int) $cfg['days']);
            $query = DB::table('notifications')->where('created_at', '<', $cutoff);

            if ($cfg['read_only']) {
                $query->whereNotNull('read_at');
            }

            $count = $query->count();

            if (! $dryRun && $count > 0) {
                $query->delete();
            }

            $results[] = ['Notifications', $cfg['days'].' days'.($cfg['read_only'] ? ' (read only)' : ''), $count, $dryRun ? 'skipped' : 'deleted'];
        }

        // 2. Activity Log (Spatie)
        $cfg = config('retention.activity_log');
        if ($cfg['enabled']) {
            $cutoff = now()->subDays((int) $cfg['days']);
            $query = DB::table('activity_log')->where('created_at', '<', $cutoff);
            $count = $query->count();

            if (! $dryRun && $count > 0) {
                $query->delete();
            }

            $results[] = ['Activity Log', $cfg['days'].' days', $count, $dryRun ? 'skipped' : 'deleted'];
        }

        // 3. Webhook Logs
        $cfg = config('retention.webhook_logs');
        if ($cfg['enabled']) {
            $cutoff = now()->subDays((int) $cfg['days']);
            $query = WebhookLog::query()->where('created_at', '<', $cutoff);
            $count = $query->count();

            if (! $dryRun && $count > 0) {
                $query->delete();
            }

            $results[] = ['Webhook Logs', $cfg['days'].' days', $count, $dryRun ? 'skipped' : 'deleted'];
        }

        // 4. Feedback
        $cfg = config('retention.feedback');
        if ($cfg['enabled']) {
            $cutoff = now()->subDays((int) $cfg['days']);
            $query = Feedback::query()->where('created_at', '<', $cutoff);

            if ($cfg['archived_only']) {
                $query->where('status', 'archived');
            }

            $count = $query->count();

            if (! $dryRun && $count > 0) {
                $query->delete();
            }

            $results[] = ['Feedback', $cfg['days'].' days'.($cfg['archived_only'] ? ' (archived only)' : ''), $count, $dryRun ? 'skipped' : 'deleted'];
        }

        $this->table(['Model', 'Retention Period', 'Records', 'Action'], $results);

        $total = array_sum(array_column($results, 2));
        $this->components->info($dryRun
            ? "Dry run complete. {$total} record(s) would be pruned."
            : "Pruning complete. {$total} record(s) deleted.");

        return self::SUCCESS;
    }
}
