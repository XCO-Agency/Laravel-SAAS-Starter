<?php

namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkspaceMemberRoleUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Workspace $workspace, public User $member, public string $role) {}
}
