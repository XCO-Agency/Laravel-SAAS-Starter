<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordNotExpired
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If the user is unauthenticated, let auth middleware handle it
        if (! $user) {
            return $next($request);
        }

        // Define expiry period (e.g., 90 days). Here we could check a setting or config.
        $expiryDays = config('auth.password_expiry_days', 90);

        // If expiry is disabled (0 or null), proceed
        if (! $expiryDays) {
            return $next($request);
        }

        // Calculate when the password was last updated (default to created_at if null)
        $lastUpdated = $user->password_updated_at ?? $user->created_at;

        if ($lastUpdated && $lastUpdated->diffInDays(now()) > $expiryDays) {
            // Check if they are already on the password reset/confirm routes to prevent redirect loop
            if ($request->routeIs('password.*')) {
                return $next($request);
            }

            // You can either log them out and redirect to forgot password, or redirect to a custom 'update password' view.
            // Using Fortify's `password.confirm` flow or a custom notification flow is ideal.
            // For now, let's redirect to standard profile page with an error flashed (assuming profile has a password update block).
            return redirect()->route('profile.edit')->with('error', 'Your password has expired. Please update it immediately.');
        }

        return $next($request);
    }
}
