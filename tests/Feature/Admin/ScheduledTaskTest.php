<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->superadmin = User::factory()->create(['is_superadmin' => true]);
    $this->user = User::factory()->create();
});

it('allows superadmin to view the scheduled tasks page', function () {
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/scheduled-tasks')
            ->has('tasks')
        );
});

it('blocks regular users from the scheduled tasks page', function () {
    actingAs($this->user)
        ->get('/admin/scheduled-tasks')
        ->assertForbidden();
});

it('blocks guests from the scheduled tasks page', function () {
    $this->get('/admin/scheduled-tasks')
        ->assertRedirect('/login');
});

it('returns tasks with the expected structure', function () {
    // The app already has at least 'app:prune-old-records' in routes/console.php
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/scheduled-tasks')
            ->has('tasks')
            ->where('tasks', fn ($tasks) => collect($tasks)->isNotEmpty()
                && collect($tasks)->every(fn ($task) => isset($task['command'])
                    && isset($task['expression'])
                    && isset($task['human_readable'])
                    && isset($task['timezone'])
                    && array_key_exists('without_overlapping', $task)
                    && array_key_exists('run_in_background', $task)
                    && array_key_exists('next_due', $task)
                )
            )
        );
});

it('includes the prune-old-records command from the schedule', function () {
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tasks', fn ($tasks) => collect($tasks)->contains(
                fn ($task) => str_contains($task['command'], 'app:prune-old-records')
            ))
        );
});

it('resolves human-readable descriptions for scheduled commands', function () {
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tasks', fn ($tasks) => collect($tasks)->every(
                fn ($task) => ! empty($task['human_readable'])
            ))
        );
});

it('calculates next_due for scheduled tasks', function () {
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tasks', fn ($tasks) => collect($tasks)->every(
                fn ($task) => $task['next_due'] !== null
            ))
        );
});

it('detects without_overlapping flag on prune command', function () {
    actingAs($this->superadmin)
        ->get('/admin/scheduled-tasks')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('tasks', fn ($tasks) => collect($tasks)->contains(
                fn ($task) => str_contains($task['command'], 'app:prune-old-records')
                    && $task['without_overlapping'] === true
            ))
        );
});
