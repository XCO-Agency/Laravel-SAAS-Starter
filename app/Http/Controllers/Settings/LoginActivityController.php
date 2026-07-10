<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LoginActivityController extends Controller
{
    /**
     * Display the user's login activity history.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $activities = $user->loginActivities()
            ->latest('login_at')
            ->take(50)
            ->get()
            ->map(fn ($activity) => [
                'id' => $activity->id,
                'ip_address' => $activity->ip_address,
                'device' => $activity->parsedDevice(),
                'login_at' => $activity->login_at->toISOString(),
                'is_successful' => $activity->is_successful,
            ]);

        return Inertia::render('settings/login-activity', [
            'activities' => $activities,
        ]);
    }

    /**
     * Export the user's login activity history as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $filename = 'login-history-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($request): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'IP', 'Device/User-Agent', 'Location', 'Status']);

            $request->user()->loginActivities()
                ->latest('login_at')
                ->lazy()
                ->each(function (LoginActivity $activity) use ($handle): void {
                    fputcsv($handle, [
                        $activity->login_at?->toDateTimeString(),
                        $activity->ip_address ?? '',
                        $activity->parsedDevice(),
                        '',
                        $activity->is_successful ? 'Success' : 'Failed',
                    ]);
                });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
