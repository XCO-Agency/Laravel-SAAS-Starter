<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Jobs\ExportPersonalDataJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SecurityController extends Controller
{
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
    public function downloadExport(Request $request, string $filename): StreamedResponse
    {
        $path = 'exports/' . $filename;
        
        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Export file not found or expired.');
        }
        
        return response()->download(Storage::disk('local')->path($path));
    }
}
