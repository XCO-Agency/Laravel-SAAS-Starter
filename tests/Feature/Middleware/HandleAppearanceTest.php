<?php

use App\Http\Middleware\HandleAppearance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

it('shares system as default appearance when no cookie present', function () {
    $request = Request::create('/test');

    $middleware = new HandleAppearance;
    $middleware->handle($request, fn () => response('OK'));

    $shared = View::getShared();
    expect($shared['appearance'])->toBe('system');
});

it('shares appearance value from cookie', function () {
    $request = Request::create('/test');
    $request->cookies->set('appearance', 'dark');

    $middleware = new HandleAppearance;
    $middleware->handle($request, fn () => response('OK'));

    $shared = View::getShared();
    expect($shared['appearance'])->toBe('dark');
});

it('shares light appearance value from cookie', function () {
    $request = Request::create('/test');
    $request->cookies->set('appearance', 'light');

    $middleware = new HandleAppearance;
    $middleware->handle($request, fn () => response('OK'));

    $shared = View::getShared();
    expect($shared['appearance'])->toBe('light');
});
