<?php

use App\Http\Middleware\RequestId;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;

it('adds an X-Request-Id header to the response when none is provided', function () {
    $middleware = new RequestId;
    $request = Request::create('/test');

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->headers->get('X-Request-Id'))->not->toBeEmpty();
    expect($request->attributes->get('request_id'))
        ->toBe($response->headers->get('X-Request-Id'));
});

it('echoes an inbound X-Request-Id back unchanged', function () {
    $middleware = new RequestId;
    $request = Request::create('/test');
    $request->headers->set('X-Request-Id', 'inbound-request-id');

    $response = $middleware->handle($request, fn () => response('ok'));

    expect($response->headers->get('X-Request-Id'))->toBe('inbound-request-id');
    expect($request->attributes->get('request_id'))->toBe('inbound-request-id');
});

it('pushes the request id into the context', function () {
    $middleware = new RequestId;
    $request = Request::create('/test');
    $request->headers->set('X-Request-Id', 'inbound-request-id');

    $middleware->handle($request, fn () => response('ok'));

    expect(Context::get('request_id'))->toBe('inbound-request-id');
});
