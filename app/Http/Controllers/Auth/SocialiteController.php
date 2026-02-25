<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ConnectedAccount;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider.
     */
    public function callback(string $provider)
    {
        try {
            /** @var \Laravel\Socialite\Two\User $socialUser */
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('flash', [
                'error' => 'Authentication failed. Please try again.',
            ]);
        }

        // Find existing connected account
        $account = ConnectedAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($account) {
            // Update token
            $account->update([
                'token' => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken ?? null,
                'expires_at' => property_exists($socialUser, 'expiresIn') && $socialUser->expiresIn
                    ? now()->addSeconds($socialUser->expiresIn)
                    : null,
            ]);

            Auth::login($account->user);

            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Check if a user with this email already exists
        $user = User::where('email', $socialUser->getEmail())->first();

        if (! $user) {
            DB::beginTransaction();

            try {
                // Create a new user
                $name = tap($socialUser->getName() ?: $socialUser->getNickname(), function ($name) {
                    return empty($name) ? 'New User' : $name;
                });

                $user = User::create([
                    'name' => $name,
                    'email' => $socialUser->getEmail(),
                    'password' => bcrypt(Str::random(16)),
                ]);

                $user->markEmailAsVerified();

                // Workspace creation is natively deferred to the Onboarding Wizard

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();

                return redirect()->route('login')->with('flash', [
                    'error' => 'Could not create your user account.',
                ]);
            }
        }

        // Attach the connected account
        $user->connectedAccounts()->create([
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'name' => $socialUser->getName(),
            'nickname' => $socialUser->getNickname(),
            'email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken ?? null,
            'expires_at' => property_exists($socialUser, 'expiresIn') && $socialUser->expiresIn
                ? now()->addSeconds($socialUser->expiresIn)
                : null,
        ]);

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
