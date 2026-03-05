<?php

use App\Http\Requests\WorkspaceRequest;
use App\Models\Workspace;
use Illuminate\Support\Facades\Validator;

it('is always authorized', function () {
    $request = new WorkspaceRequest;

    expect($request->authorize())->toBeTrue();
});

it('has the correct validation rules', function () {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['name', 'slug', 'logo', 'accent_color']);
});

it('passes validation with valid workspace data', function () {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'name' => 'My Workspace',
        'slug' => 'my-workspace',
        'accent_color' => '#FF5733',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
});

it('fails validation when name is missing', function () {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'slug' => 'my-workspace',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('name'))->toBeTrue();
});

it('fails validation with non-alpha-dash slug', function () {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'name' => 'My Workspace',
        'slug' => 'my workspace with spaces',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('slug'))->toBeTrue();
});

it('fails validation with duplicate slug', function () {
    Workspace::factory()->create(['slug' => 'taken-slug']);

    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'name' => 'My Workspace',
        'slug' => 'taken-slug',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('slug'))->toBeTrue();
});

it('fails validation with invalid hex color', function () {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'name' => 'My Workspace',
        'accent_color' => 'not-a-color',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('accent_color'))->toBeTrue();
});

it('accepts valid hex colors', function (string $color) {
    $request = new WorkspaceRequest;
    $request->setUserResolver(fn () => null);

    $validator = Validator::make([
        'name' => 'My Workspace',
        'accent_color' => $color,
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
})->with(['#000000', '#FFFFFF', '#ff5733', '#A1B2C3']);

it('has custom error messages', function () {
    $request = new WorkspaceRequest;

    expect($request->messages())
        ->toHaveKeys(['name.required', 'slug.unique', 'slug.alpha_dash', 'logo.image', 'logo.max']);
});
