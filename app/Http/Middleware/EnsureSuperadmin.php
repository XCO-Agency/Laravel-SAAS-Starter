<?php

namespace App\Http\Middleware;

use Closure;
use Laravel\Ai\Prompts\AgentPrompt;
use Laravel\Ai\Responses\AgentResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
// use Laravel\Ai\Prompts\AgentPrompt; // No longer needed for handle method
// use Laravel\Ai\Responses\AgentResponse; // No longer needed for handle method

class EnsureSuperadmin
{
    /**
     * Handle the incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->is_superadmin) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
