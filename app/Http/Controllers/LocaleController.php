<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\UpdateLocaleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class LocaleController extends Controller
{
    /**
     * Update the user's locale preference.
     */
    public function update(UpdateLocaleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $locale = $validated['locale'];

        // Update session
        Session::put('locale', $locale);
        Session::save(); // Force save to ensure persistence before redirect
        App::setLocale($locale);

        // Update user preference if authenticated
        if ($request->user()) {
            $request->user()->update([
                'locale' => $locale,
            ]);
        }

        return back();
    }
}
