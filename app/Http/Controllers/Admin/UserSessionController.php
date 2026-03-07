<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;

class UserSessionController extends Controller
{
    /**
     * Display a listing of active sessions for the given user.
     */
    public function index(User $user): Response
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'is_current_device' => $session->id === request()->session()->getId(),
                ];
            });

        return Inertia::render('admin/user-sessions', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'sessions' => $sessions,
        ]);
    }

    /**
     * Terminate a specific session.
     */
    public function destroy(User $user, string $sessionId): RedirectResponse
    {
        if ($sessionId === request()->session()->getId()) {
            return back()->withErrors(['session' => 'You cannot terminate your own active session from here.']);
        }

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', $sessionId)
            ->delete();

        return back()->with('success', 'User session terminated successfully.');
    }

    /**
     * Terminate all sessions for a user.
     */
    public function destroyAll(Request $request, User $user): RedirectResponse
    {
        $query = DB::table('sessions')->where('user_id', $user->id);

        $currentSessionId = request()->session()->getId();
        $query->where('id', '!=', $currentSessionId);

        $count = $query->count();
        $query->delete();

        return back()->with('success', "{$count} user session(s) terminated successfully.");
    }
}
