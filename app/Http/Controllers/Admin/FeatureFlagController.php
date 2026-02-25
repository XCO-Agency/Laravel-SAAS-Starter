<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeatureFlag;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Pennant\Feature;

class FeatureFlagController extends Controller
{
    /**
     * Display a listing of feature flags.
     */
    public function index(): Response
    {
        $flags = FeatureFlag::latest()
            ->paginate(15)
            ->through(fn (FeatureFlag $f) => [
                'id' => $f->id,
                'key' => $f->key,
                'name' => $f->name,
                'description' => $f->description,
                'is_global' => $f->is_global,
                'workspace_ids' => $f->workspace_ids ?? [],
                'created_at' => $f->created_at?->toISOString(),
            ]);

        $workspaces = Workspace::select('id', 'name', 'slug')->get();

        return Inertia::render('admin/feature-flags', [
            'flags' => $flags,
            'workspaces' => $workspaces,
        ]);
    }

    /**
     * Store a newly created feature flag.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255', 'unique:feature_flags,key'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_global' => ['boolean'],
            'workspace_ids' => ['nullable', 'array'],
            'workspace_ids.*' => ['integer', 'exists:workspaces,id'],
        ]);

        if (! isset($validated['workspace_ids'])) {
            $validated['workspace_ids'] = [];
        }

        FeatureFlag::create($validated);

        Feature::flushCache();

        return back()->with('success', 'Feature flag created.');
    }

    /**
     * Update the specified feature flag.
     */
    public function update(Request $request, FeatureFlag $featureFlag): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255', Rule::unique('feature_flags')->ignore($featureFlag->id)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_global' => ['boolean'],
            'workspace_ids' => ['nullable', 'array'],
            'workspace_ids.*' => ['integer', 'exists:workspaces,id'],
        ]);

        if (! isset($validated['workspace_ids'])) {
            $validated['workspace_ids'] = [];
        }

        $featureFlag->update($validated);

        Feature::flushCache();

        return back()->with('success', 'Feature flag updated.');
    }

    /**
     * Remove the specified feature flag.
     */
    public function destroy(FeatureFlag $featureFlag): RedirectResponse
    {
        $featureFlag->delete();

        // Also purge any dynamic pennant data specifically for this feature in DB driver.
        Feature::purge($featureFlag->key);
        Feature::flushCache();

        return back()->with('success', 'Feature flag deleted.');
    }
}
