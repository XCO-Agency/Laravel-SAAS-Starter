<?php

namespace App\Observers;

use App\Events\WorkspaceActivityWasLogged;
use App\Models\Workspace;
use Spatie\Activitylog\Models\Activity;

class ActivityLogObserver
{
    /**
     * Handle the Activity "created" event.
     */
    public function created(Activity $activity): void
    {
        // We only care about workspace logs
        if ($activity->log_name !== 'workspace') {
            return;
        }

        $workspace = null;

        // Try to resolve workspace from subject
        if ($activity->subject instanceof Workspace) {
            $workspace = $activity->subject;
        } elseif ($activity->subject && isset($activity->subject->workspace_id)) {
            $workspace = Workspace::find($activity->subject->workspace_id);
        }

        if ($workspace) {
            broadcast(new WorkspaceActivityWasLogged(
                $workspace,
                $activity->description,
                $this->getLogType($activity->event)
            ));
        }
    }

    /**
     * Map activity event to a semantic type (info, success, warning).
     */
    protected function getLogType(?string $event): string
    {
        return match ($event) {
            'created' => 'success',
            'deleted' => 'warning',
            default => 'info',
        };
    }
}
