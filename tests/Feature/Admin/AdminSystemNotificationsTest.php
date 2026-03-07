<?php

use App\Models\AdminNotification;
use App\Models\User;
use App\Services\AdminNotificationService;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('displays system notifications page for superadmins', function () {
    AdminNotification::factory()->count(3)->create();
    AdminNotification::factory()->read()->create();

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/system-notifications')
            ->has('notifications')
            ->has('notifications.data', 4)
            ->has('filters')
            ->has('summary')
            ->where('summary.total', 4)
            ->where('summary.unread', 3)
            ->has('types')
            ->has('severities')
        );
});

it('prevents non-admin access', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/system-notifications')
        ->assertForbidden();
});

it('filters notifications by type', function () {
    AdminNotification::factory()->create(['type' => AdminNotification::TYPE_WEBHOOK_FAILURE]);
    AdminNotification::factory()->create(['type' => AdminNotification::TYPE_NEW_SIGNUP]);
    AdminNotification::factory()->create(['type' => AdminNotification::TYPE_SYSTEM_ERROR]);

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications?type=webhook_failure')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.type', 'webhook_failure')
            ->where('filters.type', 'webhook_failure')
        );
});

it('filters notifications by severity', function () {
    AdminNotification::factory()->create(['severity' => AdminNotification::SEVERITY_INFO]);
    AdminNotification::factory()->create(['severity' => AdminNotification::SEVERITY_WARNING]);
    AdminNotification::factory()->critical()->create();

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications?severity=critical')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.severity', 'critical')
            ->where('filters.severity', 'critical')
        );
});

it('filters notifications by read status', function () {
    AdminNotification::factory()->count(2)->create();
    AdminNotification::factory()->read()->count(3)->create();

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications?status=unread')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 2)
        );

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications?status=read')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 3)
        );
});

it('marks a single notification as read', function () {
    $notification = AdminNotification::factory()->create();

    expect($notification->read_at)->toBeNull();

    $this->actingAs($this->admin)
        ->patch("/admin/system-notifications/{$notification->id}/read")
        ->assertRedirect();

    $notification->refresh();
    expect($notification->read_at)->not->toBeNull();
});

it('marks all notifications as read', function () {
    AdminNotification::factory()->count(5)->create();

    expect(AdminNotification::whereNull('read_at')->count())->toBe(5);

    $this->actingAs($this->admin)
        ->patch('/admin/system-notifications/read-all')
        ->assertRedirect();

    expect(AdminNotification::whereNull('read_at')->count())->toBe(0);
});

it('deletes a notification', function () {
    $notification = AdminNotification::factory()->create();

    $this->actingAs($this->admin)
        ->delete("/admin/system-notifications/{$notification->id}")
        ->assertRedirect();

    expect(AdminNotification::find($notification->id))->toBeNull();
});

it('shows correct summary counts', function () {
    AdminNotification::factory()->count(2)->create(['severity' => AdminNotification::SEVERITY_CRITICAL]);
    AdminNotification::factory()->count(3)->create(['severity' => AdminNotification::SEVERITY_WARNING]);
    AdminNotification::factory()->create(['severity' => AdminNotification::SEVERITY_INFO]);
    AdminNotification::factory()->read()->create(['severity' => AdminNotification::SEVERITY_CRITICAL]);

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total', 7)
            ->where('summary.unread', 6)
            ->where('summary.critical', 2)
            ->where('summary.warning', 3)
        );
});

it('paginates notifications', function () {
    AdminNotification::factory()->count(25)->create();

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 20)
            ->where('notifications.last_page', 2)
            ->where('notifications.total', 25)
        );
});

it('returns notifications in descending order', function () {
    $old = AdminNotification::factory()->create(['created_at' => now()->subDays(3)]);
    $recent = AdminNotification::factory()->create(['created_at' => now()]);

    $this->actingAs($this->admin)
        ->get('/admin/system-notifications')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 2)
            ->where('notifications.data.0.id', $recent->id)
            ->where('notifications.data.1.id', $old->id)
        );
});

// Service Tests
it('creates notifications via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->create(
        AdminNotification::TYPE_SYSTEM_ERROR,
        AdminNotification::SEVERITY_CRITICAL,
        'Test Error',
        'Something went wrong',
        ['key' => 'value'],
    );

    expect($notification)->toBeInstanceOf(AdminNotification::class)
        ->and($notification->type)->toBe('system_error')
        ->and($notification->severity)->toBe('critical')
        ->and($notification->title)->toBe('Test Error')
        ->and($notification->message)->toBe('Something went wrong')
        ->and($notification->metadata)->toBe(['key' => 'value'])
        ->and($notification->read_at)->toBeNull();
});

it('creates webhook failure notification via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->webhookFailed('https://example.com/webhook', 'Connection timeout');

    expect($notification->type)->toBe('webhook_failure')
        ->and($notification->severity)->toBe('warning')
        ->and($notification->title)->toBe('Webhook delivery failed')
        ->and($notification->metadata)->toHaveKeys(['url', 'error']);
});

it('creates subscription canceled notification via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->subscriptionCanceled('Acme Corp', 'Pro');

    expect($notification->type)->toBe('subscription_canceled')
        ->and($notification->severity)->toBe('warning')
        ->and($notification->metadata)->toHaveKeys(['workspace', 'plan']);
});

it('creates subscription past due notification via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->subscriptionPastDue('Acme Corp', 'Business');

    expect($notification->type)->toBe('subscription_past_due')
        ->and($notification->severity)->toBe('critical')
        ->and($notification->metadata)->toHaveKeys(['workspace', 'plan']);
});

it('creates system error notification via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->systemError('Queue failure', 'Redis connection lost', ['queue' => 'emails']);

    expect($notification->type)->toBe('system_error')
        ->and($notification->severity)->toBe('critical')
        ->and($notification->metadata)->toBe(['queue' => 'emails']);
});

it('creates new signup notification via the service', function () {
    $service = app(AdminNotificationService::class);
    $notification = $service->newSignup('Jane Doe', 'jane@example.com');

    expect($notification->type)->toBe('new_signup')
        ->and($notification->severity)->toBe('info')
        ->and($notification->metadata)->toHaveKeys(['name', 'email']);
});

it('prevents non-admin from marking notifications as read', function () {
    $user = User::factory()->create(['is_superadmin' => false]);
    $notification = AdminNotification::factory()->create();

    $this->actingAs($user)
        ->patch("/admin/system-notifications/{$notification->id}/read")
        ->assertForbidden();

    $notification->refresh();
    expect($notification->read_at)->toBeNull();
});

it('prevents non-admin from deleting notifications', function () {
    $user = User::factory()->create(['is_superadmin' => false]);
    $notification = AdminNotification::factory()->create();

    $this->actingAs($user)
        ->delete("/admin/system-notifications/{$notification->id}")
        ->assertForbidden();

    expect(AdminNotification::find($notification->id))->not->toBeNull();
});
