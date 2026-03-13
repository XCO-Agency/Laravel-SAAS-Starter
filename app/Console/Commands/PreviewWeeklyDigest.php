<?php

namespace App\Console\Commands;

use App\Models\Workspace;
use App\Notifications\WeeklyWorkspaceDigestNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PreviewWeeklyDigest extends Command
{
    /** @var string */
    protected $signature = 'app:preview-weekly-digest {workspace : Workspace ID or slug}';

    /** @var string */
    protected $description = 'Preview the weekly digest email content for a workspace without sending it';

    public function handle(): int
    {
        $input = $this->argument('workspace');

        $workspace = Workspace::where('id', $input)
            ->orWhere('slug', $input)
            ->first();

        if (! $workspace) {
            $this->components->error("Workspace '{$input}' not found.");

            return self::FAILURE;
        }

        $memberCount = $workspace->users()->count();
        $memberDelta = $this->memberDelta($workspace);
        $activityCount = $this->activityCount($workspace);
        $recentEvents = $this->recentEvents($workspace);

        $notification = new WeeklyWorkspaceDigestNotification(
            workspaceName: $workspace->name,
            memberCount: $memberCount,
            memberDelta: $memberDelta,
            activityCount: $activityCount,
            recentEvents: $recentEvents,
        );

        $firstMember = $workspace->users()->first();
        $previewRecipient = $firstMember ?? (object) ['name' => 'Preview User', 'email' => 'preview@example.com'];
        $mail = $notification->toMail($previewRecipient);

        $this->components->info("Weekly Digest Preview — {$workspace->name}");
        $this->newLine();

        $this->line("<fg=yellow>Subject:</> {$mail->subject}");
        $this->line("<fg=yellow>To:</> {$previewRecipient->name} ({$previewRecipient->email})");
        $this->newLine();

        $this->line('<fg=cyan>--- Email Content ---</>');
        $this->line($mail->greeting);
        $this->newLine();

        foreach ($mail->introLines as $line) {
            $this->line($line);
        }

        $this->newLine();

        if ($mail->actionText) {
            $this->line("<fg=green>[ {$mail->actionText} ]</> → {$mail->actionUrl}");
            $this->newLine();
        }

        foreach ($mail->outroLines as $line) {
            $this->line($line);
        }

        $this->newLine();
        $this->line('<fg=cyan>--- Stats Summary ---</>');
        $this->components->twoColumnDetail('Workspace', $workspace->name);
        $this->components->twoColumnDetail('Members', (string) $memberCount);
        $this->components->twoColumnDetail('Member Delta (7d)', ($memberDelta >= 0 ? '+' : '').$memberDelta);
        $this->components->twoColumnDetail('Activity Events (7d)', (string) $activityCount);
        $this->components->twoColumnDetail('Recent Events Shown', (string) count($recentEvents));

        return self::SUCCESS;
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
