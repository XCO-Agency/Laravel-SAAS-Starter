<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceTrashController extends Controller
{
    /**
     * Display a list of trashed workspaces for the authenticated user.
     */
    public function index(Request $request): Response
    {
        $trashedWorkspaces = Workspace::onlyTrashed()
            ->where('owner_id', $request->user()->id)
            ->latest('deleted_at')
            ->get()
            ->map(fn (Workspace $workspace) => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'deleted_at' => $workspace->deleted_at->toIso8601String(),
                'days_remaining' => max(0, 30 - $workspace->deleted_at->diffInDays(now())),
                'logo_url' => $workspace->logo_url,
            ]);

        return Inertia::render('workspaces/trash', [
            'trashedWorkspaces' => $trashedWorkspaces,
        ]);
    }

    /**
     * Restore a soft-deleted workspace.
     */
    public function restore(Request $request, int $workspaceId): JsonResponse
    {
        $workspace = Workspace::onlyTrashed()->findOrFail($workspaceId);

        Gate::authorize('restore', $workspace);

        $workspace->restore();

        // Set it as the user's current workspace
        $request->user()->switchWorkspace($workspace);

        return response()->json([
            'message' => 'Workspace restored successfully.',
        ]);
    }

    /**
     * Permanently delete a soft-deleted workspace.
     */
    public function forceDelete(Request $request, int $workspaceId): JsonResponse
    {
        $workspace = Workspace::onlyTrashed()->findOrFail($workspaceId);

        Gate::authorize('forceDelete', $workspace);

        // Detach all users
        $workspace->users()->detach();

        $workspace->forceDelete();

        return response()->json([
            'message' => 'Workspace permanently deleted.',
        ]);
    }
}
