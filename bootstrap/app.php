<?php

use App\Http\Middleware\AuthenticateApiKey;
use App\Http\Middleware\EnforceWorkspaceIpAllowlist;
use App\Http\Middleware\EnsurePasswordNotExpired;
use App\Http\Middleware\EnsureSuperadmin;
use App\Http\Middleware\EnsureUserIsOnboarded;
use App\Http\Middleware\EnsureWorkspaceAccess;
use App\Http\Middleware\EnsureWorkspaceAdmin;
use App\Http\Middleware\EnsureWorkspaceNotSuspended;
use App\Http\Middleware\EnsureWorkspaceOwner;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreventRequestsDuringMaintenance;
use App\Http\Middleware\RequireTwoFactor;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->replace(
            Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
            PreventRequestsDuringMaintenance::class
        );

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'stripe/*', // Exclude Stripe webhooks from CSRF
        ]);

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsurePasswordNotExpired::class,
        ]);

        $middleware->alias([
            'superadmin' => EnsureSuperadmin::class,
            'workspace' => EnsureWorkspaceAccess::class,
            'workspace.ip' => EnforceWorkspaceIpAllowlist::class,
            'workspace.owner' => EnsureWorkspaceOwner::class,
            'workspace.admin' => EnsureWorkspaceAdmin::class,
            'workspace.suspended' => EnsureWorkspaceNotSuspended::class,
            'onboarded' => EnsureUserIsOnboarded::class,
            'require2fa' => RequireTwoFactor::class,
            'api-key' => AuthenticateApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);
    })->create();
