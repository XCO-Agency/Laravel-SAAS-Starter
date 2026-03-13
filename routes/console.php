<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Prune old records daily at 03:00 UTC based on config/retention.php
Schedule::command('app:prune-old-records')->dailyAt('03:00')->withoutOverlapping();

// Send billing reminders daily at 09:00 UTC
Schedule::command('app:send-billing-reminders')->dailyAt('09:00')->withoutOverlapping();

// Send weekly workspace activity digests every Monday at 08:00 UTC
Schedule::command('app:send-weekly-digests')->weeklyOn(1, '08:00')->withoutOverlapping();

// Send plan usage alerts daily at 10:00 UTC
Schedule::command('app:send-plan-usage-alerts')->dailyAt('10:00')->withoutOverlapping();

// Send API key expiry alerts daily at 08:00 UTC
Schedule::command('app:send-api-key-expiry-alerts')->dailyAt('08:00')->withoutOverlapping();
