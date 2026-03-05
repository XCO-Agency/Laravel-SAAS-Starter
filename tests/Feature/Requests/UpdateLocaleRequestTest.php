<?php

use App\Http\Requests\Settings\UpdateLocaleRequest;
use Illuminate\Support\Facades\Validator;

it('is always authorized', function () {
    $request = new UpdateLocaleRequest;

    expect($request->authorize())->toBeTrue();
});

it('requires locale field', function () {
    $request = new UpdateLocaleRequest;

    $validator = Validator::make([], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('locale'))->toBeTrue();
});

it('accepts valid locales', function (string $locale) {
    $request = new UpdateLocaleRequest;

    $validator = Validator::make(['locale' => $locale], $request->rules());

    expect($validator->passes())->toBeTrue();
})->with(['en', 'fr', 'es', 'ar']);

it('rejects invalid locales', function () {
    $request = new UpdateLocaleRequest;

    $validator = Validator::make(['locale' => 'de'], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('locale'))->toBeTrue();
});
