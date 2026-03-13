<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceSecurityController extends Controller
{
    /**
     * Show the workspace security settings page.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace;

        return Inertia::render('settings/workspace-security', [
            'require_two_factor' => (bool) $workspace->require_two_factor,
            'allowed_ips' => $workspace->allowed_ips ?? [],
            'allowed_email_domains' => $workspace->allowed_email_domains ?? [],
        ]);
    }

    /**
     * Update the workspace security settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'require_two_factor' => ['required', 'boolean'],
            'allowed_ips' => ['nullable', 'string'],
            'allowed_email_domains' => ['nullable', 'string'],
        ]);

        $workspace = $request->user()->currentWorkspace;

        // Only workspace owners can change this setting
        if ($workspace->owner_id !== $request->user()->id) {
            abort(403, 'Only the workspace owner can change security settings.');
        }

        $ips = [];
        if ($request->filled('allowed_ips')) {
            $ips = array_filter(array_map('trim', explode(',', $request->allowed_ips)));
            foreach ($ips as $ip) {
                if (! filter_var($ip, FILTER_VALIDATE_IP)) {
                    return back()->withErrors(['allowed_ips' => 'The IP address "'.$ip.'" is invalid.'])->withInput();
                }
            }
        }

        $domains = [];
        if ($request->filled('allowed_email_domains')) {
            $domains = array_filter(array_map('trim', explode(',', $request->allowed_email_domains)));
            foreach ($domains as $domain) {
                if (! preg_match('/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/', $domain)) {
                    return back()->withErrors(['allowed_email_domains' => 'The domain "'.$domain.'" is invalid.'])->withInput();
                }
            }
        }

        $workspace->update([
            'require_two_factor' => $request->boolean('require_two_factor'),
            'allowed_ips' => empty($ips) ? null : array_values($ips),
            'allowed_email_domains' => empty($domains) ? null : array_values($domains),
        ]);

        return back()->with('success', 'Workspace security settings updated.');
    }

    /**
     * Show the 2FA enforcement wall for members who need to enable 2FA.
     */
    public function twoFactorRequired(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        $workspaces = $user->workspaces()
            ->where('workspaces.id', '!=', $workspace?->id)
            ->get()
            ->map(function ($ws) {
                return [
                    'id' => $ws->id,
                    'name' => $ws->name,
                    'slug' => $ws->slug,
                    'logo_url' => $ws->plan === 'custom' ? null : $ws->logo_url, // fallback
                    'personal_workspace' => $ws->personal_workspace,
                    'plan' => $ws->plan,
                    'role' => $ws->pivot->role,
                ];
            });

        return Inertia::render('workspace-2fa-required', [
            'workspace_name' => $workspace?->name,
            'workspaces' => $workspaces,
            'is_owner' => $workspace?->owner_id === $user->id,
        ]);
    }
}
