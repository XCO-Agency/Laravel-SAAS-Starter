<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceAnnouncement;
use App\Models\WorkspaceComment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

class WorkspaceSearchController extends Controller
{
    public function search(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
            'type' => ['nullable', 'string', 'in:all,activity,comment,announcement,member'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $query = $validated['q'];
        $type = $validated['type'] ?? 'all';
        $perPage = $validated['per_page'] ?? 10;

        $results = [
            'activities' => [],
            'comments' => [],
            'announcements' => [],
            'members' => [],
        ];

        $totalCount = 0;

        // Search activities
        if ($type === 'all' || $type === 'activity') {
            $activities = Activity::where('log_name', 'workspace_'.$workspace->id)
                ->where(function ($q) use ($query) {
                    $q->where('description', 'like', "%{$query}%")
                        ->orWhereJsonContains('properties->name', $query);
                })
                ->with('causer:id,name')
                ->orderByDesc('created_at')
                ->limit($perPage)
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'type' => 'activity',
                    'title' => $activity->description,
                    'description' => $activity->properties['name'] ?? '',
                    'causer' => $activity->causer?->name ?? 'System',
                    'created_at' => $activity->created_at,
                    'url' => null,
                ]);

            $results['activities'] = $activities;
            $totalCount += $activities->count();
        }

        // Search comments
        if ($type === 'all' || $type === 'comment') {
            $comments = WorkspaceComment::where('workspace_id', $workspace->id)
                ->where('content', 'like', "%{$query}%")
                ->with('user:id,name')
                ->orderByDesc('created_at')
                ->limit($perPage)
                ->get()
                ->map(fn ($comment) => [
                    'id' => $comment->id,
                    'type' => 'comment',
                    'title' => 'Comment by '.$comment->user->name,
                    'description' => Str::limit($comment->content, 150),
                    'causer' => $comment->user->name,
                    'created_at' => $comment->created_at,
                    'url' => null,
                ]);

            $results['comments'] = $comments;
            $totalCount += $comments->count();
        }

        // Search announcements
        if ($type === 'all' || $type === 'announcement') {
            $announcements = WorkspaceAnnouncement::where('workspace_id', $workspace->id)
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                })
                ->with('user:id,name')
                ->orderByDesc('created_at')
                ->limit($perPage)
                ->get()
                ->map(fn ($announcement) => [
                    'id' => $announcement->id,
                    'type' => 'announcement',
                    'title' => $announcement->title,
                    'description' => Str::limit(strip_tags($announcement->content), 150),
                    'causer' => $announcement->user->name,
                    'created_at' => $announcement->created_at,
                    'url' => route('workspaces.announcements.show', ['workspace' => $workspace->id, 'announcement' => $announcement->id]),
                ]);

            $results['announcements'] = $announcements;
            $totalCount += $announcements->count();
        }

        // Search members
        if ($type === 'all' || $type === 'member') {
            $members = $workspace->users()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->select('users.id', 'users.name', 'users.email', 'users.avatar_url')
                ->limit($perPage)
                ->get()
                ->map(fn ($member) => [
                    'id' => $member->id,
                    'type' => 'member',
                    'title' => $member->name,
                    'description' => $member->email,
                    'causer' => $member->name,
                    'created_at' => null,
                    'url' => null,
                    'avatar_url' => $member->avatar_url,
                ]);

            $results['members'] = $members;
            $totalCount += $members->count();
        }

        // Flatten results for 'all' type
        if ($type === 'all') {
            $allResults = collect($results)
                ->flatten(1)
                ->sortByDesc('created_at')
                ->values()
                ->take($perPage);

            return response()->json([
                'data' => $allResults,
                'meta' => [
                    'query' => $query,
                    'total_count' => $totalCount,
                    'type' => $type,
                ],
                'facets' => [
                    'activities' => count($results['activities']),
                    'comments' => count($results['comments']),
                    'announcements' => count($results['announcements']),
                    'members' => count($results['members']),
                ],
            ]);
        }

        // Return specific type results
        $typeKey = $type.'s';

        return response()->json([
            'data' => $results[$typeKey] ?? [],
            'meta' => [
                'query' => $query,
                'total_count' => $totalCount,
                'type' => $type,
            ],
        ]);
    }

    public function suggestions(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1', 'max:50'],
        ]);

        $query = $validated['q'];

        $suggestions = [];

        // Get recent activities matching query
        $activitySuggestions = Activity::where('log_name', 'workspace_'.$workspace->id)
            ->where('description', 'like', "%{$query}%")
            ->distinct('description')
            ->limit(3)
            ->pluck('description');

        foreach ($activitySuggestions as $description) {
            $suggestions[] = [
                'text' => $description,
                'type' => 'activity',
            ];
        }

        // Get member names
        $memberSuggestions = $workspace->users()
            ->where('name', 'like', "%{$query}%")
            ->limit(3)
            ->pluck('name');

        foreach ($memberSuggestions as $name) {
            $suggestions[] = [
                'text' => $name,
                'type' => 'member',
            ];
        }

        // Get announcement titles
        $announcementSuggestions = WorkspaceAnnouncement::where('workspace_id', $workspace->id)
            ->where('title', 'like', "%{$query}%")
            ->limit(3)
            ->pluck('title');

        foreach ($announcementSuggestions as $title) {
            $suggestions[] = [
                'text' => $title,
                'type' => 'announcement',
            ];
        }

        return response()->json([
            'data' => $suggestions,
        ]);
    }
}
