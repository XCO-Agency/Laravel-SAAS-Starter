<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    /**
     * Display a paginated, filterable audit log.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $logName = $request->input('log_name', '');
        $event = $request->input('event', '');

        $activities = Activity::query()
            ->with('causer:id,name,email')
            ->when($search, fn ($query) => $query
                ->where('description', 'like', "%{$search}%")
                ->orWhere('subject_type', 'like', "%{$search}%")
            )
            ->when($logName, fn ($query) => $query->where('log_name', $logName))
            ->when($event, fn ($query) => $query->where('event', $event))
            ->latest()
            ->paginate(20)
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                'subject_id' => $activity->subject_id,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'properties' => $activity->properties->count() > 0 ? $activity->properties->toArray() : null,
                'created_at' => $activity->created_at?->toISOString(),
            ])
            ->withQueryString();

        // Get distinct log names and events for filter dropdowns
        $logNames = Activity::query()->select('log_name')->distinct()->pluck('log_name')->filter()->values();
        $events = Activity::query()->select('event')->distinct()->pluck('event')->filter()->values();

        return Inertia::render('admin/audit-logs', [
            'activities' => $activities,
            'filters' => [
                'search' => $search,
                'log_name' => $logName,
                'event' => $event,
            ],
            'logNames' => $logNames,
            'events' => $events,
        ]);
    }

    /**
     * Export audit logs as a CSV file with the current filters applied.
     */
    public function export(Request $request): StreamedResponse
    {
        $search = $request->input('search', '');
        $logName = $request->input('log_name', '');
        $event = $request->input('event', '');

        $query = Activity::query()
            ->with('causer:id,name,email')
            ->when($search, fn ($q) => $q
                ->where('description', 'like', "%{$search}%")
                ->orWhere('subject_type', 'like', "%{$search}%")
            )
            ->when($logName, fn ($q) => $q->where('log_name', $logName))
            ->when($event, fn ($q) => $q->where('event', $event))
            ->latest();

        $filename = 'audit-logs-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['ID', 'Log Name', 'Description', 'Event', 'Subject Type', 'Subject ID', 'Causer', 'Created At']);

            $query->chunk(500, function ($activities) use ($handle) {
                foreach ($activities as $activity) {
                    fputcsv($handle, [
                        $activity->id,
                        $activity->log_name ?? '',
                        $activity->description ?? '',
                        $activity->event ?? '',
                        $activity->subject_type ? class_basename($activity->subject_type) : '',
                        $activity->subject_id ?? '',
                        $activity->causer?->name ?? '',
                        $activity->created_at?->toISOString() ?? '',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
