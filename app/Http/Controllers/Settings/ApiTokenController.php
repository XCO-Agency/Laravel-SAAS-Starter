<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ApiTokenController extends Controller
{
    /**
     * Show the API tokens index screen.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('settings/api-tokens', [
            'tokens' => $request->user()->tokens,
        ]);
    }

    /**
     * Create a new API token.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $token = $request->user()->createToken($request->name);

        return back()->with('token', $token->plainTextToken);
    }

    /**
     * Delete the given API token.
     */
    public function destroy(Request $request, string $tokenId): RedirectResponse
    {
        // Determine if token belongs to the user, then delete
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return back();
    }
}
