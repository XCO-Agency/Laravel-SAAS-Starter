<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StatusIncident;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatusIncidentController extends Controller
{
    /**
     * Display the admin status incidents management page.
     */
    public function index(): Response
    {
        $incidents = StatusIncident::query()
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('admin/status/index', [
            'incidents' => $incidents,
            'statuses' => StatusIncident::STATUSES,
        ]);
    }

    /**
     * Store a new status incident.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'status' => ['required', 'string', 'in:'.implode(',', StatusIncident::STATUSES)],
        ]);

        if ($validated['status'] === StatusIncident::STATUS_OPERATIONAL) {
            $validated['resolved_at'] = now();
        }

        StatusIncident::create($validated);

        return redirect()->route('admin.status.index')->with('success', 'Status incident created.');
    }

    /**
     * Update an existing status incident.
     */
    public function update(Request $request, StatusIncident $status): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'status' => ['required', 'string', 'in:'.implode(',', StatusIncident::STATUSES)],
        ]);

        // Auto-resolve when status is set to operational
        if ($validated['status'] === StatusIncident::STATUS_OPERATIONAL && $status->resolved_at === null) {
            $validated['resolved_at'] = now();
        } elseif ($validated['status'] !== StatusIncident::STATUS_OPERATIONAL) {
            $validated['resolved_at'] = null;
        }

        $status->update($validated);

        return redirect()->route('admin.status.index')->with('success', 'Status incident updated.');
    }

    /**
     * Delete a status incident.
     */
    public function destroy(StatusIncident $status): RedirectResponse
    {
        $status->delete();

        return redirect()->route('admin.status.index')->with('success', 'Status incident deleted.');
    }
}
