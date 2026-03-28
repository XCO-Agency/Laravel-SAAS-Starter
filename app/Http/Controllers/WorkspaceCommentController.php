<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkspaceCommentRequest;
use App\Models\Workspace;
use App\Models\WorkspaceComment;
use App\Services\MentionService;
use Illuminate\Http\Request;

class WorkspaceCommentController extends Controller
{
    public function index(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $commentableType = $request->input('commentable_type');
        $commentableId = $request->input('commentable_id');

        $comments = WorkspaceComment::with(['user', 'replies.user'])
            ->where('workspace_id', $workspace->id)
            ->when($commentableType && $commentableId, function ($query) use ($commentableType, $commentableId) {
                $query->forCommentable($commentableType, $commentableId);
            })
            ->rootComments()
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $comments->items(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    public function store(StoreWorkspaceCommentRequest $request, Workspace $workspace, MentionService $mentionService)
    {
        $comment = WorkspaceComment::create([
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
            'parent_id' => $request->input('parent_id'),
            'commentable_type' => $request->input('commentable_type'),
            'commentable_id' => $request->input('commentable_id'),
            'content' => $request->input('content'),
        ]);

        $comment->load('user');

        // Process mentions and send notifications
        $mentionService->processMentions($comment, $workspace);

        return response()->json([
            'message' => 'Comment posted successfully.',
            'data' => $comment,
        ], 201);
    }

    public function update(Request $request, Workspace $workspace, WorkspaceComment $comment)
    {
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $comment->update($validated);
        $comment->load('user');

        return response()->json([
            'message' => 'Comment updated successfully.',
            'data' => $comment,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, WorkspaceComment $comment)
    {
        $user = $request->user();
        $isOwner = $user->id === $comment->user_id;
        $isAdmin = $user->ownsWorkspace($workspace) || $user->userIsAdmin($workspace);

        if (! $isOwner && ! $isAdmin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ]);
    }

    public function replies(Request $request, Workspace $workspace, WorkspaceComment $comment)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $replies = $comment->replies()
            ->with('user')
            ->orderBy('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $replies->items(),
            'meta' => [
                'current_page' => $replies->currentPage(),
                'last_page' => $replies->lastPage(),
                'per_page' => $replies->perPage(),
                'total' => $replies->total(),
            ],
        ]);
    }
}
