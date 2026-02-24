<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use App\Models\Workspace;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'total_users' => User::count(),
                'total_workspaces' => Workspace::count(),
            ],
        ]);
    }
}
