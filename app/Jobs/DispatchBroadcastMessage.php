<?php

namespace App\Jobs;

use App\Models\BroadcastMessage;
use App\Models\User;
use App\Notifications\PlatformBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class DispatchBroadcastMessage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public BroadcastMessage $broadcast)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $query = User::query();

        if ($this->broadcast->target_segment === 'workspace_owners') {
            $query->whereHas('ownedWorkspaces');
        } elseif ($this->broadcast->target_segment === 'super_admins') {
            $query->where('is_superadmin', true);
        }
        // 'all_users' is the default and applies no filters

        $query->chunkById(100, function ($users) {
            Notification::send($users, new PlatformBroadcast($this->broadcast));
        });
    }
}
