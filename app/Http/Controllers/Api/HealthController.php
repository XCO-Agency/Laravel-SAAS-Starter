<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthController extends Controller
{
    /**
     * @group Health
     *
     * Unauthenticated liveness and dependency health probe.
     */
    /**
     * Health check.
     *
     * Returns a JSON liveness signal for uptime monitors. `status` reports
     * endpoint liveness, `database` reflects a real DB-connectivity probe, and
     * `timestamp` is the current time in ISO-8601. Always responds 200, even
     * when the database is unreachable, so monitors get a structured signal.
     *
     * @unauthenticated
     *
     * @response {
     *  "status": "ok",
     *  "database": true,
     *  "timestamp": "2024-01-01T00:00:00.000000Z"
     * }
     */
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $database = true;
        } catch (Throwable) {
            $database = false;
        }

        return response()->json([
            'status' => 'ok',
            'database' => $database,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
