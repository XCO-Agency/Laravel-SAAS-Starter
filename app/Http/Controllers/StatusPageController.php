<?php

namespace App\Http\Controllers;

use App\Models\StatusIncident;
use Inertia\Inertia;
use Inertia\Response;

class StatusPageController extends Controller
{
    /**
     * Display the public status page.
     */
    public function index(): Response
    {
        $incidents = StatusIncident::query()
            ->recent()
            ->orderByDesc('created_at')
            ->get();

        // Determine overall system status from the most severe unresolved incident
        $activeIncidents = $incidents->filter(fn ($i) => $i->isActive());

        $overallStatus = 'operational';

        if ($activeIncidents->contains('status', StatusIncident::STATUS_OUTAGE)) {
            $overallStatus = StatusIncident::STATUS_OUTAGE;
        } elseif ($activeIncidents->contains('status', StatusIncident::STATUS_DEGRADED)) {
            $overallStatus = StatusIncident::STATUS_DEGRADED;
        } elseif ($activeIncidents->contains('status', StatusIncident::STATUS_MAINTENANCE)) {
            $overallStatus = StatusIncident::STATUS_MAINTENANCE;
        }

        return Inertia::render('status', [
            'incidents' => $incidents,
            'overallStatus' => $overallStatus,
        ]);
    }
}
