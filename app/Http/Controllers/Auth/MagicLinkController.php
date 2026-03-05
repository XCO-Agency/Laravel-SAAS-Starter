<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MagicLinkNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MagicLinkController extends Controller
{
    /**
     * Show the magic link request form.
     */
    public function create(): Response
    {
        return Inertia::render('auth/magic-link');
    }

    /**
     * Generate and send the magic link email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            // We return a generic success message even if the email doesn't exist
            // to prevent email enumeration attacks (user enumeration).
            return back()->with('status', 'If an account with that email exists, we have sent a magic link.');
        }

        // Generate a cryptographically signed URL containing the user's ID
        // This URL natively expires in 15 minutes
        $url = URL::temporarySignedRoute(
            'magic-link.authenticate',
            now()->addMinutes(15),
            ['user' => $user->id]
        );

        $user->notify(new MagicLinkNotification($url));

        return back()->with('status', 'If an account with that email exists, we have sent a magic link.');
    }

    /**
     * Authenticate the user if the signature is valid.
     */
    public function authenticate(Request $request, User $user): RedirectResponse
    {
        // The `signed` middleware (on the route) will automatically throw a 403 
        // if the signature is invalid or expired. So if we hit here, it's safe.
        Auth::login($user);

        // Optional: Ensure session is regenerated to prevent fixation
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
