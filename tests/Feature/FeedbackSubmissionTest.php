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

it('allows an authenticated user to submit feedback', function () {
    actingAs($this->user)
        ->postJson('/feedback', [
            'type' => 'general',
            'message' => 'This is some general feedback from the app.',
        ])
        ->assertOk();

    expect(Feedback::where('user_id', $this->user->id)->exists())->toBeTrue();
});

it('rejects feedback from unauthenticated visitors', function () {
    $this->postJson('/feedback', [
        'type' => 'general',
        'message' => 'This is some general feedback from the app.',
    ])->assertUnauthorized();
});

it('rejects invalid feedback type', function () {
    actingAs($this->user)
        ->postJson('/feedback', [
            'type' => 'invalid_type',
            'message' => 'This is some general feedback from the app.',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

it('rejects empty feedback message', function () {
    actingAs($this->user)
        ->postJson('/feedback', [
            'type' => 'bug',
            'message' => '',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

it('rejects feedback message that is too short', function () {
    actingAs($this->user)
        ->postJson('/feedback', [
            'type' => 'bug',
            'message' => 'short',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

it('stores the page url and user agent automatically', function () {
    actingAs($this->user)
        ->postJson('/feedback', [
            'type' => 'idea',
            'message' => 'This feature idea would help my team be more productive.',
        ], ['Referer' => 'https://example.com/dashboard', 'User-Agent' => 'TestAgent/1.0']);

    $fb = Feedback::where('user_id', $this->user->id)->first();
    expect($fb->page_url)->toBe('https://example.com/dashboard')
        ->and($fb->user_agent)->toBe('TestAgent/1.0');
});
