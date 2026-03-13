<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNoteController extends Controller
{
    /**
     * List all notes for a user.
     */
    public function index(int $userId): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($userId);

        $notes = $user->notes()
            ->with('admin:id,name')
            ->latest()
            ->get()
            ->map(fn (UserNote $note) => [
                'id' => $note->id,
                'note' => $note->note,
                'admin' => $note->admin ? ['id' => $note->admin->id, 'name' => $note->admin->name] : null,
                'created_at' => $note->created_at->toISOString(),
            ]);

        return response()->json(['notes' => $notes]);
    }

    /**
     * Store a new note for a user.
     */
    public function store(Request $request, int $userId): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($userId);

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        $note = $user->notes()->create([
            'admin_id' => $request->user()->id,
            'note' => $validated['note'],
        ]);

        $note->load('admin:id,name');

        return response()->json([
            'note' => [
                'id' => $note->id,
                'note' => $note->note,
                'admin' => $note->admin ? ['id' => $note->admin->id, 'name' => $note->admin->name] : null,
                'created_at' => $note->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Delete a specific note.
     */
    public function destroy(int $userId, int $noteId): JsonResponse
    {
        User::withTrashed()->findOrFail($userId);

        $note = UserNote::where('user_id', $userId)->findOrFail($noteId);
        $note->delete();

        return response()->json(['success' => true]);
    }
}
