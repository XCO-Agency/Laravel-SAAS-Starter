<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Jobs\ExportPersonalDataJob;
use App\Models\PasswordHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
            ? [new Middleware('password.confirm', only: ['authentication'])]
            : [];
    }

    /**
     * Show the combined authentication settings page (password + 2FA).
     */
    public function authentication(Request $request): Response
    {
        $passwordHistory = PasswordHistory::where('user_id', $request->user()->id)
            ->latest('changed_at')
            ->take(10)
            ->get()
            ->map(fn (PasswordHistory $entry) => [
                'id' => $entry->id,
                'ip_address' => $entry->ip_address,
                'user_agent' => $entry->user_agent,
                'changed_at' => $entry->changed_at->toIso8601String(),
            ]);

        return Inertia::render('settings/security/authentication', [
            'passwordHistory' => $passwordHistory,
            'twoFactorEnabled' => $request->user()->hasEnabledTwoFactorAuthentication(),
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }

    /**
     * Dispatch the job to export the user's personal data.
     */
    public function exportData(Request $request): RedirectResponse
    {
        ExportPersonalDataJob::dispatch($request->user());

        return back()->with('success', __('Your data export has been queued. You will receive an email shortly with a download link.'));
    }

    /**
     * Download the specified user data export file securely.
     */
    public function downloadExport(Request $request, string $filename): BinaryFileResponse
    {
        $path = 'exports/'.$filename;

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'Export file not found or expired.');
        }

        return response()->download(Storage::disk('local')->path($path));
    }
}
