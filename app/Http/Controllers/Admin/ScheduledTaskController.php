<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Console\Scheduling\Schedule;
use Inertia\Inertia;
use Inertia\Response;

class ScheduledTaskController extends Controller
{
    /**
     * Display the scheduled tasks monitoring page.
     */
    public function index(Schedule $schedule): Response
    {
        $events = collect($schedule->events())->map(function ($event) {
            return [
                'command' => $this->resolveCommand($event),
                'expression' => $event->expression,
                'human_readable' => $this->humanReadable($event->expression),
                'timezone' => $event->timezone ?? config('app.timezone'),
                'without_overlapping' => $event->withoutOverlapping,
                'run_in_background' => $event->runInBackground,
                'next_due' => $this->nextDue($event->expression, $event->timezone),
                'description' => $event->description ?? '',
            ];
        });

        return Inertia::render('admin/scheduled-tasks', [
            'tasks' => $events,
        ]);
    }

    /**
     * Resolve the human-readable command name from an event.
     */
    protected function resolveCommand(object $event): string
    {
        if (isset($event->command)) {
            // Strip the PHP binary path and artisan prefix
            $command = $event->command;
            $command = preg_replace('/^.*artisan\s+/', '', $command);

            return trim($command, "'\" ");
        }

        if (isset($event->description) && $event->description) {
            return $event->description;
        }

        return 'Closure';
    }

    /**
     * Convert cron expression to a human-readable description.
     */
    protected function humanReadable(string $expression): string
    {
        return match ($expression) {
            '* * * * *' => 'Every minute',
            '*/5 * * * *' => 'Every 5 minutes',
            '*/10 * * * *' => 'Every 10 minutes',
            '*/15 * * * *' => 'Every 15 minutes',
            '*/30 * * * *' => 'Every 30 minutes',
            '0 * * * *' => 'Hourly',
            '0 0 * * *' => 'Daily at midnight',
            '0 0 * * 0' => 'Weekly on Sunday',
            '0 0 1 * *' => 'Monthly',
            default => $this->parseCron($expression),
        };
    }

    /**
     * Parse a cron expression into a basic human-readable format.
     */
    protected function parseCron(string $expression): string
    {
        $parts = explode(' ', $expression);

        if (count($parts) !== 5) {
            return $expression;
        }

        [$minute, $hour, $dayOfMonth, $month, $dayOfWeek] = $parts;

        if ($minute !== '*' && $hour !== '*' && $dayOfMonth === '*' && $month === '*' && $dayOfWeek === '*') {
            return "Daily at {$hour}:{$minute}";
        }

        if ($minute !== '*' && $hour !== '*' && $dayOfMonth === '*' && $month === '*' && $dayOfWeek !== '*') {
            $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            $dayName = $days[(int) $dayOfWeek] ?? $dayOfWeek;

            return "Weekly on {$dayName} at {$hour}:{$minute}";
        }

        return $expression;
    }

    /**
     * Calculate the next due date for a cron expression.
     */
    protected function nextDue(string $expression, ?string $timezone): ?string
    {
        try {
            $cron = new \Cron\CronExpression($expression);
            $tz = $timezone ?? config('app.timezone');

            return $cron->getNextRunDate('now', 0, false, $tz)->format('Y-m-d H:i:s T');
        } catch (\Exception) {
            return null;
        }
    }
}
