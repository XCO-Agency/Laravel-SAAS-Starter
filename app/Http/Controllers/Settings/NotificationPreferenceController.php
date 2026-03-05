<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * Display the user's notification preferences.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('settings/notifications', [
            'notification_preferences' => $request->user()->normalizedNotificationPreferences(),
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.channels' => ['required', 'array'],
            'preferences.channels.email' => ['required', 'boolean'],
            'preferences.channels.in_app' => ['required', 'boolean'],
            'preferences.categories' => ['required', 'array'],
            'preferences.categories.marketing' => ['required', 'boolean'],
            'preferences.categories.security' => ['required', 'boolean'],
            'preferences.categories.team' => ['required', 'boolean'],
            'preferences.categories.billing' => ['required', 'boolean'],
        ]);

        $current = $request->user()->normalizedNotificationPreferences();

        $request->user()->update([
            'notification_preferences' => [
                'channels' => array_merge($current['channels'], $validated['preferences']['channels']),
                'categories' => array_merge($current['categories'], $validated['preferences']['categories']),
            ],
        ]);

        return back()->with('success', __('Notification preferences updated.'));
    }
}
