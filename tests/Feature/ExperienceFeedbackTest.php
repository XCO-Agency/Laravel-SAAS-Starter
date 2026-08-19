<?php

use App\Models\Feedback;
use App\Models\User;
use App\Models\Workspace;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->workspace = Workspace::factory()->create();
    $this->workspace->users()->attach($this->user, ['role' => 'owner']);
    $this->user->update(['current_workspace_id' => $this->workspace->id]);
});

it('stores an experience feedback response with a rating and stamps the flag', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback', [
            'rating' => 4,
            'message' => 'Loving the product so far.',
        ])
        ->assertRedirect();

    $feedback = Feedback::where('user_id', $this->user->id)->first();

    expect($feedback)->not->toBeNull()
        ->and($feedback->type)->toBe('experience')
        ->and($feedback->workspace_id)->toBe($this->workspace->id)
        ->and($feedback->message)->toBe('Loving the product so far.')
        ->and($feedback->metadata['rating'])->toBe(4);

    expect($this->user->fresh()->experience_feedback_at)->not->toBeNull();
});

it('stores an experience response without an optional message', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback', ['rating' => 5])
        ->assertRedirect();

    $feedback = Feedback::where('user_id', $this->user->id)->first();

    expect($feedback->metadata['rating'])->toBe(5)
        ->and($feedback->message)->toBeNull();
});

it('dismisses the survey without creating a feedback row', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback/dismiss')
        ->assertRedirect();

    expect(Feedback::where('user_id', $this->user->id)->exists())->toBeFalse()
        ->and($this->user->fresh()->experience_feedback_at)->not->toBeNull();
});

it('rejects experience feedback from unauthenticated visitors', function () {
    $this->postJson('/experience-feedback', ['rating' => 3])->assertUnauthorized();
    $this->postJson('/experience-feedback/dismiss')->assertUnauthorized();
});

it('validates the rating is present and within range', function (mixed $rating) {
    actingAs($this->user)
        ->postJson('/experience-feedback', ['rating' => $rating])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['rating']);
})->with([
    'missing' => [null],
    'too low' => [0],
    'too high' => [6],
    'not an integer' => ['great'],
]);

it('rejects a message that exceeds the maximum length', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback', [
            'rating' => 3,
            'message' => str_repeat('a', 2001),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

it('rejects a second submission once the survey has been answered', function () {
    $this->user->update(['experience_feedback_at' => now()]);

    actingAs($this->user)
        ->postJson('/experience-feedback', ['rating' => 2])
        ->assertForbidden();

    expect(Feedback::where('user_id', $this->user->id)->count())->toBe(0);
});

it('rejects a dismiss once the survey has already been answered', function () {
    $answeredAt = now()->subDay();
    $this->user->update(['experience_feedback_at' => $answeredAt]);

    actingAs($this->user)
        ->postJson('/experience-feedback/dismiss')
        ->assertForbidden();

    expect($this->user->fresh()->experience_feedback_at->timestamp)->toBe($answeredAt->timestamp);
});

it('stores a valid http referer as the page url', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback', ['rating' => 4], ['Referer' => 'https://app.test/dashboard'])
        ->assertRedirect();

    expect(Feedback::where('user_id', $this->user->id)->value('page_url'))
        ->toBe('https://app.test/dashboard');
});

it('does not store a non-http referer as the page url', function () {
    actingAs($this->user)
        ->postJson('/experience-feedback', ['rating' => 4], ['Referer' => 'javascript:alert(document.cookie)'])
        ->assertRedirect();

    expect(Feedback::where('user_id', $this->user->id)->value('page_url'))->toBeNull();
});
