<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingChecklistController extends Controller
{
    /**
     * Return the current checklist step completion state for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        if ($user->onboarding_checklist_dismissed_at) {
            return response()->json(['dismissed' => true, 'steps' => []]);
        }

        $steps = [
            [
                'id' => 'complete_profile',
                'label' => 'Complete your profile',
                'description' => 'Add a bio and profile photo',
                'completed' => ! empty($user->bio),
                'href' => '/settings/profile',
            ],
            [
                'id' => 'enable_2fa',
                'label' => 'Enable two-factor authentication',
                'description' => 'Secure your account with 2FA',
                'completed' => $user->two_factor_confirmed_at !== null,
                'href' => '/settings/two-factor',
            ],
            [
                'id' => 'invite_member',
                'label' => 'Invite a team member',
                'description' => 'Grow your workspace team',
                'completed' => $workspace && $workspace->users()->count() > 1,
                'href' => '/team',
            ],
            [
                'id' => 'connect_billing',
                'label' => 'Connect billing',
                'description' => 'Subscribe to a plan for full access',
                'completed' => $workspace && $workspace->subscribed('default'),
                'href' => '/billing',
            ],
        ];

        return response()->json([
            'dismissed' => false,
            'steps' => $steps,
            'completed' => collect($steps)->where('completed', true)->count(),
            'total' => count($steps),
        ]);
    }

    /**
     * Dismiss the onboarding checklist permanently.
     */
    public function dismiss(Request $request): JsonResponse
    {
        $request->user()->forceFill([
            'onboarding_checklist_dismissed_at' => now(),
        ])->save();

        return response()->json(['success' => true]);
    }
}
