<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class WorkspaceLogoController extends Controller
{
    /**
     * Update the workspace logo.
     */
    public function update(Request $request): JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;

        Gate::authorize('update', $workspace);

        $request->validate([
            'image' => ['required', 'image', 'max:2048'],
        ]);

        $oldLogo = $workspace->getRawOriginal('logo');
        if ($oldLogo && ! str_starts_with($oldLogo, 'http')) {
            Storage::disk('public')->delete($oldLogo);
        }

        $path = $request->file('image')->store('logos', 'public');
        $workspace->update(['logo' => $path]);

        return response()->json([
            'message' => 'Workspace logo updated successfully.',
            'logo_url' => $workspace->logo_url,
        ]);
    }

    /**
     * Remove the workspace logo.
     */
    public function destroy(Request $request): JsonResponse
    {
        $workspace = $request->user()->currentWorkspace;

        Gate::authorize('update', $workspace);

        $oldLogo = $workspace->getRawOriginal('logo');
        if ($oldLogo && ! str_starts_with($oldLogo, 'http')) {
            Storage::disk('public')->delete($oldLogo);
        }

        $workspace->update(['logo' => null]);

        return response()->json([
            'message' => 'Workspace logo removed successfully.',
        ]);
    }
}
