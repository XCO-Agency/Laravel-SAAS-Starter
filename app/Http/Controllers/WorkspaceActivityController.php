<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class WorkspaceActivityController extends Controller
{
    /**
     * Display workspace activity feed.
     */
    public function index(Request $request, Workspace $workspace): Response
    {
        Gate::authorize('viewActivityLogging', $workspace);

        $eventFilter = $request->input('event');

        $query = Activity::where(function ($q) use ($workspace) {
            $q->where(function ($sub) use ($workspace) {
                $sub->where('subject_type', Workspace::class)
                    ->where('subject_id', $workspace->id);
            })->orWhere(function ($sub) use ($workspace) {
                $sub->where('properties->workspace_id', $workspace->id);
            })->orWhere(function ($sub) use ($workspace) {
                // Capture user-level events for workspace members
                $sub->where('subject_type', User::class)
                    ->whereIn('subject_id', $workspace->users()->pluck('users.id'));
            });
        })
            ->with('causer:id,name,email');

        if ($eventFilter && $eventFilter !== 'all') {
            $query->where('event', $eventFilter);
        }

        $activities = $query->latest()->paginate(25)->through(fn (Activity $a) => [
            'id' => $a->id,
            'description' => $a->description,
            'event' => $a->event,
            'subject_type' => class_basename($a->subject_type ?? ''),
            'causer_name' => $a->causer?->name ?? 'System',
            'properties' => $a->properties->toArray(),
            'created_at' => $a->created_at?->toISOString(),
        ]);

        $eventTypes = Activity::where(function ($q) use ($workspace) {
            $q->where(function ($sub) use ($workspace) {
                $sub->where('subject_type', Workspace::class)
                    ->where('subject_id', $workspace->id);
            })->orWhere(function ($sub) use ($workspace) {
                $sub->where('properties->workspace_id', $workspace->id);
            });
        })
            ->distinct()
            ->pluck('event')
            ->filter()
            ->values();

        return Inertia::render('workspaces/activity/index', [
            'workspace' => $workspace,
            'activities' => $activities,
            'eventTypes' => $eventTypes,
            'currentFilter' => $eventFilter ?? 'all',
        ]);
    }
}
