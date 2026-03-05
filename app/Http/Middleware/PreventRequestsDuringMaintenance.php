<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;
use Illuminate\Support\Facades\Cache;

class PreventRequestsDuringMaintenance extends Middleware
{
    /**
     * Get the URIs that should be reachable while maintenance mode is enabled.
     *
     * @return array<int, string>
     */
    public function getExcludedPaths(): array
    {
        return [
            //
        ];
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return mixed
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function handle($request, Closure $next)
    {
        if ($this->app->isDownForMaintenance()) {

            $config = Cache::get('maintenance_mode', []);
            $allowedIps = $config['allowed_ips'] ?? [];

            if (! empty($allowedIps) && in_array($request->ip(), $allowedIps)) {
                return $next($request);
            }
        }

        return parent::handle($request, $next);
    }
}
