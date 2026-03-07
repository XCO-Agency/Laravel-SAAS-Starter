<?php

namespace App\Http\Middleware;

use App\Models\ApiRequestLog;
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

        $startTime = microtime(true);

        $response = $next($request);

        // Log API request
        $responseTime = (int) round((microtime(true) - $startTime) * 1000);

        ApiRequestLog::create([
            'workspace_id' => $apiKey->workspace_id,
            'api_key_id' => $apiKey->id,
            'method' => $request->method(),
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'response_time_ms' => $responseTime,
            'was_throttled' => $response->getStatusCode() === 429,
            'ip_address' => $request->ip(),
            'requested_at' => now(),
        ]);

        return $response;
    }
}
