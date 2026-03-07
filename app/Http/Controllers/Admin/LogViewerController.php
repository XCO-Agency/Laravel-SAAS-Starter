<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class LogViewerController extends Controller
{
    /**
     * Display a list of all log files.
     */
    public function index(): Response
    {
        $files = collect(File::files(storage_path('logs')))
            ->filter(fn($file) => $file->getExtension() === 'log')
            ->map(function ($file) {
                return [
                    'name' => $file->getFilename(),
                    'size' => $this->formatSize($file->getSize()),
                    'last_modified' => date('Y-m-d H:i:s', $file->getMTime()),
                ];
            })
            ->sortByDesc('last_modified')
            ->values();

        return Inertia::render('admin/logs', [
            'files' => $files,
            'currentFile' => null,
            'logs' => [],
        ]);
    }

    /**
     * Display the contents of a specific log file.
     */
    public function show(string $file): Response
    {
        // Prevent directory traversal attacks
        if (str_contains($file, '..') || str_contains($file, '/')) {
            abort(403);
        }

        $path = storage_path('logs/' . $file);

        if (!File::exists($path)) {
            abort(404, 'Log file not found.');
        }

        // Parse log entries
        $logs = $this->parseLogFile($path);

        // Get list of all log files to render the sidebar
        $files = collect(File::files(storage_path('logs')))
            ->filter(fn($f) => $f->getExtension() === 'log')
            ->map(function ($f) {
                return [
                    'name' => $f->getFilename(),
                    'size' => $this->formatSize($f->getSize()),
                    'last_modified' => date('Y-m-d H:i:s', $f->getMTime()),
                ];
            })
            ->sortByDesc('last_modified')
            ->values();

        return Inertia::render('admin/logs', [
            'files' => $files,
            'currentFile' => [
                'name' => $file,
                'size' => $this->formatSize(File::size($path)),
                'last_modified' => date('Y-m-d H:i:s', File::lastModified($path)),
            ],
            'logs' => $logs,
        ]);
    }

    /**
     * Delete a specific log file.
     */
    public function destroy(string $file)
    {
        if (str_contains($file, '..') || str_contains($file, '/')) {
            abort(403);
        }

        $path = storage_path('logs/' . $file);

        if (File::exists($path)) {
            File::delete($path);
        }

        return redirect()->route('admin.logs.index')->with('success', 'Log file deleted successfully.');
    }

    /**
     * Download a specific log file.
     */
    public function download(string $file): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        if (str_contains($file, '..') || str_contains($file, '/')) {
            abort(403);
        }

        $path = storage_path('logs/' . $file);

        if (!File::exists($path)) {
            abort(404, 'Log file not found.');
        }

        return response()->download($path);
    }

    /**
     * Format bytes to a human readable size.
     */
    protected function formatSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Parse the log file into an array of entries.
     */
    protected function parseLogFile(string $path): array
    {
        // Read file contents
        $content = File::get($path);

        // Match Laravel standard log format: [2023-01-01 12:00:00] environment.LEVEL: Message
        // We use lookahead to capture everything until the next log entry or end of string
        $pattern = '/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:[\+\-]\d{2}:\d{2})?)\] (.*?)\.(DEBUG|INFO|NOTICE|WARNING|ERROR|CRITICAL|ALERT|EMERGENCY): (.*?)(?=\n\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}|\z)/s';

        preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

        $logs = [];
        $id = 0;

        foreach ($matches as $match) {
            $logs[] = [
                'id' => ++$id,
                'timestamp' => $match[1],
                'environment' => $match[2],
                'level' => $match[3],
                'message' => trim($match[4]),
            ];
        }

        // Return latest logs first
        return array_reverse($logs);
    }
}
