<?php

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Notifications API', function () {
    it('requires authentication for api and page', function () {
        $this->getJson('/api/notifications')
            ->assertUnauthorized();
            
        $this->get('/notifications')
            ->assertRedirect('/login');
    });

    it('returns the full notifications page via Inertia', function () {
        $this->actingAs($this->user)
            ->get('/notifications')
            ->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('notifications/index')
                ->has('notifications')
            );
    });

    it('returns unread notifications and count', function () {
        // Create 2 mock notifications for the user
        $this->user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\MockNotification',
            'data' => ['title' => 'Test', 'message' => 'Hello'],
            'read_at' => null,
        ]);
        
        $this->user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\MockNotification',
            'data' => ['title' => 'Test 2', 'message' => 'Hello 2'],
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'notifications')
            ->assertJsonPath('unread_count', 2);
    });

    it('marks a single notification as read', function () {
        $notification = $this->user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\MockNotification',
            'data' => ['title' => 'Test', 'message' => 'Hello'],
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->patchJson('/api/notifications/' . $notification->id . '/read')
            ->assertOk()
            ->assertJsonPath('success', true);

        expect($notification->fresh()->read_at)->not->toBeNull();
    });

    it('marks all notifications as read', function () {
        $this->user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\MockNotification',
            'data' => ['title' => 'Test', 'message' => 'Hello'],
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/notifications/mark-all-read')
            ->assertOk()
            ->assertJsonPath('success', true);

        expect($this->user->unreadNotifications()->count())->toBe(0);
    });

    it('cannot mark another users notification as read', function () {
        $otherUser = User::factory()->create();
        $notification = $otherUser->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\MockNotification',
            'data' => ['title' => 'Test', 'message' => 'Hello'],
            'read_at' => null,
        ]);

        $this->actingAs($this->user)
            ->patchJson('/api/notifications/' . $notification->id . '/read')
            ->assertNotFound();

        expect($notification->fresh()->read_at)->toBeNull();
    });
});
