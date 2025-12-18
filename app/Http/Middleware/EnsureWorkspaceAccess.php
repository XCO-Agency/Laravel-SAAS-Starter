<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $workspace = $user->currentWorkspace;

        // If no current workspace, try to set the personal workspace
        if (! $workspace) {
            $workspace = $user->personalWorkspace();

            if ($workspace) {
                $user->switchWorkspace($workspace);
            } else {
                // User has no workspaces - this shouldn't happen normally
                abort(403, 'No workspace available.');
            }
        }

        // Ensure user belongs to the current workspace
        if (! $workspace->hasUser($user)) {
            // Try to find another workspace the user belongs to
            $anotherWorkspace = $user->workspaces()->first();

            if ($anotherWorkspace) {
                $user->switchWorkspace($anotherWorkspace);
            } else {
                abort(403, 'You do not have access to any workspace.');
            }
        }

        // Share current workspace with views/Inertia
        $request->attributes->set('workspace', $user->currentWorkspace);

        return $next($request);
    }
}





