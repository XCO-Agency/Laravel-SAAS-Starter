<?php

namespace App\Http\Controllers;

use App\Events\WorkspaceActivityWasLogged;
use App\Models\ActivityReaction;
use App\Models\Workspace;
use Illuminate\Http\Request;

class ActivityReactionController extends Controller
{
    public function store(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'integer', 'exists:activity_log,id'],
            'reaction' => ['required', 'string', 'max:10'],
        ]);

        $activityId = $validated['activity_id'];
        $reaction = $validated['reaction'];
        $user = $request->user();

        // Toggle the reaction
        $added = ActivityReaction::toggle($activityId, $user->id, $reaction);

        // Get updated reaction counts
        $reactions = ActivityReaction::getGroupedForActivity($activityId);

        // Broadcast the reaction update to workspace members
        broadcast(new WorkspaceActivityWasLogged(
            $workspace,
            "Reaction {$reaction} ".($added ? 'added' : 'removed'),
            'info'
        ))->toOthers();

        return response()->json([
            'message' => $added ? 'Reaction added.' : 'Reaction removed.',
            'data' => [
                'added' => $added,
                'reaction' => $reaction,
                'activity_id' => $activityId,
                'reactions' => $reactions,
            ],
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, int $activityId)
    {
        $validated = $request->validate([
            'reaction' => ['required', 'string', 'max:10'],
        ]);

        $reaction = $validated['reaction'];
        $user = $request->user();

        ActivityReaction::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->where('reaction', $reaction)
            ->delete();

        // Get updated reaction counts
        $reactions = ActivityReaction::getGroupedForActivity($activityId);

        return response()->json([
            'message' => 'Reaction removed.',
            'data' => [
                'reactions' => $reactions,
            ],
        ]);
    }

    public function index(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'integer', 'exists:activity_log,id'],
        ]);

        $activityId = $validated['activity_id'];
        $user = $request->user();

        $reactions = ActivityReaction::with('user:id,name,email')
            ->where('activity_id', $activityId)
            ->get();

        // Group by reaction type
        $grouped = $reactions->groupBy('reaction')
            ->map(function ($group) use ($user) {
                return [
                    'count' => $group->count(),
                    'users' => $group->pluck('user.name'),
                    'has_reacted' => $group->contains('user_id', $user->id),
                ];
            });

        return response()->json([
            'data' => $grouped,
        ]);
    }
}
