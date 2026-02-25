<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class WorkspaceActivityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Workspace $workspace): Response
    {
        Gate::authorize('viewActivityLogging', $workspace);

        // Spatie activity log records the model class name 
        // in 'subject_type' and ID in 'subject_id'
        $activities = Activity::where(function ($query) use ($workspace) {
            $query->where('subject_type', Workspace::class)
                  ->where('subject_id', $workspace->id);
        })->orWhere(function ($query) use ($workspace) {
            // Include potential future models bound directly to workspaces
            $query->where('properties->workspace_id', $workspace->id);
        })
        ->with('causer')
        ->latest()
        ->paginate(20);

        return Inertia::render('workspaces/activity/index', [
            'workspace' => $workspace,
            'activities' => $activities,
        ]);
    }
}
