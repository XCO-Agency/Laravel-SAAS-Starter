<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    /**
     * Start impersonating a user.
     */
    public function impersonate(Request $request, User $user): RedirectResponse
    {
        // Prevent impersonating yourself
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot impersonate yourself.');
        }

        // Store the original superadmin ID
        $request->session()->put('impersonated_by', Auth::id());

        // Login as the target user
        Auth::login($user);

        return redirect()->route('dashboard')->with('success', "You are now impersonating {$user->name}.");
    }

    /**
     * Stop impersonating and revert back to the original superadmin.
     */
    public function leave(Request $request): RedirectResponse
    {
        if (! $request->session()->has('impersonated_by')) {
            return redirect()->route('dashboard');
        }

        $originalId = $request->session()->get('impersonated_by');
        
        // Remove the session key
        $request->session()->forget('impersonated_by');

        // Restore the original user
        Auth::loginUsingId($originalId);

        return redirect()->route('admin.dashboard')->with('success', 'Impersonation ended successfully.');
    }
}
