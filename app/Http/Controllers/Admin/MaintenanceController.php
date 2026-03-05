<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    private const CACHE_KEY = 'maintenance_mode';

    /**
     * Display the maintenance mode settings.
     */
    public function index(): Response
    {
        $config = Cache::get(self::CACHE_KEY, [
            'active' => false,
            'message' => '',
            'secret' => '',
        ]);

        return Inertia::render('admin/maintenance', [
            'maintenance' => $config,
            'isDown' => app()->isDownForMaintenance(),
        ]);
    }

    /**
     * Toggle maintenance mode.
     */
    public function toggle(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $isCurrentlyDown = app()->isDownForMaintenance();

        if ($isCurrentlyDown) {
            // Bring the app up
            Artisan::call('up');

            Cache::put(self::CACHE_KEY, [
                'active' => false,
                'message' => $validated['message'] ?? '',
                'secret' => '',
            ]);

            return back()->with('success', 'Application is now live.');
        }

        // Put the app down with a secret for bypass access
        $secret = bin2hex(random_bytes(16));

        $artisanArgs = ['--with-secret' => true];

        if (! empty($validated['message'])) {
            $artisanArgs['--render'] = 'errors.503';
        }

        Artisan::call('down', $artisanArgs);

        // Extract the generated secret from the output
        $output = Artisan::output();
        if (preg_match('/secret=([a-z0-9-]+)/i', $output, $matches)) {
            $secret = $matches[1];
        }

        Cache::put(self::CACHE_KEY, [
            'active' => true,
            'message' => $validated['message'] ?? '',
            'secret' => $secret,
        ]);

        return back()->with('success', 'Application is now in maintenance mode.');
    }
}
