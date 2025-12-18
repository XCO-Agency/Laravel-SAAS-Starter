<?php

it('renders the home page', function () {
    $response = $this->get('/');

    $response->assertSuccessful();
});
