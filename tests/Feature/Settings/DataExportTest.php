<?php

use App\Jobs\ExportPersonalDataJob;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('dispatches the export personal data job securely', function () {
    Queue::fake();

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/settings/export-data');

    $response->assertRedirect();
    $response->assertSessionHas('success');

    Queue::assertPushed(ExportPersonalDataJob::class, function ($job) use ($user) {
        return $job->user->id === $user->id;
    });
});

