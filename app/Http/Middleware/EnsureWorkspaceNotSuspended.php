<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
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
            // Allow switching workspaces and viewing the suspension page
            if ($request->routeIs('workspaces.switch', 'workspace.suspended', 'workspaces.index', 'workspaces.trash*')) {
                return $next($request);
            }

            return Inertia::render('workspace-suspended', [
                'workspace' => [
                    'name' => $workspace->name,
                    'suspended_at' => $workspace->suspended_at->toIso8601String(),
                    'suspension_reason' => $workspace->suspension_reason,
                ],
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
