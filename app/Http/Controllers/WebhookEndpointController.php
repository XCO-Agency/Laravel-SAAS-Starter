<?php

namespace App\Http\Controllers;

use App\Models\WebhookEndpoint;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\WebhookServer\WebhookCall;

class WebhookEndpointController extends Controller
{
    /**
     * Display a listing of the webhooks.
     */
    public function index(Request $request, Workspace $workspace): Response
    {
        Gate::authorize('viewAny', [WebhookEndpoint::class, $workspace]);

        $endpoints = $workspace->webhookEndpoints()->latest()->get();

        return Inertia::render('workspaces/webhooks/index', [
            'workspace' => $workspace,
            'endpoints' => $endpoints,
        ]);
    }

    /**
     * Store a newly created webhook.
     */
    public function store(Request $request, Workspace $workspace): RedirectResponse
    {
        Gate::authorize('create', [WebhookEndpoint::class, $workspace]);

        $validated = $request->validate([
            'url' => ['required', 'url', 'max:255'],
            'events' => ['nullable', 'array'],
            'events.*' => ['string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $workspace->webhookEndpoints()->create([
            'url' => $validated['url'],
            'events' => $validated['events'] ?? [],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Webhook endpoint created perfectly!');
    }

    /**
     * Update the specified webhook.
     */
    public function update(Request $request, Workspace $workspace, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        Gate::authorize('update', $webhookEndpoint);

        $validated = $request->validate([
            'url' => ['required', 'url', 'max:255'],
            'events' => ['nullable', 'array'],
            'events.*' => ['string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $webhookEndpoint->update([
            'url' => $validated['url'],
            'events' => $validated['events'] ?? [],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Webhook endpoint updated successfully.');
    }

    /**
     * Remove the specified webhook.
     */
    public function destroy(Workspace $workspace, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        Gate::authorize('delete', $webhookEndpoint);

        $webhookEndpoint->delete();

        return back()->with('success', 'Webhook endpoint deleted successfully.');
    }

    /**
     * Dispatch a test string event via the spatie/laravel-webhook-server.
     */
    public function ping(Workspace $workspace, WebhookEndpoint $webhookEndpoint): RedirectResponse
    {
        Gate::authorize('update', $webhookEndpoint);

        WebhookCall::create()
            ->url($webhookEndpoint->url)
            ->payload(['event' => 'ping', 'message' => 'This is a test webhook from Laravel SAAS Starter.'])
            ->useSecret($webhookEndpoint->secret)
            ->dispatch();

        return back()->with('success', 'Ping payload safely dispatched.');
    }
}
