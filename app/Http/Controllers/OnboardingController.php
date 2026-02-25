<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Services\WorkspaceService;

class OnboardingController extends Controller
{
    /**
     * Display the onboarding wizard.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // If they are already onboarded, don't let them see the wizard again
        if ($request->user() && $request->user()->onboarded_at) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/wizard');
    }

    /**
     * Process the final onboarding payload and instantiate the user environment.
     */
    public function store(Request $request, WorkspaceService $workspaceService): RedirectResponse
    {
        // Ignore if already onboarded
        if ($request->user() && $request->user()->onboarded_at) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            'workspace_name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();

        // 1. Create the initial workspace cleanly
        $workspace = $workspaceService->create($user, [
            'name' => $validated['workspace_name'],
            'personal_workspace' => false, // Formal SaaS workspace
        ]);

        // 2. Mark the account formally onboarded
        $user->forceFill([
            'onboarded_at' => now(),
        ])->save();

        return redirect()->route('dashboard')
            ->with('success', 'Welcome! Your workspace is ready.');
    }
}
