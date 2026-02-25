<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class RetentionController extends Controller
{
    /**
     * Display the data retention settings page.
     */
    public function index(Request $request): Response
    {
        $policies = [];

        foreach (config('retention') as $key => $cfg) {
            $policies[] = [
                'key' => $key,
                'label' => $this->labelFor($key),
                'enabled' => $cfg['enabled'],
                'days' => $cfg['days'],
                'notes' => $this->notesFor($key, $cfg),
            ];
        }

        return Inertia::render('admin/retention', [
            'policies' => $policies,
        ]);
    }

    /**
     * Run the pruning command and return a JSON summary.
     */
    public function prune(Request $request): JsonResponse
    {
        $dryRun = $request->boolean('dry_run');

        Artisan::call('app:prune-old-records', $dryRun ? ['--dry-run' => true] : []);

        $output = Artisan::output();

        return response()->json([
            'success' => true,
            'output' => $output,
            'dry_run' => $dryRun,
        ]);
    }

    /**
     * Human-readable label for a policy key.
     */
    protected function labelFor(string $key): string
    {
        return match ($key) {
            'notifications' => 'In-App Notifications',
            'activity_log' => 'Activity Log',
            'webhook_logs' => 'Webhook Delivery Logs',
            'feedback' => 'User Feedback',
            default => ucwords(str_replace('_', ' ', $key)),
        };
    }

    /**
     * Build a human-readable notes string for a policy.
     *
     * @param  array<string, mixed>  $cfg
     */
    protected function notesFor(string $key, array $cfg): string
    {
        return match ($key) {
            'notifications' => ($cfg['read_only'] ?? false)
                ? 'Only read notifications are pruned.'
                : 'All notifications older than the threshold are pruned.',
            'feedback' => ($cfg['archived_only'] ?? false)
                ? 'Only archived feedback entries are pruned.'
                : 'All feedback older than the threshold is pruned.',
            default => '',
        };
    }
}
