<?php

namespace App\Http\Controllers;

use App\Services\CsvImportService;
use App\Services\InvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeamImportController extends Controller
{
    public function __construct(
        protected CsvImportService $csvImportService,
        protected InvitationService $invitationService
    ) {}

    /**
     * Show the CSV import page.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        return Inertia::render('Team/import', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
            'canInvite' => $this->invitationService->canInvite($workspace),
            'memberLimitMessage' => $this->invitationService->getMemberLimitMessage($workspace),
        ]);
    }

    /**
     * Preview the CSV import results without sending invitations.
     */
    public function preview(Request $request): Response|RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $result = $this->csvImportService->parse($request->file('csv_file'), $workspace);

        if (empty($result['rows'])) {
            return redirect()->back()
                ->with('error', 'No valid rows found in the CSV file. Ensure it has a header row with an "email" column.');
        }

        return Inertia::render('Team/import', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
            'canInvite' => $this->invitationService->canInvite($workspace),
            'memberLimitMessage' => $this->invitationService->getMemberLimitMessage($workspace),
            'preview' => $result,
        ]);
    }

    /**
     * Process the CSV import and send invitations.
     */
    public function process(Request $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace;
        Gate::authorize('manageTeam', $workspace);

        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $result = $this->csvImportService->parse($request->file('csv_file'), $workspace);

        $invited = 0;
        $failed = 0;

        foreach ($result['rows'] as $row) {
            if ($row['status'] !== 'valid') {
                continue;
            }

            if (! $this->invitationService->canInvite($workspace)) {
                $failed += ($result['valid'] - $invited);

                break;
            }

            try {
                $this->invitationService->invite($workspace, $row['email'], $row['role']);
                $invited++;
            } catch (\Exception) {
                $failed++;
            }
        }

        $message = "Import complete: {$invited} invitation".($invited !== 1 ? 's' : '').' sent.';
        if ($failed > 0) {
            $message .= " {$failed} failed (plan limit reached or other errors).";
        }
        if ($result['skipped'] > 0) {
            $message .= " {$result['skipped']} skipped (duplicates or existing members).";
        }

        return redirect()->route('team.index')
            ->with('success', $message);
    }
}
