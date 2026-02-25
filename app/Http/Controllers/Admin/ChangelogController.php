<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChangelogEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangelogController extends Controller
{
    /**
     * Display the changelog management page.
     */
    public function index(): Response
    {
        $entries = ChangelogEntry::query()
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('admin/changelog', [
            'entries' => $entries,
        ]);
    }

    /**
     * Store a new changelog entry.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'max:20'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['required', 'string', 'in:feature,improvement,fix'],
            'is_published' => ['boolean'],
        ]);

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        ChangelogEntry::create($validated);

        return redirect()->back()->with('success', 'Changelog entry created.');
    }

    /**
     * Update an existing changelog entry.
     */
    public function update(Request $request, ChangelogEntry $changelogEntry): RedirectResponse
    {
        $validated = $request->validate([
            'version' => ['required', 'string', 'max:20'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'type' => ['required', 'string', 'in:feature,improvement,fix'],
            'is_published' => ['boolean'],
        ]);

        $wasPublished = $changelogEntry->is_published;
        $nowPublished = $validated['is_published'] ?? false;

        if (! $wasPublished && $nowPublished) {
            $validated['published_at'] = now();
        } elseif (! $nowPublished) {
            $validated['published_at'] = null;
        }

        $changelogEntry->update($validated);

        return redirect()->back()->with('success', 'Changelog entry updated.');
    }

    /**
     * Delete a changelog entry.
     */
    public function destroy(ChangelogEntry $changelogEntry): RedirectResponse
    {
        $changelogEntry->delete();

        return redirect()->back()->with('success', 'Changelog entry deleted.');
    }
}
