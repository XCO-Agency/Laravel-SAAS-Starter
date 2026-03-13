<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display all announcements, optionally filtered by computed status.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $now = Carbon::now();

        $query = Announcement::latest();

        match ($status) {
            'live' => $query
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
                ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now)),
            'scheduled' => $query
                ->where('is_active', true)
                ->whereNotNull('starts_at')
                ->where('starts_at', '>', $now),
            'expired' => $query->whereNotNull('ends_at')->where('ends_at', '<', $now),
            'inactive' => $query->where('is_active', false),
            default => null,
        };

        $announcements = $query
            ->paginate(15)
            ->through(fn (Announcement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'type' => $a->type,
                'is_active' => $a->is_active,
                'is_dismissible' => $a->is_dismissible,
                'starts_at' => $a->starts_at?->toISOString(),
                'ends_at' => $a->ends_at?->toISOString(),
                'created_at' => $a->created_at?->toISOString(),
                'status' => $this->computeStatus($a, $now),
            ])
            ->withQueryString();

        return Inertia::render('admin/announcements', [
            'announcements' => $announcements,
            'filter' => $status,
        ]);
    }

    /**
     * Compute a human-readable status for an announcement.
     *
     * @return 'live'|'scheduled'|'expired'|'inactive'
     */
    private function computeStatus(Announcement $a, Carbon $now): string
    {
        if (! $a->is_active) {
            return 'inactive';
        }

        if ($a->ends_at !== null && $a->ends_at->lt($now)) {
            return 'expired';
        }

        if ($a->starts_at !== null && $a->starts_at->gt($now)) {
            return 'scheduled';
        }

        return 'live';
    }

    /**
     * Store a new announcement.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:info,warning,success,danger'],
            'link_text' => ['nullable', 'string', 'max:100'],
            'link_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
            'is_dismissible' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        Announcement::create($validated);

        return back()->with('success', 'Announcement created.');
    }

    /**
     * Update an existing announcement.
     */
    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'string', 'in:info,warning,success,danger'],
            'link_text' => ['nullable', 'string', 'max:100'],
            'link_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
            'is_dismissible' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $announcement->update($validated);

        return back()->with('success', 'Announcement updated.');
    }

    /**
     * Toggle announcement active status.
     */
    public function toggle(Announcement $announcement): RedirectResponse
    {
        $announcement->update(['is_active' => ! $announcement->is_active]);

        return back()->with('success', $announcement->is_active ? 'Announcement activated.' : 'Announcement deactivated.');
    }

    /**
     * Delete an announcement.
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return back()->with('success', 'Announcement deleted.');
    }
}
