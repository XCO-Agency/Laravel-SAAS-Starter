<?php

use Illuminate\Support\Facades\DB;

use function Pest\Laravel\getJson;

it('reports ok with a reachable database', function () {
    $response = getJson('/api/health');

    $response->assertOk()
        ->assertJson([
            'status' => 'ok',
            'database' => true,
        ])
        ->assertJsonStructure([
            'status',
            'database',
            'timestamp',
        ]);

    expect($response->json('timestamp'))->toBeString();
    expect(fn () => new DateTimeImmutable($response->json('timestamp')))->not->toThrow(Exception::class);
});

it('still responds 200 with database false when the database is unreachable', function () {
    DB::shouldReceive('connection')->andThrow(new PDOException('could not connect'));

    $response = getJson('/api/health');

    $response->assertOk()
        ->assertJson([
            'status' => 'ok',
            'database' => false,
        ]);
});
