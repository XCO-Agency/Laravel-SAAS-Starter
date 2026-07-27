<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Experience Survey Threshold
    |--------------------------------------------------------------------------
    |
    | The minimum account age, in days, before the proactive "how is your
    | experience?" survey is shown to a user. The survey is displayed once the
    | account is at least this many days old and the user has not yet responded
    | to or dismissed it.
    |
    */

    'experience_survey_after_days' => (int) env('FEEDBACK_EXPERIENCE_SURVEY_AFTER_DAYS', 3),

];
