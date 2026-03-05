<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceNotSuspended
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $workspace = $user->currentWorkspace;

        if ($workspace && $workspace->suspended_at) {
            if ($request->routeIs('workspaces.switch', 'workspace.suspended', 'workspaces.index', 'workspaces.trash*')) {
                return $next($request);
            }

            return redirect()->route('workspace.suspended');
        }

        return $next($request);
    }
}
