<?php

use App\Http\Middleware\EnsureSuperadmin;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('aborts when user is not authenticated', function () {
    $middleware = new EnsureSuperadmin;
    $request = Request::create('/test');

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('aborts when user is not a superadmin', function () {
    $user = User::factory()->withoutTwoFactor()->create(['is_superadmin' => false]);

    $middleware = new EnsureSuperadmin;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware->handle($request, fn () => response('ok'));
})->throws(HttpException::class);

it('allows superadmin users', function () {
    $admin = User::factory()->withoutTwoFactor()->create(['is_superadmin' => true]);

    $middleware = new EnsureSuperadmin;
    $request = Request::create('/test');
    $request->setUserResolver(fn () => $admin);

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->getContent())->toBe('ok');
});
