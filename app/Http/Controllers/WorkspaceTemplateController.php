<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceTemplate;
use App\Services\WorkspaceTemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WorkspaceTemplateController extends Controller
{
    public function __construct(
        private WorkspaceTemplateService $templateService
    ) {}

    public function create(Request $request)
    {
        $user = $request->user();
        $workspace = $user->currentWorkspace;

        return Inertia::render('workspace-templates/create', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'logo_url' => $workspace->logo_url,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $category = $request->input('category');
        $search = $request->input('search');

        $templates = WorkspaceTemplate::query()
            ->where(function ($query) use ($user) {
                $query->public()
                    ->orWhere('user_id', $user->id);
            })
            ->when($category, fn ($q) => $q->byCategory($category))
            ->when($search, fn ($q) => $q->search($search))
            ->with('user:id,name', 'workspace:id,name')
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->paginate(12);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $templates->items(),
                'meta' => [
                    'current_page' => $templates->currentPage(),
                    'last_page' => $templates->lastPage(),
                    'total' => $templates->total(),
                ],
            ]);
        }

        return Inertia::render('workspace-templates/index', [
            'templates' => collect($templates->items())->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'description' => $t->description,
                'category' => $t->category,
                'icon' => $t->icon ?? 'building',
                'is_public' => $t->is_public,
                'usage_count' => $t->usage_count,
                'created_at' => $t->created_at->toISOString(),
                'updated_at' => $t->updated_at->toISOString(),
                'user' => $t->user ? [
                    'id' => $t->user->id,
                    'name' => $t->user->name,
                ] : null,
                'workspace' => $t->workspace ? [
                    'id' => $t->workspace->id,
                    'name' => $t->workspace->name,
                ] : null,
            ]),
            'meta' => [
                'current_page' => $templates->currentPage(),
                'last_page' => $templates->lastPage(),
            ],
            'categories' => WorkspaceTemplate::getCategories(),
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_public' => ['boolean'],
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(WorkspaceTemplate::getCategories()))],
        ]);

        $user = $request->user();
        $workspace = $user->currentWorkspace;

        if (! $workspace) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'No workspace selected.'], 403);
            }
            abort(403, 'No workspace selected.');
        }

        $template = $this->templateService->createFromWorkspace(
            $user,
            $workspace,
            [
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
                'category' => $validated['category'],
                'icon' => 'layout-grid',
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Template created successfully.',
                'data' => $template,
            ], 201);
        }

        return redirect()->route('workspace-templates.index')
            ->with('success', 'Template created successfully.');
    }

    public function show(Request $request, WorkspaceTemplate $template)
    {
        $user = $request->user();

        // Check if user can view this template
        if (! $template->is_public && $template->user_id !== $user->id) {
            abort(403, 'Unauthorized.');
        }

        $template->load('user:id,name,avatar_url', 'workspace:id,name');

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $template,
            ]);
        }

        return Inertia::render('workspace-templates/show', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'category' => $template->category,
                'is_public' => $template->is_public,
                'usage_count' => $template->usage_count,
                'created_at' => $template->created_at->toISOString(),
                'updated_at' => $template->updated_at->toISOString(),
                'creator' => $template->user ? [
                    'id' => $template->user->id,
                    'name' => $template->user->name,
                ] : null,
                'configuration' => $template->configuration ?? [],
            ],
            'canEdit' => $template->user_id === $user->id,
            'canDelete' => $template->user_id === $user->id,
        ]);
    }

    public function update(Request $request, WorkspaceTemplate $template)
    {
        // Only the creator can update
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['required', 'string', 'in:'.implode(',', array_keys(WorkspaceTemplate::getAvailableIcons()))],
            'is_public' => ['boolean'],
            'category' => ['required', 'string', 'in:'.implode(',', array_keys(WorkspaceTemplate::getCategories()))],
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully.',
            'data' => $template,
        ]);
    }

    public function destroy(Request $request, WorkspaceTemplate $template)
    {
        // Only the creator can delete
        if ($template->user_id !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            abort(403, 'Unauthorized.');
        }

        $template->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Template deleted successfully.',
            ]);
        }

        return redirect()->route('workspace-templates.index')
            ->with('success', 'Template deleted successfully.');
    }

    public function use(Request $request, WorkspaceTemplate $template)
    {
        // Check if user can use this template
        if (! $template->is_public && $template->user_id !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            abort(403, 'Unauthorized.');
        }

        $user = $request->user();

        $workspace = $this->templateService->createWorkspaceFromTemplate(
            $user,
            $template,
            [
                'name' => $template->name.' Copy',
                'slug' => Str::slug($template->name.'-'.uniqid()),
            ]
        );

        // Switch to the new workspace
        $user->switchWorkspace($workspace);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Workspace created from template successfully.',
                'data' => [
                    'workspace' => $workspace,
                    'redirect_url' => route('dashboard', ['workspace' => $workspace->slug]),
                ],
            ], 201);
        }

        return redirect()->route('dashboard')
            ->with('success', 'Workspace created from template successfully.');
    }

    public function duplicate(Request $request, WorkspaceTemplate $template)
    {
        // User can duplicate public templates or their own
        if (! $template->is_public && $template->user_id !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            abort(403, 'Unauthorized.');
        }

        $newTemplate = $this->templateService->duplicateTemplate(
            $request->user(),
            $template
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Template duplicated successfully.',
                'data' => $newTemplate,
            ], 201);
        }

        return redirect()->back()
            ->with('success', 'Template duplicated successfully.');
    }

    public function myTemplates(Request $request)
    {
        $templates = WorkspaceTemplate::forUser($request->user()->id)
            ->with('workspace:id,name')
            ->orderByDesc('created_at')
            ->paginate(12);

        return response()->json([
            'data' => $templates->items(),
            'meta' => [
                'current_page' => $templates->currentPage(),
                'last_page' => $templates->lastPage(),
                'total' => $templates->total(),
            ],
        ]);
    }
}
