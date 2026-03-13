<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConnectedAccountController extends Controller
{
    /**
     * The supported OAuth providers.
     */
    private const PROVIDERS = ['github', 'google'];

    /**
     * Display the connected social accounts page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $connected = $user->connectedAccounts()
            ->get()
            ->keyBy('provider')
            ->map(fn ($account) => [
                'provider' => $account->provider,
                'name' => $account->name,
                'email' => $account->email,
                'avatar' => $account->avatar,
                'created_at' => $account->created_at?->toISOString(),
            ]);

        $providers = collect(self::PROVIDERS)->map(fn ($provider) => [
            'provider' => $provider,
            'connected' => $connected->has($provider),
            'account' => $connected->get($provider),
        ])->values();

        return Inertia::render('settings/connected-accounts', [
            'providers' => $providers,
            'hasPassword' => ! is_null($user->password),
        ]);
    }

    /**
     * Disconnect a social account from the current user.
     */
    public function destroy(Request $request, string $provider): RedirectResponse
    {
        if (! in_array($provider, self::PROVIDERS)) {
            return back()->with('error', 'Invalid provider.');
        }

        $user = $request->user();
        $connectedCount = $user->connectedAccounts()->count();

        // Prevent disconnect if it would leave the user with no login method
        if ($connectedCount === 1 && is_null($user->password)) {
            return back()->with('error', 'You cannot disconnect your only login method. Please set a password first.');
        }

        $deleted = $user->connectedAccounts()
            ->where('provider', $provider)
            ->delete();

        if (! $deleted) {
            return back()->with('error', 'No connected account found for this provider.');
        }

        return back()->with('success', ucfirst($provider).' account disconnected.');
    }
}
