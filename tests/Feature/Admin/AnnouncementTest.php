<?php

use App\Models\Announcement;
use App\Models\User;

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
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
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
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->has('announcement')
            ->where('announcement.title', 'Global Banner')
        );
});
