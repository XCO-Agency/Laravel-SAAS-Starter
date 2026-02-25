<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Prune old records daily at 03:00 UTC based on config/retention.php
Schedule::command('app:prune-old-records')->dailyAt('03:00')->withoutOverlapping();
