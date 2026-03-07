<?php

use App\Models\SeoMetadata;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['is_superadmin' => true]);
});

it('renders the seo metadata page for superadmin', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.seo.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/seo-metadata')
            ->has('entries')
        );
});

it('can create a new seo metadata entry', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.seo.store'), [
            'path' => '/about',
            'title' => 'About Us',
            'description' => 'Learn about our company',
            'is_global' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('seo_metadata', [
        'path' => '/about',
        'title' => 'About Us',
    ]);
});

it('can create a global seo metadata entry', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.seo.store'), [
            'title' => 'Default Title',
            'description' => 'Default description',
            'is_global' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('seo_metadata', [
        'is_global' => true,
        'path' => null,
    ]);
});

it('clears existing global flag when creating a new global entry', function () {
    $existing = SeoMetadata::factory()->create(['is_global' => true, 'path' => null]);

    $this->actingAs($this->admin)
        ->post(route('admin.seo.store'), [
            'title' => 'New Global',
            'is_global' => true,
        ])
        ->assertRedirect();

    expect($existing->fresh()->is_global)->toBeFalse();
});

it('can update a seo metadata entry', function () {
    $entry = SeoMetadata::factory()->create(['path' => '/old', 'title' => 'Old Title']);

    $this->actingAs($this->admin)
        ->put(route('admin.seo.update', $entry), [
            'path' => '/new',
            'title' => 'New Title',
            'is_global' => false,
        ])
        ->assertRedirect();

    expect($entry->fresh()->title)->toBe('New Title');
    expect($entry->fresh()->path)->toBe('/new');
});

it('can delete a seo metadata entry', function () {
    $entry = SeoMetadata::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.seo.destroy', $entry))
        ->assertRedirect();

    $this->assertDatabaseMissing('seo_metadata', ['id' => $entry->id]);
});

it('validates path uniqueness on store', function () {
    SeoMetadata::factory()->create(['path' => '/duplicate']);

    $this->actingAs($this->admin)
        ->post(route('admin.seo.store'), [
            'path' => '/duplicate',
            'title' => 'Duplicate',
            'is_global' => false,
        ])
        ->assertSessionHasErrors('path');
});

it('denies access to non-superadmin users', function () {
    $user = User::factory()->create(['is_superadmin' => false]);

    $this->actingAs($user)
        ->get(route('admin.seo.index'))
        ->assertForbidden();
});
