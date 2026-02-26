<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Services\WorkspaceExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkspaceExportController extends Controller
{
    /**
     * Handle the workspace data export.
     */
    public function export(Request $request, WorkspaceExportService $exportService): StreamedResponse
    {
        $workspace = $request->user()->currentWorkspace;

        Gate::authorize('update', $workspace);

        $data = $exportService->getExportData($workspace);
        $filename = 'workspace-export-'.$workspace->slug.'-'.now()->format('Y-m-d').'.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }
}
