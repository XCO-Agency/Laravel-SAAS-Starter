<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserApiTokenController extends Controller
{
    /**
     * Display API tokens for a specific user.
     */
    public function index(User $user): Response
    {
        return Inertia::render('admin/user-api-tokens', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'tokens' => $user->tokens
                ->map(fn ($token) => [
                    'id' => (string) $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at,
                    'created_at' => $token->created_at,
                ])
                ->values(),
        ]);
    }

    /**
     * Create a new API token for a specific user.
     */
    public function store(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $token = $user->createToken($validated['name']);

        return back()->with('token', $token->plainTextToken);
    }

    /**
     * Revoke an API token for a specific user.
     */
    public function destroy(User $user, string $tokenId): RedirectResponse
    {
        $user->tokens()->where('id', $tokenId)->delete();

        return back()->with('success', 'API token revoked successfully.');
    }
}
