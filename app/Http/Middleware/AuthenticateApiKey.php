<?php

namespace App\Http\Middleware;

use App\Models\WorkspaceApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request authenticated via workspace API key.
     */
    public function handle(Request $request, Closure $next, ?string $scope = null): Response
    {
        $bearer = $request->bearerToken();

        if (! $bearer || ! str_starts_with($bearer, 'wsk_')) {
            return response()->json(['message' => 'Missing or invalid API key.'], 401);
        }

        $hash = hash('sha256', $bearer);

        $apiKey = WorkspaceApiKey::where('key_hash', $hash)->first();

        if (! $apiKey) {
            return response()->json(['message' => 'Invalid API key.'], 401);
        }

        if ($apiKey->isExpired()) {
            return response()->json(['message' => 'API key has expired.'], 401);
        }

        if ($scope && ! $apiKey->hasScope($scope)) {
            return response()->json(['message' => 'Insufficient scope.'], 403);
        }

        // Record usage timestamp
        $apiKey->recordUsage();

        // Bind context for downstream controllers
        $request->attributes->set('workspace', $apiKey->workspace);
        $request->attributes->set('api_key', $apiKey);

        return $next($request);
    }
}
