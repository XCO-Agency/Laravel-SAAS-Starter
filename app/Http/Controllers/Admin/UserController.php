<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a paginated, searchable list of all users.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        $users = User::withTrashed()
            ->when($search, fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            )
            ->latest()
            ->paginate(15)
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_superadmin' => $user->is_superadmin,
                'created_at' => $user->created_at,
                'deleted_at' => $user->deleted_at,
            ])
            ->withQueryString();

        return Inertia::render('admin/users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Toggle superadmin status for a user.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        $validated = $request->validate([
            'is_superadmin' => ['required', 'boolean'],
        ]);

        // Prevent self-demotion
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot modify your own superadmin status.']);
        }

        $user->update($validated);

        return back()->with('success', $user->name.($validated['is_superadmin'] ? ' promoted to superadmin.' : ' demoted from superadmin.'));
    }

    /**
     * Soft-delete a user from the platform.
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = User::withTrashed()->findOrFail($id);

        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account from here.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);

        $user->restore();

        return back()->with('success', "{$user->name} has been restored.");
    }
}
