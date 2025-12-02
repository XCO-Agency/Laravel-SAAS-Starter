<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceOwner
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user is the owner of the current workspace.
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

        if (! $workspace->userIsOwner($user)) {
            abort(403, 'Only the workspace owner can perform this action.');
        }

        return $next($request);
    }
}
