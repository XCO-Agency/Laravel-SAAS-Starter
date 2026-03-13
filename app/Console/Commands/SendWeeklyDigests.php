<?php

namespace App\Console\Commands;

use App\Models\Workspace;
use App\Notifications\WeeklyWorkspaceDigestNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendWeeklyDigests extends Command
{
    /** @var string */
    protected $signature = 'app:send-weekly-digests
                            {--dry-run : Show what would be sent without actually sending}';

    /** @var string */
    protected $description = 'Send weekly workspace activity digest emails to all workspace members';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->components->warn('DRY RUN — no digests will be sent.');
        }

        $total = 0;

        // Process workspaces that have at least one member beyond the owner
        Workspace::query()
            ->has('users')
            ->with(['users', 'owner'])
            ->get()
            ->each(function (Workspace $workspace) use ($dryRun, &$total) {
                $total += $this->processWorkspace($workspace, $dryRun);
            });

        $this->components->info("Weekly digests processed: {$total} notification".($total !== 1 ? 's' : '').' queued.');

        return self::SUCCESS;
    }

    /**
     * Build and dispatch digests for all members of a single workspace.
     */
    private function processWorkspace(Workspace $workspace, bool $dryRun): int
    {
        $memberCount = $workspace->users()->count();
        $memberDelta = $this->memberDelta($workspace);
        $activityCount = $this->activityCount($workspace);
        $recentEvents = $this->recentEvents($workspace);

        $sent = 0;

        foreach ($workspace->users as $member) {
            if ($dryRun) {
                $this->components->twoColumnDetail(
                    "Digest: {$workspace->name}",
                    "{$member->name} ({$activityCount} events, {$memberCount} members)"
                );
            } else {
                $member->notify(new WeeklyWorkspaceDigestNotification(
                    workspaceName: $workspace->name,
                    memberCount: $memberCount,
                    memberDelta: $memberDelta,
                    activityCount: $activityCount,
                    recentEvents: $recentEvents,
                ));
            }

            $sent++;
        }

        return $sent;
    }

    /**
     * Calculate the net change in member count over the last 7 days.
     */
    private function memberDelta(Workspace $workspace): int
    {
        $currentCount = $workspace->users()->count();

        $countAWeekAgo = DB::table('workspace_user')
            ->where('workspace_id', $workspace->id)
            ->where('created_at', '<', now()->subDays(7))
            ->count();

        return $currentCount - $countAWeekAgo;
    }

    /**
     * Count activity log events for this workspace in the last 7 days.
     */
    private function activityCount(Workspace $workspace): int
    {
        return DB::table('activity_log')
            ->where('subject_type', Workspace::class)
            ->where('subject_id', $workspace->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
    }

    /**
     * Fetch the 3 most recent activity log events for this workspace.
     *
     * @return array<int, array{description: string, created_at: string}>
     */
    private function recentEvents(Workspace $workspace): array
    {
        return DB::table('activity_log')
            ->where('subject_type', Workspace::class)
            ->where('subject_id', $workspace->id)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['description', 'created_at'])
            ->map(fn ($row) => [
                'description' => $row->description,
                'created_at' => Carbon::parse($row->created_at)->diffForHumans(),
            ])
            ->toArray();
    }
}
