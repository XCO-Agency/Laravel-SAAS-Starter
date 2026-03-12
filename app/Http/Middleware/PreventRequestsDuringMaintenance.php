<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException;

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
     * @param  Request  $request
     * @return mixed
     *
     * @throws HttpException
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
