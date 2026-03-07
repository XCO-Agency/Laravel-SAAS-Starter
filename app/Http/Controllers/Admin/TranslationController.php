<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class TranslationController extends Controller
{
    /**
     * Get the base path for language files.
     */
    protected function getLangPath(): string
    {
        return lang_path();
    }

    /**
     * Retrieve all available locale JSON files.
     */
    protected function getAvailableLocales(): array
    {
        $path = $this->getLangPath();
        $files = File::files($path);

        $locales = [];
        foreach ($files as $file) {
            if ($file->getExtension() === 'json') {
                $locales[] = $file->getFilenameWithoutExtension();
            }
        }

        return $locales;
    }

    /**
     * Display the index of available translations.
     */
    public function index()
    {
        $locales = $this->getAvailableLocales();

        if (empty($locales)) {
            // Ensure at least English exists
            $this->createLocale('en');
            $locales = ['en'];
        }

        return Inertia::render('admin/translations', [
            'locales' => $locales,
        ]);
    }

    /**
     * Display a specific locale's translations compared to English.
     */
    public function show(string $locale)
    {
        $locales = $this->getAvailableLocales();

        if (! in_array($locale, $locales)) {
            abort(404, 'Locale not found');
        }

        $baseTranslations = $this->getTranslationsForLocale('en');
        $targetTranslations = $this->getTranslationsForLocale($locale);

        // Merge target translations into base to ensure all keys are present
        $translations = [];
        foreach ($baseTranslations as $key => $baseValue) {
            $translations[$key] = [
                'base' => $baseValue,
                'target' => $targetTranslations[$key] ?? '',
            ];
        }

        // Add any keys that exist in the target but NOT in the base
        foreach ($targetTranslations as $key => $targetValue) {
            if (! isset($translations[$key])) {
                $translations[$key] = [
                    'base' => '',
                    'target' => $targetValue,
                ];
            }
        }

        return Inertia::render('admin/translations', [
            'locales' => $locales,
            'currentLocale' => $locale,
            'translations' => $translations,
        ]);
    }

    /**
     * Update a specific translation string.
     */
    public function update(Request $request, string $locale)
    {
        $request->validate([
            'key' => ['required', 'string'],
            'value' => ['nullable', 'string'],
        ]);

        if (! in_array($locale, $this->getAvailableLocales())) {
            abort(404, 'Locale not found');
        }

        $translations = $this->getTranslationsForLocale($locale);

        $key = $request->input('key');
        $value = $request->input('value');

        if ($value === null || $value === '') {
            unset($translations[$key]);
        } else {
            $translations[$key] = $value;
        }

        $this->saveTranslationsForLocale($locale, $translations);

        return back()->with('success', 'Translation updated successfully.');
    }

    /**
     * Store a newly created locale file in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'locale' => ['required', 'string', 'alpha_dash', 'max:10'], // basic validation, no strictly mapped DB table
        ]);

        $locale = strtolower($request->input('locale'));

        if (in_array($locale, $this->getAvailableLocales())) {
            return back()->withErrors(['locale' => 'This locale already exists.']);
        }

        $this->createLocale($locale);

        return redirect()->route('admin.translations.show', $locale)
            ->with('success', 'New locale created successfully.');
    }

    /**
     * Helper to load JSON translations for a locale.
     */
    protected function getTranslationsForLocale(string $locale): array
    {
        $path = $this->getLangPath()."/{$locale}.json";

        if (File::exists($path)) {
            $content = File::get($path);

            return json_decode($content, true) ?? [];
        }

        return [];
    }

    /**
     * Helper to save JSON translations for a locale.
     */
    protected function saveTranslationsForLocale(string $locale, array $translations): void
    {
        $path = $this->getLangPath()."/{$locale}.json";

        // Sort keys alphabetically
        ksort($translations);

        File::put($path, json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    /**
     * Helper to create an empty locale file.
     */
    protected function createLocale(string $locale): void
    {
        $path = $this->getLangPath()."/{$locale}.json";
        File::put($path, '{}');
    }
}
