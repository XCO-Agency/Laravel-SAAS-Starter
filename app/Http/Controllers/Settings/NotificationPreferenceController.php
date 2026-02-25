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
            'notification_preferences' => $request->user()->notification_preferences ?? [
                'marketing' => true,
                'security' => true,
                'team' => true,
            ],
        ]);
    }

    /**
     * Update the user's notification preferences.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.marketing' => ['boolean'],
            'preferences.security' => ['boolean'],
            'preferences.team' => ['boolean'],
        ]);

        $request->user()->update([
            'notification_preferences' => array_merge(
                $request->user()->notification_preferences ?? [],
                $validated['preferences']
            )
        ]);

        return back()->with('success', __('Notification preferences updated.'));
    }
}
