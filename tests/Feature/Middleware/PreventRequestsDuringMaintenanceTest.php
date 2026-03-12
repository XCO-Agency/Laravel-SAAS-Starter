<?php

use App\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

it('allows requests when not in maintenance mode', function () {
    $middleware = app(PreventRequestsDuringMaintenance::class);

    $request = Request::create('/test');

    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(200);
});

it('allows whitelisted IPs during maintenance mode', function () {
    // Put app in maintenance mode
    $this->app->instance('app.isDownForMaintenance', true);

    Cache::put('maintenance_mode', [
        'allowed_ips' => ['127.0.0.1'],
    ]);

    $middleware = app(PreventRequestsDuringMaintenance::class);
    $request = Request::create('/test', 'GET', [], [], [], ['REMOTE_ADDR' => '127.0.0.1']);

    // When app is not actually down, the parent middleware won't block
    $response = $middleware->handle($request, fn () => response('OK'));

    expect($response->getStatusCode())->toBe(200);

    Cache::forget('maintenance_mode');
});
