<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
}
