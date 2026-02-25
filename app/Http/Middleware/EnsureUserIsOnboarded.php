<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsOnboarded
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // If user is authenticated but hasn't completed onboarding...
        if ($user && is_null($user->onboarded_at)) {
            // ...redirect them safely to the onboarding wizard.
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
