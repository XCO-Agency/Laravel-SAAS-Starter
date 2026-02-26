<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\ChangelogEntry;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Perform global search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->get('query');

        if (empty($query)) {
            return response()->json([]);
        }

        $results = collect();

        $currentUser = $request->user();

        // 1. Search Users
        if ($currentUser->is_superadmin) {
            $users = User::search($query)->take(5)->get();
        } else {
            // Only search members of the current workspace
            $users = $currentUser->currentWorkspace->users()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->take(5)
                ->get();
        }

        foreach ($users as $user) {
            $results->push([
                'type' => 'User',
                'title' => $user->name,
                'subtitle' => $user->email,
                'url' => $currentUser->is_superadmin ? route('admin.users.index') : route('team.index'),
                'icon' => 'User',
            ]);
        }

        // 2. Search Workspaces
        if ($currentUser->is_superadmin) {
            $workspaces = Workspace::search($query)->take(5)->get();
        } else {
            // Only search workspaces the user belongs to
            $workspaces = $currentUser->workspaces()
                ->where('name', 'like', "%{$query}%")
                ->take(5)
                ->get();
        }

        foreach ($workspaces as $workspace) {
            $results->push([
                'type' => 'Workspace',
                'title' => $workspace->name,
                'subtitle' => $workspace->slug,
                'url' => route('workspaces.settings'),
                'icon' => 'Building',
            ]);
        }

        // 3. Search Announcements (Accessible to all)
        $announcements = Announcement::search($query)->take(5)->get();
        foreach ($announcements as $announcement) {
            $results->push([
                'type' => 'Announcement',
                'title' => $announcement->title,
                'subtitle' => 'Announcement',
                'url' => $currentUser->is_superadmin ? route('admin.announcements.index') : '#',
                'icon' => 'Megaphone',
            ]);
        }

        // 4. Search Changelog (Publicly accessible)
        $changelogs = ChangelogEntry::search($query)->take(5)->get();
        foreach ($changelogs as $entry) {
            $results->push([
                'type' => 'Changelog',
                'title' => $entry->title,
                'subtitle' => 'Version '.$entry->version,
                'url' => route('changelog'),
                'icon' => 'History',
            ]);
        }

        return response()->json($results->groupBy('type'));
    }
}
