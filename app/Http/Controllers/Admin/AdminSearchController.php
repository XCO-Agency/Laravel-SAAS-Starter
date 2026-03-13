<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Cashier\Subscription;

class AdminSearchController extends Controller
{
    /**
     * Perform a global admin search across users, workspaces, and subscriptions.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->string('q'));

        if (strlen($q) < 2) {
            return response()->json(['users' => [], 'workspaces' => [], 'subscriptions' => []]);
        }

        $users = User::query()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'url' => "/admin/users/{$u->id}",
            ]);

        $workspaces = Workspace::query()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'slug'])
            ->map(fn (Workspace $w) => [
                'id' => $w->id,
                'name' => $w->name,
                'slug' => $w->slug,
                'url' => "/admin/workspaces/{$w->id}",
            ]);

        $subscriptions = Subscription::query()
            ->with('owner:id,name')
            ->where(function ($query) use ($q) {
                $query->where('stripe_status', 'like', "%{$q}%")
                    ->orWhere('stripe_price', 'like', "%{$q}%")
                    ->orWhereHas('owner', fn ($sub) => $sub->where('name', 'like', "%{$q}%"));
            })
            ->limit(5)
            ->get(['id', 'billable_id', 'billable_type', 'stripe_status', 'stripe_price'])
            ->map(fn (Subscription $s) => [
                'id' => $s->id,
                'workspace_name' => $s->owner?->name ?? 'Unknown',
                'stripe_status' => $s->stripe_status,
                'stripe_price' => $s->stripe_price,
                'url' => '/admin/revenue-analytics',
            ]);

        return response()->json([
            'users' => $users,
            'workspaces' => $workspaces,
            'subscriptions' => $subscriptions,
        ]);
    }
}
