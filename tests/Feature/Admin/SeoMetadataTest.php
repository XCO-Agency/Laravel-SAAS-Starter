<?php

use App\Models\SeoMetadata;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('allows superadmin to view the SEO metadata page', function () {
    actingAs($this->superadmin)
        ->get('/admin/seo')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/seo-metadata')
            ->has('entries')
        );
});

it('blocks regular users from the SEO metadata page', function () {
    actingAs($this->user)
        ->get('/admin/seo')
        ->assertForbidden();
});

it('allows superadmin to create a page-specific SEO entry', function () {
    actingAs($this->superadmin)
        ->post('/admin/seo', [
            'path' => '/about',
            'title' => 'About Us',
            'description' => 'Learn more about our company.',
            'keywords' => 'about, company',
            'is_global' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('seo_metadata', [
        'path' => '/about',
        'title' => 'About Us',
        'is_global' => false,
    ]);
});

it('allows superadmin to create a global fallback entry', function () {
    actingAs($this->superadmin)
        ->post('/admin/seo', [
            'title' => 'Default Title',
            'description' => 'Default description for all pages.',
            'is_global' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('seo_metadata', [
        'path' => null,
        'title' => 'Default Title',
        'is_global' => true,
    ]);
});

it('unsets previous global entry when creating a new global entry', function () {
    $existing = SeoMetadata::factory()->global()->create(['title' => 'Old Global']);

    actingAs($this->superadmin)
        ->post('/admin/seo', [
            'title' => 'New Global',
            'is_global' => true,
        ])
        ->assertRedirect();

    expect($existing->fresh()->is_global)->toBeFalse();
    $this->assertDatabaseHas('seo_metadata', [
        'title' => 'New Global',
        'is_global' => true,
    ]);
});

it('allows superadmin to update an SEO entry', function () {
    $entry = SeoMetadata::factory()->create(['path' => '/pricing', 'title' => 'Old Title']);

    actingAs($this->superadmin)
        ->put("/admin/seo/{$entry->id}", [
            'path' => '/pricing',
            'title' => 'New Pricing Title',
            'description' => 'Updated description.',
            'is_global' => false,
        ])
        ->assertRedirect();

    expect($entry->fresh()->title)->toBe('New Pricing Title');
});

it('allows superadmin to delete an SEO entry', function () {
    $entry = SeoMetadata::factory()->create();

    actingAs($this->superadmin)
        ->delete("/admin/seo/{$entry->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('seo_metadata', ['id' => $entry->id]);
});

it('validates unique path on create', function () {
    SeoMetadata::factory()->create(['path' => '/about']);

    actingAs($this->superadmin)
        ->post('/admin/seo', [
            'path' => '/about',
            'title' => 'Duplicate',
            'is_global' => false,
        ])
        ->assertSessionHasErrors('path');
});

it('resolves SEO metadata for a specific path', function () {
    SeoMetadata::factory()->create(['path' => '/pricing', 'title' => 'Pricing Page']);
    SeoMetadata::factory()->global()->create(['title' => 'Global Default']);

    $result = SeoMetadata::forPath('/pricing');
    expect($result->title)->toBe('Pricing Page');
});

it('falls back to global metadata when no path match', function () {
    SeoMetadata::factory()->global()->create(['title' => 'Global Fallback']);

    $result = SeoMetadata::forPath('/nonexistent');
    expect($result->title)->toBe('Global Fallback');
});
