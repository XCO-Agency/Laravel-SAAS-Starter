<?php

namespace App\Http\Controllers;

use App\Models\OnboardingStepLog;
use App\Services\WorkspaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

        // Log the welcome step view
        $this->logStep($request->user()->id, 'welcome', 'viewed');

        return Inertia::render('onboarding/wizard');
    }

    /**
     * Track an onboarding step event from the frontend.
     */
    public function trackStep(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'step' => ['required', 'string', 'in:welcome,workspace,plan'],
            'action' => ['required', 'string', 'in:viewed,completed'],
        ]);

        $this->logStep(
            $request->user()->id,
            $validated['step'],
            $validated['action'],
        );

        return response()->json(['success' => true]);
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
            'onboarding_plan' => ['nullable', 'string', 'in:free,pro,business'],
            'onboarding_billing_period' => ['nullable', 'string', 'in:monthly,yearly'],
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

        // 3. Log onboarding completion
        $this->logStep($user->id, 'plan', 'completed');

        $selectedPlan = $validated['onboarding_plan'] ?? 'free';
        $selectedBillingPeriod = $validated['onboarding_billing_period'] ?? null;

        if ($selectedPlan !== 'free' && $selectedBillingPeriod) {
            return redirect()->route('billing.plans', [
                'onboarding' => '1',
                'recommended_plan' => $selectedPlan,
                'recommended_billing_period' => $selectedBillingPeriod,
            ])->with('success', 'Welcome! Your workspace is ready.')
                ->with('info', 'Choose your billing plan to unlock premium features.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'Welcome! Your workspace is ready.');
    }

    /**
     * Log an onboarding step event if not already logged.
     */
    private function logStep(int $userId, string $step, string $action): void
    {
        OnboardingStepLog::firstOrCreate([
            'user_id' => $userId,
            'step' => $step,
            'action' => $action,
        ]);
    }
}
