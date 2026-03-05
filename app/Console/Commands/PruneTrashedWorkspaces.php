<?php

namespace App\Console\Commands;

use App\Models\Workspace;
use Illuminate\Console\Command;

class PruneTrashedWorkspaces extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workspaces:prune-trashed {--days=30 : Number of days after which trashed workspaces are permanently deleted}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete workspaces that have been in the trash beyond the grace period';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');

        $workspaces = Workspace::onlyTrashed()
            ->where('deleted_at', '<=', now()->subDays($days))
            ->get();

        $count = $workspaces->count();

        $workspaces->each(function (Workspace $workspace) {
            $workspace->users()->detach();
            $workspace->forceDelete();
        });

        $this->info("Permanently deleted {$count} workspace(s) trashed more than {$days} days ago.");

        return self::SUCCESS;
    }
}
