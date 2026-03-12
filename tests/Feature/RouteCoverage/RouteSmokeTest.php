<?php

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Route;

function staticApplicationRoutes(?string $method = null): array
{
    $routes = collect(Route::getRoutes()->getRoutes())
        ->filter(function ($route) use ($method) {
            $methods = $route->methods();
            $action = $route->getActionName();
            $uri = $route->uri();

            if ($method && ! in_array($method, $methods, true)) {
                return false;
            }

            if (str_contains($uri, '{')) {
                return false;
            }

            if (str_starts_with($uri, '_debugbar') || str_starts_with($uri, '_ignition')) {
                return false;
            }

            // Exclude Scribe documentation routes (require generated files not present in CI)
            // and Stripe webhook (requires external Stripe signature verification)
            if (str_starts_with($uri, 'docs') || $uri === '/stripe/webhook') {
                return false;
            }

            if (! str_starts_with($action, 'App\\') && $action !== 'Closure') {
                return false;
            }

            return true;
        })
        ->map(fn ($route) => [
            'uri' => '/'.ltrim($route->uri(), '/'),
            'methods' => $route->methods(),
            'name' => $route->getName() ?? '',
        ])
        ->unique(fn ($route) => $route['uri'].'|'.implode(',', $route['methods']))
        ->values()
        ->all();

    return $routes;
}

it('all static get routes avoid server errors for guests', function () {
    $routes = staticApplicationRoutes('GET');

    $failing = [];

    foreach ($routes as $route) {
        $response = $this->get($route['uri']);

        if ($response->getStatusCode() >= 500) {
            $failing[] = $route['uri'];
        }
    }

    expect($failing)->toBe([]);
});

it('all static get routes avoid server errors for authenticated users', function () {
    $user = User::factory()->create(['onboarded_at' => now()]);
    $workspace = Workspace::factory()->create([
        'owner_id' => $user->id,
        'personal_workspace' => true,
    ]);
    $workspace->addUser($user, 'owner');
    $user->switchWorkspace($workspace);

    $routes = staticApplicationRoutes('GET');

    $failing = [];

    foreach ($routes as $route) {
        $response = $this->actingAs($user)->get($route['uri']);

        if ($response->getStatusCode() >= 500) {
            $failing[] = $route['uri'];
        }
    }

    expect($failing)->toBe([]);
});

it('all static mutation routes avoid server errors for guests', function () {
    $routes = staticApplicationRoutes()
        ? collect(staticApplicationRoutes())->filter(function ($route) {
            return collect($route['methods'])
                ->contains(fn ($method) => in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true));
        })->values()->all()
        : [];

    $failing = [];

    foreach ($routes as $route) {
        foreach ($route['methods'] as $method) {
            if (! in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
                continue;
            }

            $response = match ($method) {
                'POST' => $this->post($route['uri']),
                'PUT' => $this->put($route['uri']),
                'PATCH' => $this->patch($route['uri']),
                'DELETE' => $this->delete($route['uri']),
            };

            if ($response->getStatusCode() >= 500) {
                $failing[] = $method.' '.$route['uri'];
            }
        }
    }

    expect($failing)->toBe([]);
});
