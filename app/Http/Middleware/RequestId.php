<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestId
{
    /**
     * Assign a correlation id to the request and echo it on the response.
     *
     * Honors an inbound X-Request-Id header when present, otherwise generates
     * a fresh UUID. The id is pushed into the logging context so every log
     * line emitted during the request carries a request_id.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $inbound = trim((string) $request->headers->get('X-Request-Id'));
        $id = $inbound !== '' ? Str::limit($inbound, 128, '') : Str::uuid()->toString();

        Log::withContext(['request_id' => $id]);

        $request->headers->set('X-Request-Id', $id);

        $response = $next($request);

        $response->headers->set('X-Request-Id', $id);

        return $response;
    }
}
