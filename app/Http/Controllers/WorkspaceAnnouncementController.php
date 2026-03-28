<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkspaceAnnouncementRequest;
use App\Models\Workspace;
use App\Models\WorkspaceAnnouncement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceAnnouncementController extends Controller
{
    public function index(Request $request, Workspace $workspace)
    {
        $user = $request->user();

        $announcements = WorkspaceAnnouncement::with('user')
            ->forWorkspace($workspace->id)
            ->active()
            ->orderByDesc('pinned')
            ->orderByDesc('created_at')
            ->paginate(10);

        // Add read status for the current user
        $announcements->getCollection()->transform(function ($announcement) use ($user) {
            $announcement->is_read = $announcement->isReadBy($user);

            return $announcement;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $announcements->items(),
                'meta' => [
                    'current_page' => $announcements->currentPage(),
                    'last_page' => $announcements->lastPage(),
                    'per_page' => $announcements->perPage(),
                    'total' => $announcements->total(),
                ],
            ]);
        }

        return Inertia::render('workspaces/announcements/index', [
            'workspace' => $workspace,
            'announcements' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
            ],
            'canManage' => $user->ownsWorkspace($workspace) || $user->userIsAdmin($workspace),
        ]);
    }

    public function store(StoreWorkspaceAnnouncementRequest $request, Workspace $workspace)
    {
        $announcement = WorkspaceAnnouncement::create([
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'type' => $request->input('type', 'info'),
            'pinned' => $request->boolean('pinned', false),
            'dismissible' => $request->boolean('dismissible', true),
            'published_at' => $request->input('published_at') ? now() : null,
            'expires_at' => $request->input('expires_at'),
        ]);

        $announcement->load('user');

        return response()->json([
            'message' => 'Announcement created successfully.',
            'data' => $announcement,
        ], 201);
    }

    public function show(Request $request, Workspace $workspace, WorkspaceAnnouncement $announcement)
    {
        $announcement->load('user');
        $announcement->is_read = $announcement->isReadBy($request->user());

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $announcement,
            ]);
        }

        return Inertia::render('workspaces/announcements/show', [
            'workspace' => $workspace,
            'announcement' => $announcement,
        ]);
    }

    public function update(StoreWorkspaceAnnouncementRequest $request, Workspace $workspace, WorkspaceAnnouncement $announcement)
    {
        $announcement->update([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'type' => $request->input('type'),
            'pinned' => $request->boolean('pinned'),
            'dismissible' => $request->boolean('dismissible'),
            'published_at' => $request->input('published_at') ? now() : null,
            'expires_at' => $request->input('expires_at'),
        ]);

        $announcement->load('user');

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'data' => $announcement,
        ]);
    }

    public function destroy(Workspace $workspace, WorkspaceAnnouncement $announcement)
    {
        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully.',
        ]);
    }

    public function dismiss(Request $request, Workspace $workspace, WorkspaceAnnouncement $announcement)
    {
        $announcement->markAsReadBy($request->user());

        return response()->json([
            'message' => 'Announcement dismissed.',
        ]);
    }

    public function pin(Request $request, Workspace $workspace, WorkspaceAnnouncement $announcement)
    {
        // Unpin any currently pinned announcements
        if ($request->boolean('pinned')) {
            WorkspaceAnnouncement::forWorkspace($workspace->id)
                ->pinned()
                ->update(['pinned' => false]);
        }

        $announcement->update(['pinned' => $request->boolean('pinned')]);

        return response()->json([
            'message' => $request->boolean('pinned') ? 'Announcement pinned.' : 'Announcement unpinned.',
            'data' => $announcement,
        ]);
    }

    public function activeBanners(Request $request, Workspace $workspace)
    {
        $user = $request->user();

        $banners = WorkspaceAnnouncement::with('user')
            ->forWorkspace($workspace->id)
            ->active()
            ->where(function ($query) use ($user) {
                // Always show pinned announcements
                $query->where('pinned', true)
                    // Show non-pinned only if non-dismissible or not yet read
                    ->orWhere(function ($q) use ($user) {
                        $q->where('dismissible', false)
                            ->orWhereDoesntHave('reads', function ($r) use ($user) {
                                $r->where('user_id', $user->id)
                                    ->whereNotNull('read_at');
                            });
                    });
            })
            ->orderByDesc('pinned')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        return response()->json([
            'data' => $banners,
        ]);
    }
}
