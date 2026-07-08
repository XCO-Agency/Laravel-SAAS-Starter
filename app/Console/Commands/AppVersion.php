<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class AppVersion extends Command
{
    /** @var string */
    protected $signature = 'app:version';

    /** @var string */
    protected $description = 'Display the application name and version from config';

    public function handle(): int
    {
        $this->components->twoColumnDetail('Application', (string) config('app.name'));
        $this->components->twoColumnDetail('Version', (string) config('app.version'));

        return self::SUCCESS;
    }
}
