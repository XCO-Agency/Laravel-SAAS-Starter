<?php

use App\Listeners\LogNotificationDelivery;
use App\Models\NotificationDeliveryLog;
use App\Models\User;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Notifications\Notification;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('displays notification analytics page for superadmins', function () {
    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/notification-analytics')
            ->has('metrics')
            ->has('dailyDeliveries')
            ->has('byType')
            ->has('byCategory')
            ->has('channelSplit')
        );
});

it('prevents non-admin access', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/notification-analytics')
        ->assertForbidden();
});

it('shows correct delivery counts by channel', function () {
    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'TestNotification',
        'channel' => 'email',
        'category' => 'security',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'TestNotification',
        'channel' => 'email',
        'category' => 'security',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'TestNotification',
        'channel' => 'in_app',
        'category' => 'team',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.total', 3)
            ->where('metrics.email', 2)
            ->where('metrics.in_app', 1)
        );
});

it('shows deliveries grouped by type', function () {
    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'DataExportCompleted',
        'channel' => 'email',
        'category' => 'security',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'DataExportCompleted',
        'channel' => 'in_app',
        'category' => 'security',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('byType', 1)
            ->where('byType.0.type', 'DataExportCompleted')
            ->where('byType.0.email', 1)
            ->where('byType.0.in_app', 1)
            ->where('byType.0.total', 2)
        );
});

it('calculates correct channel split percentages', function () {
    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'Test',
        'channel' => 'email',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'Test',
        'channel' => 'email',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'Test',
        'channel' => 'email',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'Test',
        'channel' => 'in_app',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('channelSplit.email', 75)
            ->where('channelSplit.in_app', 25)
        );
});

it('shows deliveries grouped by category', function () {
    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'DataExportCompleted',
        'channel' => 'email',
        'category' => 'security',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'TeamInvitationNotification',
        'channel' => 'email',
        'category' => 'team',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('byCategory', 2)
        );
});

it('listener logs notification delivery from NotificationSent event', function () {
    $user = User::factory()->create();

    $notification = new class extends Notification
    {
        public function via(): array
        {
            return ['mail'];
        }
    };

    $event = new NotificationSent($user, $notification, 'mail');

    $listener = new LogNotificationDelivery;
    $listener->handle($event);

    expect(NotificationDeliveryLog::count())->toBe(1);

    $log = NotificationDeliveryLog::first();
    expect($log->user_id)->toBe($user->id)
        ->and($log->channel)->toBe('email')
        ->and($log->is_successful)->toBeTrue();
});

it('listener normalizes database channel to in_app', function () {
    $user = User::factory()->create();

    $notification = new class extends Notification
    {
        public function via(): array
        {
            return ['database'];
        }
    };

    $event = new NotificationSent($user, $notification, 'database');

    $listener = new LogNotificationDelivery;
    $listener->handle($event);

    $log = NotificationDeliveryLog::first();
    expect($log->channel)->toBe('in_app');
});

it('excludes old deliveries from metrics', function () {
    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'OldNotification',
        'channel' => 'email',
        'is_successful' => true,
        'delivered_at' => now()->subDays(45),
    ]);

    NotificationDeliveryLog::create([
        'user_id' => $this->admin->id,
        'notification_type' => 'RecentNotification',
        'channel' => 'email',
        'is_successful' => true,
        'delivered_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get('/admin/notification-analytics')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.total', 1)
            ->where('metrics.email', 1)
        );
});
