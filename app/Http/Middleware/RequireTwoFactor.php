<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireTwoFactor
{
    /**
     * Redirect members who lack 2FA when their workspace requires it.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $workspace = $user->currentWorkspace;

        if (! $workspace || ! $workspace->require_two_factor) {
            return $next($request);
        }

        // Workspace owners are always exempt — they must be able to reach
        // settings to disable the policy even if they haven't set up 2FA.
        if ($workspace->owner_id === $user->id) {
            return $next($request);
        }

        // Allow access to 2FA setup and enforcement notice routes
        if ($request->routeIs('two-factor.*', 'workspace.2fa-required', 'logout')) {
            return $next($request);
        }

        // Allow Fortify's own 2FA routes
        if ($request->is('user/two-factor-*', 'two-factor-challenge')) {
            return $next($request);
        }

        if (! $user->hasEnabledTwoFactorAuthentication()) {
            return redirect()->route('workspace.2fa-required');
        }

        return $next($request);
    }
}
