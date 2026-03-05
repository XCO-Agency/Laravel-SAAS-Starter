<?php

use App\Http\Requests\StoreFeedbackRequest;
use Illuminate\Support\Facades\Validator;

it('is always authorized', function () {
    $request = new StoreFeedbackRequest;

    expect($request->authorize())->toBeTrue();
});

it('has validation rules for type and message', function () {
    $request = new StoreFeedbackRequest;
    $rules = $request->rules();

    expect($rules)->toHaveKeys(['type', 'message'])
        ->and($rules['type'])->toContain('in:bug,idea,general')
        ->and($rules['message'])->toContain('min:10')
        ->and($rules['message'])->toContain('max:2000');
});

it('passes validation with valid feedback', function () {
    $request = new StoreFeedbackRequest;

    $validator = Validator::make([
        'type' => 'bug',
        'message' => 'This is a valid feedback message with enough characters.',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
});

it('fails validation with invalid type', function () {
    $request = new StoreFeedbackRequest;

    $validator = Validator::make([
        'type' => 'complaint',
        'message' => 'This is a valid feedback message.',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('type'))->toBeTrue();
});

it('fails validation when message is too short', function () {
    $request = new StoreFeedbackRequest;

    $validator = Validator::make([
        'type' => 'bug',
        'message' => 'Short',
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('message'))->toBeTrue();
});

it('fails validation when message is too long', function () {
    $request = new StoreFeedbackRequest;

    $validator = Validator::make([
        'type' => 'idea',
        'message' => str_repeat('x', 2001),
    ], $request->rules());

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('message'))->toBeTrue();
});

it('has custom error messages', function () {
    $request = new StoreFeedbackRequest;
    $messages = $request->messages();

    expect($messages)
        ->toHaveKeys(['type.in', 'message.min', 'message.max']);
});

it('accepts all valid feedback types', function (string $type) {
    $request = new StoreFeedbackRequest;

    $validator = Validator::make([
        'type' => $type,
        'message' => 'This is a valid feedback message.',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
})->with(['bug', 'idea', 'general']);
