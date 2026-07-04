<?php

it('adds an X-Request-Id header to web responses', function () {
    $response = $this->get('/');

    $response->assertHeader('X-Request-Id');
    expect($response->headers->get('X-Request-Id'))->not->toBeEmpty();
});

it('honors an inbound X-Request-Id header and echoes it back unchanged', function () {
    $response = $this->get('/', ['X-Request-Id' => 'test-correlation-123']);

    $response->assertHeader('X-Request-Id', 'test-correlation-123');
});

it('generates a valid UUID when no X-Request-Id is supplied', function () {
    $response = $this->get('/');

    expect($response->headers->get('X-Request-Id'))
        ->toMatch('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/');
});

it('adds an X-Request-Id header to api responses even on a 401', function () {
    $response = $this->getJson('/api/user');

    $response->assertUnauthorized();
    $response->assertHeader('X-Request-Id');
    expect($response->headers->get('X-Request-Id'))->not->toBeEmpty();
});
