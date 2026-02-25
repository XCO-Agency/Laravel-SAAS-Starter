<?php

namespace App\Http\Controllers;

use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

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
}
