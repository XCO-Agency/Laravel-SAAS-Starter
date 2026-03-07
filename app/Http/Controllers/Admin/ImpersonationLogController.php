<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImpersonationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImpersonationLogController extends Controller
{
    /**
     * Display a paginated impersonation audit log.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        $logs = ImpersonationLog::query()
            ->with(['impersonator', 'impersonated'])
            ->when($search, function ($query, $search) {
                $query->whereHas('impersonator', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('impersonated', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest('started_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/impersonation-logs', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
