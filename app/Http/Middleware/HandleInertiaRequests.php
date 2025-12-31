<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $currentWorkspace = $user?->currentWorkspace;
        $workspaces = [];
        // Locale is now handled by SetLocale middleware
        $locale = app()->getLocale();

        if ($user) {
            $workspaces = $user->workspaces()
                ->select('workspaces.id', 'workspaces.name', 'workspaces.slug', 'workspaces.logo', 'workspaces.personal_workspace')
                ->get()
                ->map(fn ($workspace) => [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'logo' => $workspace->logo,
                    'logo_url' => $workspace->logo ? Storage::url($workspace->logo) : null,
                    'personal_workspace' => $workspace->personal_workspace,
                    'role' => $workspace->pivot->role,
                    'is_current' => $currentWorkspace && $workspace->id === $currentWorkspace->id,
                ]);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
            ],
            'locale' => $locale,
            'currentWorkspace' => $currentWorkspace ? [
                'id' => $currentWorkspace->id,
                'name' => $currentWorkspace->name,
                'slug' => $currentWorkspace->slug,
                'logo' => $currentWorkspace->logo,
                'logo_url' => $currentWorkspace->logo ? Storage::url($currentWorkspace->logo) : null,
                'personal_workspace' => $currentWorkspace->personal_workspace,
                'owner_id' => $currentWorkspace->owner_id,
                'plan' => $currentWorkspace->plan_name,
                'role' => $currentWorkspace->getUserRole($user),
            ] : null,
            'workspaces' => $workspaces,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
