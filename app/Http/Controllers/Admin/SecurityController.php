<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * Show the 2FA enforcement wall for super-admins.
     */
    public function twoFactorRequired(Request $request): Response
    {
        return Inertia::render('admin/2fa-required');
    }
}
