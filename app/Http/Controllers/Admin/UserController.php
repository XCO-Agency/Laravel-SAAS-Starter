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

        $users = User::query()
            ->when($search, fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            )
            ->latest()
            ->paginate(15)
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
    public function update(Request $request, User $user): RedirectResponse
    {
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
     * Delete a user from the platform.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account from here.']);
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }
}
