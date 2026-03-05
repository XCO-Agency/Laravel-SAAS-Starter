<?php

use App\Http\Middleware\SetLocale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

it('sets locale from authenticated user preference', function () {
    $user = User::factory()->withoutTwoFactor()->create(['locale' => 'fr']);

    $middleware = new SetLocale;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware->handle($request, function () {
        return response('ok');
    });

    expect(App::getLocale())->toBe('fr');
});

it('falls back to config locale for guest without session locale', function () {
    $middleware = new SetLocale;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => null);

    $middleware->handle($request, function () {
        return response('ok');
    });

    expect(App::getLocale())->toBe(config('app.locale'));
});

it('uses session locale for guests', function () {
    Session::put('locale', 'es');

    $middleware = new SetLocale;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => null);

    $middleware->handle($request, function () {
        return response('ok');
    });

    expect(App::getLocale())->toBe('es');
});

it('falls back to config locale for invalid locale', function () {
    $user = User::factory()->withoutTwoFactor()->create(['locale' => 'xx']);

    $middleware = new SetLocale;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware->handle($request, function () {
        return response('ok');
    });

    expect(App::getLocale())->toBe(config('app.locale'));
});

it('accepts all supported locales', function (string $locale) {
    $user = User::factory()->withoutTwoFactor()->create(['locale' => $locale]);

    $middleware = new SetLocale;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware->handle($request, function () {
        return response('ok');
    });

    expect(App::getLocale())->toBe($locale);
})->with(['en', 'es', 'fr', 'ar']);
