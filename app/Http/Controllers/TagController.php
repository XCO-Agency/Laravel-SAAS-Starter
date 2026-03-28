<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tags = $workspace->tags()
            ->withCount('workspaces')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $tags,
        ]);
    }

    public function store(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;

        while (Tag::where('workspace_id', $workspace->id)->where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$counter++;
        }

        $tag = Tag::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'],
            'description' => $validated['description'] ?? null,
            'workspace_id' => $workspace->id,
            'user_id' => $request->user()->id,
        ]);

        // Attach to workspace
        $workspace->tags()->attach($tag->id);

        return response()->json([
            'message' => 'Tag created and assigned successfully.',
            'data' => $tag,
        ], 201);
    }

    public function update(Request $request, Workspace $workspace, Tag $tag)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Only tag creator or workspace admin can update
        if ($tag->user_id !== $request->user()->id && ! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:50'],
            'color' => ['required', 'string', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $tag->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;

            while (Tag::where('workspace_id', $workspace->id)
                ->where('slug', $slug)
                ->where('id', '!=', $tag->id)
                ->exists()) {
                $slug = $originalSlug.'-'.$counter++;
            }

            $validated['slug'] = $slug;
        }

        $tag->update($validated);

        return response()->json([
            'message' => 'Tag updated successfully.',
            'data' => $tag,
        ]);
    }

    public function destroy(Request $request, Workspace $workspace, Tag $tag)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Only tag creator or workspace admin can delete
        if ($tag->user_id !== $request->user()->id && ! $request->user()->userIsAdmin($workspace)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Detach from workspace
        $workspace->tags()->detach($tag->id);

        // Delete tag if no longer used
        if ($tag->workspaces()->count() === 0) {
            $tag->delete();
        }

        return response()->json([
            'message' => 'Tag removed from workspace successfully.',
        ]);
    }

    public function attach(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'tag_id' => ['required', 'exists:tags,id'],
        ]);

        $tag = Tag::findOrFail($validated['tag_id']);

        // Check if tag belongs to this workspace or is global
        if ($tag->workspace_id !== null && $tag->workspace_id !== $workspace->id) {
            return response()->json(['message' => 'Invalid tag.'], 403);
        }

        // Check if already attached
        if ($workspace->tags()->where('tag_id', $tag->id)->exists()) {
            return response()->json(['message' => 'Tag already assigned.'], 422);
        }

        $workspace->tags()->attach($tag->id);

        return response()->json([
            'message' => 'Tag assigned successfully.',
            'data' => $tag,
        ]);
    }

    public function detach(Request $request, Workspace $workspace, Tag $tag)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $workspace->tags()->detach($tag->id);

        return response()->json([
            'message' => 'Tag removed successfully.',
        ]);
    }

    public function available(Request $request, Workspace $workspace)
    {
        if (! $request->user()->belongsToWorkspace($workspace)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Get global tags and workspace-specific tags not yet assigned
        $assignedTagIds = $workspace->tags()->pluck('tags.id');

        $tags = Tag::query()
            ->where(function ($query) use ($workspace) {
                $query->whereNull('workspace_id')
                    ->orWhere('workspace_id', $workspace->id);
            })
            ->whereNotIn('id', $assignedTagIds)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $tags,
        ]);
    }

    public function all(Request $request)
    {
        $tags = Tag::query()
            ->where(function ($query) use ($request) {
                $query->whereNull('workspace_id')
                    ->orWhere('user_id', $request->user()->id);
            })
            ->withCount('workspaces')
            ->orderBy('name')
            ->paginate(50);

        return response()->json([
            'data' => $tags->items(),
            'meta' => [
                'current_page' => $tags->currentPage(),
                'last_page' => $tags->lastPage(),
                'total' => $tags->total(),
            ],
        ]);
    }
}
