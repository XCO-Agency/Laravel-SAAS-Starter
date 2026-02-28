<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SeoMetadata;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeoMetadataController extends Controller
{
    /**
     * Display the SEO metadata management page.
     */
    public function index(): Response
    {
        $entries = SeoMetadata::query()
            ->orderByDesc('is_global')
            ->orderBy('path')
            ->get();

        return Inertia::render('admin/seo-metadata', [
            'entries' => $entries,
        ]);
    }

    /**
     * Store a new SEO metadata entry.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'path' => ['nullable', 'string', 'max:255', 'unique:seo_metadata,path'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:511'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:511'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'og_type' => ['nullable', 'string', 'max:50'],
            'twitter_card' => ['nullable', 'string', 'in:summary,summary_large_image,app,player'],
            'twitter_site' => ['nullable', 'string', 'max:255'],
            'twitter_creator' => ['nullable', 'string', 'max:255'],
            'twitter_image' => ['nullable', 'string', 'max:255'],
            'is_global' => ['boolean'],
        ]);

        // If marking as global, ensure path is null and unset any existing global
        if ($validated['is_global'] ?? false) {
            $validated['path'] = null;
            SeoMetadata::where('is_global', true)->update(['is_global' => false]);
        }

        SeoMetadata::create($validated);

        return redirect()->back()->with('success', 'SEO metadata entry created.');
    }

    /**
     * Update an existing SEO metadata entry.
     */
    public function update(Request $request, SeoMetadata $seoMetadata): RedirectResponse
    {
        $validated = $request->validate([
            'path' => ['nullable', 'string', 'max:255', 'unique:seo_metadata,path,'.$seoMetadata->id],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:511'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:511'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'og_type' => ['nullable', 'string', 'max:50'],
            'twitter_card' => ['nullable', 'string', 'in:summary,summary_large_image,app,player'],
            'twitter_site' => ['nullable', 'string', 'max:255'],
            'twitter_creator' => ['nullable', 'string', 'max:255'],
            'twitter_image' => ['nullable', 'string', 'max:255'],
            'is_global' => ['boolean'],
        ]);

        // If marking as global, ensure path is null and unset any existing global
        if ($validated['is_global'] ?? false) {
            $validated['path'] = null;
            SeoMetadata::where('is_global', true)
                ->where('id', '!=', $seoMetadata->id)
                ->update(['is_global' => false]);
        }

        $seoMetadata->update($validated);

        return redirect()->back()->with('success', 'SEO metadata entry updated.');
    }

    /**
     * Delete an SEO metadata entry.
     */
    public function destroy(SeoMetadata $seoMetadata): RedirectResponse
    {
        $seoMetadata->delete();

        return redirect()->back()->with('success', 'SEO metadata entry deleted.');
    }
}
