<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkspaceRequest;
use App\Models\User;
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
                'logo_url' => $workspace->logo_url,
                'accent_color' => $workspace->accent_color,
                'personal_workspace' => $workspace->personal_workspace,
                'owner_id' => $workspace->owner_id,
                'plan' => $workspace->plan_name,
                'created_at' => $workspace->created_at,
                'billing_email' => $workspace->billing_email,
            ],
            'userRole' => $workspace->getUserRole($user),
            'stats' => [
                'members_count' => $workspace->users()->count(),
                'api_keys_count' => $workspace->apiKeys()->count(),
            ],
            'onboardingProgress' => $this->computeOnboardingProgress($workspace, $user),
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
     * Show the Danger Zone settings page.
     */
    public function dangerZone(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        $admins = $workspace->users()
            ->wherePivot('role', 'admin')
            ->get(['users.id', 'users.name', 'users.email'])
            ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]);

        return Inertia::render('settings/workspace-danger-zone', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'personal_workspace' => $workspace->personal_workspace,
                'owner_id' => $workspace->owner_id,
            ],
            'userRole' => $workspace->getUserRole($user),
            'admins' => $admins,
        ]);
    }

    /**
     * Leave the current workspace (non-owners only).
     */
    public function leave(Request $request): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        if ($workspace->personal_workspace) {
            return redirect()->back()
                ->with('error', 'You cannot leave your personal workspace.');
        }

        if ($workspace->owner_id === $user->id) {
            return redirect()->back()
                ->with('error', 'Workspace owners cannot leave. Transfer ownership first or delete the workspace.');
        }

        $workspace->removeUser($user);

        $personalWorkspace = $user->personalWorkspace();
        if ($personalWorkspace) {
            $user->switchWorkspace($personalWorkspace);
        }

        return redirect()->route('dashboard')
            ->with('success', 'You have left the workspace.');
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

    /**
     * Compute workspace onboarding completion progress.
     *
     * @return array{score: int, steps: array<array{key: string, label: string, completed: bool}>}
     */
    private function computeOnboardingProgress(Workspace $workspace, User $user): array
    {
        $steps = [
            [
                'key' => 'has_logo',
                'label' => 'Upload a workspace logo',
                'completed' => $workspace->logo !== null,
            ],
            [
                'key' => 'has_members',
                'label' => 'Invite a team member',
                'completed' => $workspace->users()->count() > 1,
            ],
            [
                'key' => 'has_webhook',
                'label' => 'Configure a webhook',
                'completed' => $workspace->webhookEndpoints()->exists(),
            ],
            [
                'key' => 'has_api_key',
                'label' => 'Create an API key',
                'completed' => $workspace->apiKeys()->exists(),
            ],
            [
                'key' => 'owner_has_2fa',
                'label' => 'Enable two-factor authentication',
                'completed' => $user->two_factor_secret !== null,
            ],
        ];

        $completed = collect($steps)->filter(fn ($s) => $s['completed'])->count();
        $score = (int) round(($completed / count($steps)) * 100);

        return [
            'score' => $score,
            'steps' => $steps,
        ];
    }
}
