<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $locale = $user->locale ?? config('app.locale');
        } else {
            \Illuminate\Support\Facades\Log::info('SetLocale: Session started? '.(Session::isStarted() ? 'Yes' : 'No'));
            \Illuminate\Support\Facades\Log::info('SetLocale: Session data: '.json_encode(Session::all()));
            $locale = Session::get('locale', config('app.locale'));
        }

        if (! in_array($locale, ['en', 'es', 'fr', 'ar'])) {
            $locale = config('app.locale');
        }

        App::setLocale($locale);

        return $next($request);
    }
}
