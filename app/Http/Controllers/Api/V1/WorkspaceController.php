<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class WorkspaceController extends Controller
{
    /**
     * @group Workspaces
     *
     * APIs for managing workspaces and their API keys.
     */
    /**
     * List all workspaces.
     *
     * Returns a list of all workspaces the authenticated user belongs to.
     *
     * @authenticated
     *
     * @response {
     *  "data": [
     *   {
     *    "id": 1,
     *    "name": "Acme Corp",
     *    "slug": "acme-corp",
     *    "logo": "https://example.com/logo.png",
     *    "plan": "Pro",
     *    "created_at": "2024-01-01T00:00:00Z"
     *   }
     *  ]
     * }
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return WorkspaceResource::collection($request->user()->workspaces);
    }

    /**
     * Get workspace details.
     *
     * Returns detailed information about the workspace associated with the API key.
     *
     * @authenticated
     *
     * @response {
     *  "data": {
     *   "id": 1,
     *   "name": "Acme Corp",
     *   "slug": "acme-corp",
     *   "logo": "https://example.com/logo.png",
     *   "plan": "Pro",
     *   "created_at": "2024-01-01T00:00:00Z"
     *  }
     * }
     */
    public function show(Request $request): JsonResponse
    {
        $workspace = $request->attributes->get('workspace');

        return response()->json([
            'id' => $workspace->id,
            'name' => $workspace->name,
            'slug' => $workspace->slug,
            'plan' => $workspace->plan_name,
            'created_at' => $workspace->created_at->toIso8601String(),
        ]);
    }

    /**
     * List workspace members.
     *
     * Returns a list of all users who belong to this workspace.
     *
     * @authenticated
     *
     * @response {
     *  "data": [
     *   {
     *    "id": 1,
     *    "name": "Anass",
     *    "email": "anass@example.com",
     *    "role": "owner",
     *    "joined_at": "2024-01-01T00:00:00Z"
     *   }
     *  ]
     * }
     */
    public function members(Request $request): JsonResponse
    {
        $workspace = $request->attributes->get('workspace');

        return response()->json([
            'members' => $workspace->users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
            ])->values(),
        ]);
    }
}
