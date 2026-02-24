<?php

use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

it('allows guests to update their locale preference in the session', function () {
    // Assert initial state mapping
    expect(Session::get('locale'))->toBeNull();
    expect(App::getLocale())->toBe('en');

    $response = $this->patch('/locale', [
        'locale' => 'fr',
    ]);

    $response->assertRedirect();
    
    // Assert session was updated
    expect(Session::get('locale'))->toBe('fr');
});

it('allows authenticated users to update their locale in session and database', function () {
    $user = User::factory()->create([
        'locale' => 'en',
    ]);

    $this->actingAs($user);

    $response = $this->patch('/locale', [
        'locale' => 'es',
    ]);

    $response->assertRedirect();
    
    // Assert session updated
    expect(Session::get('locale'))->toBe('es');
    
    // Assert database updated
    $user->refresh();
    expect($user->locale)->toBe('es');
});

it('rejects invalid locales', function () {
    $response = $this->patch('/locale', [
        'locale' => 'invalid-locale',
    ]);

    $response->assertSessionHasErrors(['locale']);
    
    // Assert session was NOT updated
    expect(Session::get('locale'))->toBeNull();
});

it('redirects back to the previous page', function () {
    $response = $this->from('/some-previous-page')->patch('/locale', [
        'locale' => 'ar',
    ]);

    $response->assertRedirect('/some-previous-page');
    expect(Session::get('locale'))->toBe('ar');
});
