<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    /**
     * Display a paginated, searchable list of all workspaces.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $plan = $request->input('plan', '');

        $workspaces = Workspace::withTrashed()
            ->withCount('users')
            ->with('owner:id,name,email')
            ->when($search, fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
            )
            ->latest()
            ->paginate(15)
            ->through(fn ($workspace) => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'personal_workspace' => $workspace->personal_workspace,
                'plan' => $workspace->plan_name,
                'users_count' => $workspace->users_count,
                'owner' => $workspace->owner ? [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                ] : null,
                'created_at' => $workspace->created_at,
                'deleted_at' => $workspace->deleted_at,
            ])
            ->withQueryString();

        // Filter by plan name after mapping (since plan_name is computed, not a DB column)
        if ($plan) {
            $filteredData = collect($workspaces->items())->filter(fn ($w) => $w['plan'] === $plan)->values();
            $workspaces->setCollection($filteredData);
        }

        return Inertia::render('admin/workspaces', [
            'workspaces' => $workspaces,
            'filters' => [
                'search' => $search,
                'plan' => $plan,
            ],
            'planOptions' => collect(config('billing.plans', []))->map(fn ($p) => $p['name'])->values(),
        ]);
    }
}
