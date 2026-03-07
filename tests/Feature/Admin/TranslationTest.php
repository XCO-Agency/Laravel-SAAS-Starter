<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->standardUser = User::factory()->create(['is_superadmin' => false]);

    $this->langPath = lang_path();

    // Create a temporary test language file
    $this->testLocale = 'test_en';
    $this->testFile = $this->langPath."/{$this->testLocale}.json";

    File::put($this->testFile, json_encode([
        'Welcome back' => 'Welcome back',
        'Dashboard' => 'Dashboard',
    ]));
});

afterEach(function () {
    // Clean up test file
    if (File::exists($this->testFile)) {
        File::delete($this->testFile);
    }

    // Clean up any dynamically created locales
    if (File::exists($this->langPath.'/test_new.json')) {
        File::delete($this->langPath.'/test_new.json');
    }
});

it('prevents non-admins from accessing translations', function () {
    $response = $this->actingAs($this->standardUser)->get(route('admin.translations.index'));
    $response->assertForbidden();
});

it('allows superadmins to view the translation index', function () {
    $response = $this->actingAs($this->superadmin)->get(route('admin.translations.index'));

    $response->assertSuccessful();
    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/translations')
            ->has('locales')
    );
});

it('allows superadmins to view a specific locale translation', function () {
    // We assume 'en.json' always exists if we test 'test_en'
    // Create base 'en' if it doesn't exist just for the test (controller depends on it)
    $enPath = $this->langPath.'/en.json';
    $createdEn = false;
    if (! File::exists($enPath)) {
        File::put($enPath, json_encode(['Dashboard' => 'Dashboard']));
        $createdEn = true;
    }

    $response = $this->actingAs($this->superadmin)->get(route('admin.translations.show', $this->testLocale));

    $response->assertSuccessful();
    $response->assertInertia(
        fn ($page) => $page
            ->component('admin/translations')
            ->where('currentLocale', $this->testLocale)
            ->has('translations.Welcome back')
            ->has('translations.Dashboard')
    );

    if ($createdEn) {
        File::delete($enPath);
    }
});

it('can update a translation string', function () {
    $response = $this->actingAs($this->superadmin)->put(route('admin.translations.update', $this->testLocale), [
        'key' => 'Dashboard',
        'value' => 'Panel de Control',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Assert file was updated
    $content = json_decode(File::get($this->testFile), true);
    expect($content['Dashboard'])->toBe('Panel de Control');
});

it('can clear a translation string by submitting an empty value', function () {
    $response = $this->actingAs($this->superadmin)->put(route('admin.translations.update', $this->testLocale), [
        'key' => 'Dashboard',
        'value' => '',
    ]);

    $response->assertRedirect();

    // Assert key was removed from file
    $content = json_decode(File::get($this->testFile), true);
    expect($content)->not->toHaveKey('Dashboard');
});

it('can create a new locale file', function () {
    $newLocale = 'test_new';

    $this->assertFalse(File::exists($this->langPath."/{$newLocale}.json"));

    $response = $this->actingAs($this->superadmin)->post(route('admin.translations.store'), [
        'locale' => $newLocale,
    ]);

    $response->assertRedirect(route('admin.translations.show', $newLocale));
    $response->assertSessionHas('success');

    $this->assertTrue(File::exists($this->langPath."/{$newLocale}.json"));

    // Content should be empty json object {}
    expect(File::get($this->langPath."/{$newLocale}.json"))->toBe('{}');
});

it('cannot create an invalid locale', function () {
    $response = $this->actingAs($this->superadmin)->post(route('admin.translations.store'), [
        'locale' => 'invalid/locale', // alpha_dash rule failure
    ]);

    $response->assertSessionHasErrors('locale');
});
