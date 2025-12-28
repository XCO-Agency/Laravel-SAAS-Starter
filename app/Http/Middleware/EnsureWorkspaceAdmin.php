<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceAdmin
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user is an admin (or owner) of the current workspace.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $workspace = $user?->currentWorkspace;

        if (! $user || ! $workspace) {
            abort(403, 'Unauthorized action.');
        }

        if (! $workspace->userIsAdmin($user)) {
            abort(403, 'Only workspace administrators can perform this action.');
        }

        return $next($request);
    }
}
