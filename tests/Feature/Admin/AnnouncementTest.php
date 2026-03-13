<?php

use App\Models\Announcement;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

it('redirects guests from admin announcements', function () {
    $this->get('/admin/announcements')
        ->assertRedirect('/login');
});

it('forbids non-superadmin access', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get('/admin/announcements')
        ->assertForbidden();
});

it('allows superadmin to view announcements', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/announcements')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/announcements')
            ->has('announcements')
        );
});

it('allows superadmin to create announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->post('/admin/announcements', [
            'title' => 'Maintenance Tonight',
            'body' => 'We will be performing maintenance from 2am-4am UTC.',
            'type' => 'warning',
            'is_active' => true,
            'is_dismissible' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('announcements', [
        'title' => 'Maintenance Tonight',
        'type' => 'warning',
        'is_active' => true,
    ]);
});

it('allows superadmin to toggle announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $announcement = Announcement::create([
        'title' => 'Test',
        'body' => 'Test body',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->post("/admin/announcements/{$announcement->id}/toggle")
        ->assertRedirect();

    expect($announcement->fresh()->is_active)->toBeFalse();
});

it('allows superadmin to delete announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);
    $announcement = Announcement::create([
        'title' => 'To Delete',
        'body' => 'Will be deleted',
        'type' => 'info',
        'is_active' => false,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->delete("/admin/announcements/{$announcement->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
});

it('validates required fields when creating announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->post('/admin/announcements', [
            'title' => '',
            'body' => '',
            'type' => 'invalid',
        ])
        ->assertSessionHasErrors(['title', 'body', 'type']);
});

it('includes filter prop in index response', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    $this->actingAs($admin)
        ->get('/admin/announcements?status=live')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('filter', 'live')
        );
});

it('returns computed status field for each announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Live Banner',
        'body' => 'Currently live',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('announcements.data.0.status')
        );
});

it('filters announcements by scheduled status', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Future Banner',
        'body' => 'Starts tomorrow',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
        'starts_at' => now()->addDay(),
    ]);

    Announcement::create([
        'title' => 'Live Now',
        'body' => 'Already active',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements?status=scheduled')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('announcements.data', 1)
            ->where('announcements.data.0.title', 'Future Banner')
        );
});

it('filters announcements by expired status', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Old Banner',
        'body' => 'Already ended',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
        'ends_at' => now()->subDay(),
    ]);

    Announcement::create([
        'title' => 'Active Banner',
        'body' => 'Still running',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements?status=expired')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('announcements.data', 1)
            ->where('announcements.data.0.title', 'Old Banner')
        );
});

it('computes live status for active announcement with no dates', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Always On',
        'body' => 'No schedule',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('announcements.data.0.status', 'live')
        );
});

it('computes scheduled status for future active announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Future',
        'body' => 'Not yet',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
        'starts_at' => now()->addDays(2),
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('announcements.data.0.status', 'scheduled')
        );
});

it('computes expired status for past ended announcement', function () {
    $admin = User::factory()->create(['is_superadmin' => true]);

    Announcement::create([
        'title' => 'Done',
        'body' => 'Already ended',
        'type' => 'info',
        'is_active' => true,
        'is_dismissible' => true,
        'ends_at' => now()->subDay(),
    ]);

    $this->actingAs($admin)
        ->get('/admin/announcements')
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('announcements.data.0.status', 'expired')
        );
});

it('shares active announcement globally via Inertia', function () {
    Announcement::create([
        'title' => 'Global Banner',
        'body' => 'This should appear everywhere',
        'type' => 'success',
        'is_active' => true,
        'is_dismissible' => true,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/settings/profile')
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('announcement')
            ->where('announcement.title', 'Global Banner')
        );
});
