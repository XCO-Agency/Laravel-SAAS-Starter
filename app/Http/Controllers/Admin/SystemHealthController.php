<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    /**
     * Display the system health dashboard.
     */
    public function index(Request $request): Response
    {
        $failedJobs = DB::table('failed_jobs')
            ->orderByDesc('failed_at')
            ->limit(50)
            ->get(['id', 'uuid', 'connection', 'queue', 'payload', 'exception', 'failed_at'])
            ->map(function ($job) {
                $payload = json_decode($job->payload, true);

                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'job_name' => class_basename($payload['displayName'] ?? 'Unknown'),
                    'exception_summary' => str($job->exception)->limit(200)->toString(),
                    'failed_at' => $job->failed_at,
                ];
            });

        $pendingJobsCount = DB::table('jobs')->count();
        $failedJobsCount = DB::table('failed_jobs')->count();

        $dbSizeBytes = $this->getDatabaseSize();
        $storageUsage = $this->getStorageUsage();

        return Inertia::render('admin/system-health', [
            'failedJobs' => $failedJobs,
            'stats' => [
                'pending_jobs' => $pendingJobsCount,
                'failed_jobs' => $failedJobsCount,
                'db_size' => $this->formatBytes($dbSizeBytes),
                'db_size_bytes' => $dbSizeBytes,
                'cache_driver' => config('cache.default'),
                'queue_driver' => config('queue.default'),
                'session_driver' => config('session.driver'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'storage' => $storageUsage,
            ],
        ]);
    }

    /**
     * Retry a specific failed job.
     */
    public function retryJob(Request $request, int $id): JsonResponse
    {
        $job = DB::table('failed_jobs')->where('id', $id)->first();

        if (! $job) {
            return response()->json(['success' => false, 'message' => 'Job not found.'], 404);
        }

        Artisan::call('queue:retry', ['id' => [$job->uuid]]);

        return response()->json(['success' => true, 'message' => 'Job queued for retry.']);
    }

    /**
     * Delete a specific failed job.
     */
    public function deleteJob(Request $request, int $id): JsonResponse
    {
        $deleted = DB::table('failed_jobs')->where('id', $id)->delete();

        if (! $deleted) {
            return response()->json(['success' => false, 'message' => 'Job not found.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Failed job deleted.']);
    }

    /**
     * Flush all failed jobs.
     */
    public function flushJobs(Request $request): JsonResponse
    {
        Artisan::call('queue:flush');

        return response()->json(['success' => true, 'message' => 'All failed jobs flushed.']);
    }

    /**
     * Get the database file size for SQLite.
     */
    protected function getDatabaseSize(): int
    {
        $dbPath = config('database.connections.sqlite.database');

        if ($dbPath && file_exists($dbPath)) {
            return (int) filesize($dbPath);
        }

        return 0;
    }

    /**
     * Get storage usage stats.
     *
     * @return array{app: string, logs: string, framework: string}
     */
    protected function getStorageUsage(): array
    {
        return [
            'app' => $this->formatBytes($this->directorySize(storage_path('app'))),
            'logs' => $this->formatBytes($this->directorySize(storage_path('logs'))),
            'framework' => $this->formatBytes($this->directorySize(storage_path('framework'))),
        ];
    }

    /**
     * Calculate the total size of a directory in bytes.
     */
    protected function directorySize(string $path): int
    {
        if (! is_dir($path)) {
            return 0;
        }

        $size = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }

        return $size;
    }

    /**
     * Format bytes into human-readable string.
     */
    protected function formatBytes(int $bytes): string
    {
        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = (int) floor(log($bytes, 1024));

        return round($bytes / pow(1024, $i), 2).' '.$units[$i];
    }
}
