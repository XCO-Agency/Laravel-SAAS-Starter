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

        $impersonatorId = Auth::id();

        // Store the original superadmin ID
        $request->session()->put('impersonated_by', $impersonatorId);

        // Create the audit log
        $log = \App\Models\ImpersonationLog::create([
            'impersonator_id' => $impersonatorId,
            'impersonated_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'started_at' => now(),
        ]);

        // Store the log ID so we can update the ended_at timestamp later
        $request->session()->put('impersonation_log_id', $log->id);

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
        $logId = $request->session()->get('impersonation_log_id');

        // Remove the session keys
        $request->session()->forget('impersonated_by');
        $request->session()->forget('impersonation_log_id');

        if ($logId) {
            \App\Models\ImpersonationLog::where('id', $logId)->update([
                'ended_at' => now(),
            ]);
        }

        // Restore the original user
        Auth::loginUsingId($originalId);

        return redirect()->route('admin.dashboard')->with('success', 'Impersonation ended successfully.');
    }
}
