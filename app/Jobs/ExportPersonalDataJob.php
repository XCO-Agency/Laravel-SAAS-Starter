<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\DataExportCompleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use ZipArchive;

class ExportPersonalDataJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $data = [
            'profile' => $this->user->toArray(),
            'workspaces' => $this->user->workspaces->toArray(),
            'connected_accounts' => $this->user->connectedAccounts->toArray(),
        ];

        // Capture generic Activity Logs safely if available natively.
        if (method_exists($this->user, 'activities')) {
            $data['activities'] = $this->user->activities()->take(1000)->get()->toArray();
        }

        $json = json_encode($data, JSON_PRETTY_PRINT);
        
        $filename = 'export_' . $this->user->id . '_' . time() . '_' . Str::random(8) . '.zip';
        $directory = storage_path('app/exports');
        
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $zipPath = $directory . '/' . $filename;

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE) === true) {
            $zip->addFromString('personal_data.json', $json);
            
            // Attach avatar blob if locally persistent.
            if ($this->user->avatar_url) {
                $avatarPath = storage_path('app/public/' . $this->user->avatar_url);
                if (file_exists($avatarPath)) {
                    $zip->addFile($avatarPath, 'avatar.' . pathinfo($avatarPath, PATHINFO_EXTENSION));
                }
            }
            
            $zip->close();
        }

        // Generate signed route expiring cleanly after 24 hours securely.
        $downloadUrl = URL::temporarySignedRoute(
            'security.export-download',
            now()->addHours(24),
            ['filename' => $filename]
        );

        $this->user->notify(new DataExportCompleted($downloadUrl));
    }
}
