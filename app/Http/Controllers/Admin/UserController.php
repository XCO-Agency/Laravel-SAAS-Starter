<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    /**
     * Bulk verify email for selected users.
     */
    public function bulkVerifyEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $count = User::whereIn('id', $validated['user_ids'])
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);

        return back()->with('success', "{$count} user(s) email verified.");
    }

    /**
     * Bulk suspend (soft-delete) selected users.
     */
    public function bulkSuspend(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        // Exclude the current admin from being suspended
        $userIds = collect($validated['user_ids'])
            ->reject(fn ($id) => $id === $request->user()->id)
            ->values()
            ->all();

        $count = User::whereIn('id', $userIds)
            ->whereNull('deleted_at')
            ->count();

        User::whereIn('id', $userIds)->each(fn (User $user) => $user->delete());

        return back()->with('success', "{$count} user(s) suspended.");
    }

    /**
     * Export selected users as CSV.
     */
    public function bulkExport(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer'],
        ]);

        $users = User::withTrashed()
            ->whereIn('id', $validated['user_ids'])
            ->get(['id', 'name', 'email', 'is_superadmin', 'email_verified_at', 'created_at', 'deleted_at']);

        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Email', 'Superadmin', 'Email Verified', 'Created At', 'Deleted At']);

            foreach ($users as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->is_superadmin ? 'Yes' : 'No',
                    $user->email_verified_at?->toDateTimeString() ?? 'Not verified',
                    $user->created_at->toDateTimeString(),
                    $user->deleted_at?->toDateTimeString() ?? '',
                ]);
            }

            fclose($handle);
        }, 'users-export-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
