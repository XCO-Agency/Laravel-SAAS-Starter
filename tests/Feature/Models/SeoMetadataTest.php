<?php

use App\Models\SeoMetadata;

it('casts is_global to boolean', function () {
    $seo = SeoMetadata::factory()->create(['is_global' => 1]);
    expect($seo->is_global)->toBeTrue();
});

it('finds metadata for exact path match', function () {
    SeoMetadata::factory()->create([
        'path' => '/about',
        'title' => 'About Us',
        'is_global' => false,
    ]);

    $result = SeoMetadata::forPath('/about');

    expect($result)->not->toBeNull();
    expect($result->title)->toBe('About Us');
});

it('falls back to global metadata when no exact path match', function () {
    SeoMetadata::factory()->create([
        'path' => '/global',
        'title' => 'Global Default',
        'is_global' => true,
    ]);

    $result = SeoMetadata::forPath('/some-random-page');

    expect($result)->not->toBeNull();
    expect($result->title)->toBe('Global Default');
});

it('prefers exact path match over global', function () {
    SeoMetadata::factory()->create([
        'path' => '/pricing',
        'title' => 'Pricing Page',
        'is_global' => false,
    ]);
    SeoMetadata::factory()->create([
        'path' => '/global',
        'title' => 'Global Default',
        'is_global' => true,
    ]);

    $result = SeoMetadata::forPath('/pricing');

    expect($result->title)->toBe('Pricing Page');
});

it('returns null when no path or global metadata exists', function () {
    $result = SeoMetadata::forPath('/nonexistent');
    expect($result)->toBeNull();
});

it('has correct fillable attributes', function () {
    $seo = new SeoMetadata;
    expect($seo->getFillable())->toContain(
        'path', 'title', 'description', 'keywords',
        'og_title', 'og_description', 'og_image', 'og_type',
        'twitter_card', 'twitter_site', 'twitter_creator', 'twitter_image',
        'is_global'
    );
});
