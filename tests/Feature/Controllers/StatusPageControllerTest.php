<?php

use App\Models\StatusIncident;

beforeEach(function () {
    StatusIncident::query()->delete();
});

it('renders public status page without authentication', function () {
    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('status'));
});

it('shows incidents from last 90 days only', function () {
    StatusIncident::factory()->create([
        'title' => 'Recent Incident',
        'created_at' => now()->subDays(30),
    ]);

    StatusIncident::factory()->create([
        'title' => 'Old Incident',
        'created_at' => now()->subDays(100),
    ]);

    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('status')
        ->has('incidents', 1)
        ->where('incidents.0.title', 'Recent Incident')
    );
});

it('reflects outage as the most severe overall status', function () {
    StatusIncident::factory()->create(['status' => StatusIncident::STATUS_DEGRADED, 'resolved_at' => null]);
    StatusIncident::factory()->create(['status' => StatusIncident::STATUS_OUTAGE, 'resolved_at' => null]);

    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->where('overallStatus', StatusIncident::STATUS_OUTAGE)
    );
});

it('reflects degraded status when no outage exists', function () {
    StatusIncident::factory()->create(['status' => StatusIncident::STATUS_DEGRADED, 'resolved_at' => null]);
    StatusIncident::factory()->create(['status' => StatusIncident::STATUS_MAINTENANCE, 'resolved_at' => null]);

    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->where('overallStatus', StatusIncident::STATUS_DEGRADED)
    );
});

it('shows operational status when all incidents are resolved', function () {
    StatusIncident::factory()->create([
        'status' => StatusIncident::STATUS_OUTAGE,
        'resolved_at' => now()->subHour(),
    ]);

    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->where('overallStatus', 'operational')
    );
});

it('shows operational status when there are no incidents', function () {
    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->where('overallStatus', 'operational')
        ->has('incidents', 0)
    );
});

it('includes resolved_at for resolved incidents', function () {
    $resolvedAt = now()->subHours(3);

    StatusIncident::factory()->create([
        'status' => StatusIncident::STATUS_OPERATIONAL,
        'resolved_at' => $resolvedAt,
    ]);

    $response = $this->get(route('status'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->has('incidents', 1)
        ->whereNot('incidents.0.resolved_at', null)
    );
});
