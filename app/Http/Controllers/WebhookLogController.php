<?php

namespace App\Http\Controllers;

use App\Models\WebhookEndpoint;
use App\Models\WebhookLog;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\WebhookServer\WebhookCall;

class WebhookLogController extends Controller
{
    /**
     * Display a listing of the webhook logs for the workspace.
     */
    public function index(Request $request, Workspace $workspace): Response
    {
        Gate::authorize('viewAny', [WebhookEndpoint::class, $workspace]);

        $logs = $workspace->webhookLogs()
            ->with('webhookEndpoint:id,url')
            ->latest()
            ->paginate(20);

        return Inertia::render('workspaces/webhooks/logs', [
            'workspace' => $workspace,
            'logs' => $logs,
        ]);
    }

    /**
     * Retry (redeliver) a specific webhook log entry.
     */
    public function retry(Request $request, Workspace $workspace, WebhookLog $webhookLog): RedirectResponse
    {
        Gate::authorize('viewAny', [WebhookEndpoint::class, $workspace]);

        $endpoint = $webhookLog->webhookEndpoint;

        if (! $endpoint || ! $endpoint->is_active) {
            return redirect()->back()->with('error', 'Cannot retry: the webhook endpoint is inactive or has been deleted.');
        }

        WebhookCall::create()
            ->url($webhookLog->url)
            ->payload($webhookLog->payload ?? [])
            ->useSecret($endpoint->secret)
            ->meta([
                'workspace_id' => $workspace->id,
                'webhook_endpoint_id' => $endpoint->id,
                'event_type' => $webhookLog->event_type,
            ])
            ->dispatch();

        return redirect()->back()->with('success', 'Webhook delivery queued for retry.');
    }
}
