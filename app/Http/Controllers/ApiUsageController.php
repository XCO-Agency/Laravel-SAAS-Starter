<?php

namespace App\Http\Controllers;

use App\Models\ApiRequestLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ApiUsageController extends Controller
{
    /**
     * Display the API usage dashboard for the current workspace.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        Gate::authorize('update', $workspace);

        $period = $request->input('period', '30');
        $periodDays = in_array($period, ['7', '14', '30', '90']) ? (int) $period : 30;
        $since = Carbon::now()->subDays($periodDays);

        $baseQuery = ApiRequestLog::where('workspace_id', $workspace->id)
            ->where('requested_at', '>=', $since);

        // --- Overview Stats ---
        $totalRequests = (clone $baseQuery)->count();
        $throttledRequests = (clone $baseQuery)->where('was_throttled', true)->count();
        $avgResponseTime = (clone $baseQuery)->whereNotNull('response_time_ms')->avg('response_time_ms');
        $errorRequests = (clone $baseQuery)->where('status_code', '>=', 400)->count();

        $overview = [
            'totalRequests' => $totalRequests,
            'throttledRequests' => $throttledRequests,
            'avgResponseTime' => $avgResponseTime ? round($avgResponseTime, 1) : 0,
            'errorRate' => $totalRequests > 0 ? round(($errorRequests / $totalRequests) * 100, 1) : 0,
        ];

        // --- Daily Request Volume ---
        $dailyVolume = ApiRequestLog::where('workspace_id', $workspace->id)
            ->where('requested_at', '>=', $since)
            ->select(
                DB::raw('DATE(requested_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN was_throttled = 1 THEN 1 ELSE 0 END) as throttled'),
                DB::raw('SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors'),
            )
            ->groupBy(DB::raw('DATE(requested_at)'))
            ->orderBy('date')
            ->get();

        // --- Per-Key Usage ---
        $perKeyUsage = ApiRequestLog::where('api_request_logs.workspace_id', $workspace->id)
            ->where('requested_at', '>=', $since)
            ->join('workspace_api_keys', 'api_request_logs.api_key_id', '=', 'workspace_api_keys.id')
            ->select(
                'workspace_api_keys.id',
                'workspace_api_keys.name',
                'workspace_api_keys.key_prefix',
                DB::raw('COUNT(*) as total_requests'),
                DB::raw('SUM(CASE WHEN was_throttled = 1 THEN 1 ELSE 0 END) as throttled_count'),
                DB::raw('AVG(response_time_ms) as avg_response_time'),
                DB::raw('MAX(requested_at) as last_request_at'),
            )
            ->groupBy('workspace_api_keys.id', 'workspace_api_keys.name', 'workspace_api_keys.key_prefix')
            ->orderByDesc('total_requests')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'key_prefix' => $row->key_prefix,
                'total_requests' => $row->total_requests,
                'throttled_count' => (int) $row->throttled_count,
                'avg_response_time' => $row->avg_response_time ? round($row->avg_response_time, 1) : 0,
                'last_request_at' => $row->last_request_at,
            ]);

        // --- Status Code Distribution ---
        $statusDistribution = ApiRequestLog::where('workspace_id', $workspace->id)
            ->where('requested_at', '>=', $since)
            ->select(
                DB::raw('CASE
                    WHEN status_code >= 200 AND status_code < 300 THEN "2xx"
                    WHEN status_code >= 300 AND status_code < 400 THEN "3xx"
                    WHEN status_code >= 400 AND status_code < 500 THEN "4xx"
                    WHEN status_code >= 500 THEN "5xx"
                    ELSE "other"
                END as status_group'),
                DB::raw('COUNT(*) as count'),
            )
            ->groupBy('status_group')
            ->pluck('count', 'status_group');

        // --- Top Endpoints ---
        $topEndpoints = ApiRequestLog::where('workspace_id', $workspace->id)
            ->where('requested_at', '>=', $since)
            ->select(
                'method',
                'path',
                DB::raw('COUNT(*) as total'),
                DB::raw('AVG(response_time_ms) as avg_response_time'),
                DB::raw('SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count'),
            )
            ->groupBy('method', 'path')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'method' => $row->method,
                'path' => $row->path,
                'total' => $row->total,
                'avg_response_time' => $row->avg_response_time ? round($row->avg_response_time, 1) : 0,
                'error_count' => (int) $row->error_count,
            ]);

        return Inertia::render('workspaces/api-usage', [
            'overview' => $overview,
            'dailyVolume' => $dailyVolume,
            'perKeyUsage' => $perKeyUsage,
            'statusDistribution' => $statusDistribution,
            'topEndpoints' => $topEndpoints,
            'period' => (string) $periodDays,
        ]);
    }
}
