<?php

namespace App\Http\Controllers;

use App\Models\LoginActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceRetentionController extends Controller
{
    /**
     * Return member retention insights for the current workspace (dashboard widget).
     */
    public function index(Request $request): JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;

        $memberIds = $workspace->users()->pluck('users.id');

        $totalMembers = $memberIds->count();

        $activeCount = LoginActivity::whereIn('user_id', $memberIds)
            ->where('is_successful', true)
            ->where('login_at', '>=', now()->subDays(30))
            ->distinct('user_id')
            ->count('user_id');

        $retentionRate = $totalMembers > 0
            ? (int) round(($activeCount / $totalMembers) * 100)
            : 0;

        return response()->json([
            'total_members' => $totalMembers,
            'active_last_30_days' => $activeCount,
            'retention_rate' => $retentionRate,
        ]);
    }
}
