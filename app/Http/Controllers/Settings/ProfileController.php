<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Requests\Settings\UpdateLocaleRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'bio' => $validated['bio'] ?? null,
            'timezone' => $validated['timezone'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url) {
                Storage::disk('public')->delete($user->avatar_url);
            }
            $user->avatar_url = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar') && $user->avatar_url) {
            Storage::disk('public')->delete($user->avatar_url);
            $user->avatar_url = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Update the user's locale preference.
     */
    public function updateLocale(UpdateLocaleRequest $request): RedirectResponse
    {
        $request->user()->update([
            'locale' => $request->validated()['locale'],
        ]);

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Check for workspaces where the user is the owner
        $ownedWorkspaces = $user->ownedWorkspaces;

        foreach ($ownedWorkspaces as $workspace) {
            // If it's a shared workspace with other members, prevent deletion
            if (! $workspace->personal_workspace && $workspace->users()->count() > 1) {
                return back()->withErrors([
                    'account' => __('You cannot delete your account while you own a workspace with other members. Please transfer ownership or remove all members first.'),
                ]);
            }
        }

        // logout before deleting to avoid session issues
        Auth::logout();

        // Delete personal/solely-owned workspaces
        foreach ($ownedWorkspaces as $workspace) {
            // Cancel subscriptions if any
            if ($workspace->subscribed()) {
                $workspace->subscription()->cancelNow();
            }

            $workspace->delete();
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
