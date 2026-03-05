<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PasswordHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request): Response
    {
        $history = PasswordHistory::where('user_id', $request->user()->id)
            ->latest('changed_at')
            ->take(10)
            ->get()
            ->map(fn (PasswordHistory $entry) => [
                'id' => $entry->id,
                'ip_address' => $entry->ip_address,
                'user_agent' => $entry->user_agent,
                'changed_at' => $entry->changed_at->toIso8601String(),
            ]);

        return Inertia::render('settings/password', [
            'passwordHistory' => $history,
        ]);
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
            'password_updated_at' => now(),
        ]);

        PasswordHistory::create([
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'changed_at' => now(),
        ]);

        return back();
    }
}
