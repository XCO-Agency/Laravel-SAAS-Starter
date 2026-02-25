<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkspaceRequest;
use App\Models\Workspace;
use App\Services\WorkspaceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function __construct(
        protected WorkspaceService $workspaceService
    ) {}

    /**
     * Display a listing of workspaces.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('workspaces/index', [
            'workspaces' => $user->workspaces()
                ->with('owner:id,name')
                ->withCount('users')
                ->get()
                ->map(fn ($workspace) => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'logo' => $workspace->logo,
                    'personal_workspace' => $workspace->personal_workspace,
                    'owner' => $workspace->owner,
                    'members_count' => $workspace->users_count,
                    'role' => $workspace->pivot->role,
                    'plan' => $workspace->plan_name,
                    'is_current' => $workspace->id === $user->current_workspace_id,
                ]),
            'canCreateWorkspace' => $this->workspaceService->canCreateWorkspace($user),
            'workspaceLimitMessage' => $this->workspaceService->getWorkspaceLimitMessage($user),
        ]);
    }

    /**
     * Show the form for creating a new workspace.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $this->workspaceService->canCreateWorkspace($user)) {
            return redirect()->route('workspaces.index')
                ->with('error', 'You have reached your workspace limit. Please upgrade your plan to create more workspaces.');
        }

        return Inertia::render('workspaces/create');
    }

    /**
     * Store a newly created workspace.
     */
    public function store(WorkspaceRequest $request): RedirectResponse
    {
        $user = $request->user();

        if (! $this->workspaceService->canCreateWorkspace($user)) {
            return redirect()->route('workspaces.index')
                ->with('error', 'You have reached your workspace limit. Please upgrade your plan to create more workspaces.');
        }

        $data = $request->validated();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('workspace-logos', 'public');
        }

        $workspace = $this->workspaceService->create($user, $data);

        // Switch to the new workspace
        $user->switchWorkspace($workspace);

        return redirect()->route('dashboard')
            ->with('success', 'Workspace created successfully.');
    }

    /**
     * Display workspace settings.
     */
    public function settings(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        return Inertia::render('workspaces/settings', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'logo' => $workspace->logo,
                'logo_url' => $workspace->logo ? Storage::url($workspace->logo) : null,
                'personal_workspace' => $workspace->personal_workspace,
                'owner_id' => $workspace->owner_id,
                'plan' => $workspace->plan_name,
            ],
            'userRole' => $workspace->getUserRole($user),
        ]);
    }

    /**
     * Update workspace settings.
     */
    public function update(WorkspaceRequest $request): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        // Only admins and owners can update
        if (! $workspace->userIsAdmin($user)) {
            abort(403, 'You do not have permission to update this workspace.');
        }

        $data = $request->validated();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($workspace->logo) {
                Storage::disk('public')->delete($workspace->logo);
            }
            $data['logo'] = $request->file('logo')->store('workspace-logos', 'public');
        }

        // Handle logo removal
        if ($request->boolean('remove_logo') && $workspace->logo) {
            Storage::disk('public')->delete($workspace->logo);
            $data['logo'] = null;
        }

        $this->workspaceService->update($workspace, $data);

        return redirect()->back()
            ->with('success', 'Workspace updated successfully.');
    }

    /**
     * Delete the workspace.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        Gate::authorize('delete', $workspace);

        if ($workspace->personal_workspace) {
            return redirect()->back()
                ->with('error', 'You cannot delete your personal workspace.');
        }

        // Delete logo if exists
        if ($workspace->logo) {
            Storage::disk('public')->delete($workspace->logo);
        }

        $this->workspaceService->delete($workspace);

        return redirect()->route('dashboard')
            ->with('success', 'Workspace deleted successfully.');
    }

    /**
     * Switch to another workspace.
     */
    public function switch(Request $request, Workspace $workspace): RedirectResponse
    {
        $user = $request->user();

        if (! $workspace->hasUser($user)) {
            abort(403, 'You do not have access to this workspace.');
        }

        $user->switchWorkspace($workspace);

        return redirect()->route('dashboard')
            ->with('success', "Switched to {$workspace->name}.");
    }
}
