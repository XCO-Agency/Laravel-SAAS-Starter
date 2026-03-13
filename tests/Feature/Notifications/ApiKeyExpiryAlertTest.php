<?php

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceApiKey;
use App\Notifications\ApiKeyExpiryNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    $this->owner = User::factory()->create();
    $this->workspace = Workspace::factory()->create(['owner_id' => $this->owner->id]);
    $this->workspace->addUser($this->owner, 'owner');
});

it('sends alert when api key expires in 7 days', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'My Key',
        'expires_at' => now()->addDays(7),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertSentTo($this->owner, ApiKeyExpiryNotification::class, function ($n) {
        return $n->keyName === 'My Key' && $n->daysUntilExpiry === 7;
    });
});

it('sends alert when api key expires in 3 days', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'Soon Key',
        'expires_at' => now()->addDays(3),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertSentTo($this->owner, ApiKeyExpiryNotification::class);
});

it('sends alert when api key expires in 1 day', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'Urgent Key',
        'expires_at' => now()->addDay(),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertSentTo($this->owner, ApiKeyExpiryNotification::class);
});

it('does not send alert when key expires in 5 days (not a warning threshold)', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'Not Yet',
        'expires_at' => now()->addDays(5),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertNothingSent();
});

it('does not send alert for already expired keys', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'Expired Key',
        'expires_at' => now()->subDay(),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertNothingSent();
});

it('does not send alert for keys with no expiry', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'No Expiry',
        'expires_at' => null,
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertNothingSent();
});

it('dry run does not send notifications', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'My Key',
        'expires_at' => now()->addDays(7),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts --dry-run')->assertSuccessful();

    Notification::assertNothingSent();
});

it('notification contains correct workspace and key data', function () {
    WorkspaceApiKey::factory()->create([
        'workspace_id' => $this->workspace->id,
        'created_by' => $this->owner->id,
        'name' => 'Production Key',
        'expires_at' => now()->addDays(7),
    ]);

    $this->artisan('app:send-api-key-expiry-alerts')->assertSuccessful();

    Notification::assertSentTo($this->owner, ApiKeyExpiryNotification::class, function ($n) {
        return $n->workspaceName === $this->workspace->name
            && $n->keyName === 'Production Key'
            && $n->daysUntilExpiry === 7;
    });
});
