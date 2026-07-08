<?php

it('prints the application name and version from config', function () {
    config([
        'app.name' => 'Acme SaaS',
        'app.version' => '2.3.4',
    ]);

    $this->artisan('app:version')
        ->expectsOutputToContain('Acme SaaS')
        ->expectsOutputToContain('2.3.4')
        ->assertSuccessful();
});
