<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceWorkspaceIpAllowlist
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->user()?->currentWorkspace;

        if ($workspace && ! empty($workspace->allowed_ips)) {
            if (! in_array($request->ip(), $workspace->allowed_ips)) {
                abort(403, 'Your IP address is not permitted to access this workspace.');
            }
        }

        return $next($request);
    }
}
