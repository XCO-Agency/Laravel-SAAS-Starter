<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    /**
     * Display the user's active sessions.
     */
    public function index(Request $request): Response
    {
        $sessions = $this->getFormattedSessions($request);

        return Inertia::render('settings/sessions', [
            'sessions' => $sessions,
            'currentSessionId' => $request->session()->getId(),
        ]);
    }

    /**
     * Revoke a specific session.
     */
    public function destroy(Request $request, string $sessionId): RedirectResponse
    {
        if (! Hash::check($request->input('password'), $request->user()->password)) {
            return redirect()->back()->withErrors(['password' => __('The provided password is incorrect.')]);
        }

        if ($sessionId === $request->session()->getId()) {
            return redirect()->back()->withErrors(['session' => __('You cannot revoke your current session.')]);
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->delete();

        return redirect()->back()->with('success', 'Session revoked.');
    }

    /**
     * Revoke all other sessions.
     */
    public function destroyAll(Request $request): RedirectResponse
    {
        if (! Hash::check($request->input('password'), $request->user()->password)) {
            return redirect()->back()->withErrors(['password' => __('The provided password is incorrect.')]);
        }

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return redirect()->back()->with('success', 'All other sessions revoked.');
    }

    /**
     * Get formatted session data for the authenticated user.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getFormattedSessions(Request $request): array
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->get();

        return $sessions->map(function ($session) use ($request) {
            $ua = $session->user_agent ?? '';

            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'device' => $this->parseDevice($ua),
                'platform' => $this->parsePlatform($ua),
                'browser' => $this->parseBrowser($ua),
                'is_current' => $session->id === $request->session()->getId(),
                'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
            ];
        })->values()->all();
    }

    /**
     * Parse device type from user agent string.
     */
    private function parseDevice(string $ua): string
    {
        if (preg_match('/Mobile|Android|iPhone|iPod/i', $ua)) {
            return 'mobile';
        }

        if (preg_match('/iPad|Tablet/i', $ua)) {
            return 'tablet';
        }

        return 'desktop';
    }

    /**
     * Parse platform name from user agent string.
     */
    private function parsePlatform(string $ua): string
    {
        if (str_contains($ua, 'Windows')) {
            return 'Windows';
        }
        if (str_contains($ua, 'Macintosh') || str_contains($ua, 'Mac OS')) {
            return 'macOS';
        }
        if (str_contains($ua, 'Linux')) {
            return 'Linux';
        }
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) {
            return 'iOS';
        }
        if (str_contains($ua, 'Android')) {
            return 'Android';
        }

        return 'Unknown';
    }

    /**
     * Parse browser name from user agent string.
     */
    private function parseBrowser(string $ua): string
    {
        if (str_contains($ua, 'Edg/')) {
            return 'Edge';
        }
        if (str_contains($ua, 'Chrome') && ! str_contains($ua, 'Edg/')) {
            return 'Chrome';
        }
        if (str_contains($ua, 'Firefox')) {
            return 'Firefox';
        }
        if (str_contains($ua, 'Safari') && ! str_contains($ua, 'Chrome')) {
            return 'Safari';
        }

        return 'Unknown';
    }
}
