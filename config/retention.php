<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Data Retention Policies
    |--------------------------------------------------------------------------
    |
    | Configure how long different types of data are retained before being
    | automatically pruned by the `app:prune-old-records` command.
    |
    | Set `enabled` to false to skip pruning a specific model.
    | `days` is the age threshold — records older than this will be deleted.
    |
    */

    'notifications' => [
        'enabled' => true,
        'days' => env('RETENTION_NOTIFICATIONS_DAYS', 90),
        'read_only' => true, // Only prune read notifications; false = prune all
    ],

    'activity_log' => [
        'enabled' => true,
        'days' => env('RETENTION_ACTIVITY_DAYS', 180),
    ],

    'webhook_logs' => [
        'enabled' => true,
        'days' => env('RETENTION_WEBHOOK_LOGS_DAYS', 90),
    ],

    'feedback' => [
        'enabled' => true,
        'days' => env('RETENTION_FEEDBACK_DAYS', 180),
        'archived_only' => true, // Only prune archived feedback
    ],

];
