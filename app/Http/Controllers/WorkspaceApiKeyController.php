<?php

namespace App\Http\Controllers;

use App\Models\WorkspaceApiKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceApiKeyController extends Controller
{
    /**
     * Display the workspace API keys management page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        $keys = $workspace->apiKeys()
            ->with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (WorkspaceApiKey $key) => [
                'id' => $key->id,
                'name' => $key->name,
                'key_prefix' => $key->key_prefix,
                'scopes' => $key->scopes ?? [],
                'last_used_at' => $key->last_used_at?->toIso8601String(),
                'expires_at' => $key->expires_at?->toIso8601String(),
                'is_expired' => $key->isExpired(),
                'created_by' => $key->creator?->name ?? 'Unknown',
                'created_at' => $key->created_at->toIso8601String(),
            ]);

        return Inertia::render('workspaces/api-keys', [
            'keys' => $keys,
            'availableScopes' => WorkspaceApiKey::AVAILABLE_SCOPES,
            'isAdmin' => $workspace->userIsAdmin($user),
        ]);
    }

    /**
     * Create a new workspace API key.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scopes' => ['present', 'array'],
            'scopes.*' => ['string', Rule::in(WorkspaceApiKey::AVAILABLE_SCOPES)],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $result = WorkspaceApiKey::generateKey(
            $workspace,
            $user,
            $validated['name'],
            $validated['scopes'],
            $validated['expires_at'] ? new \DateTimeImmutable($validated['expires_at']) : null,
        );

        return redirect()->back()->with('success', 'API key created.')->with('newKey', $result['plainTextKey']);
    }

    /**
     * Revoke (delete) a workspace API key.
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $key = $workspace->apiKeys()->findOrFail($id);
        $key->delete();

        return redirect()->back()->with('success', 'API key revoked.');
    }
}
