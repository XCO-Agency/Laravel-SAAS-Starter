<?php

namespace App\Services;

use App\Models\Workspace;
use Illuminate\Http\UploadedFile;

class CsvImportService
{
    /**
     * Parse a CSV file and return validated rows with results.
     *
     * @return array{rows: list<array{email: string, role: string, status: string, error: string|null}>, valid: int, invalid: int, skipped: int}
     */
    public function parse(UploadedFile $file, Workspace $workspace): array
    {
        $content = file_get_contents($file->getRealPath());
        $lines = preg_split('/\r\n|\r|\n/', $content);
        $lines = array_filter($lines, fn ($line) => trim($line) !== '');

        if (count($lines) < 2) {
            return ['rows' => [], 'valid' => 0, 'invalid' => 0, 'skipped' => 0];
        }

        $header = str_getcsv(array_shift($lines));
        $header = array_map(fn ($col) => strtolower(trim($col)), $header);

        $emailIndex = $this->findColumnIndex($header, ['email', 'e-mail', 'email_address']);
        $roleIndex = $this->findColumnIndex($header, ['role', 'member_role', 'team_role']);

        if ($emailIndex === null) {
            return ['rows' => [], 'valid' => 0, 'invalid' => 0, 'skipped' => 0];
        }

        $existingEmails = $workspace->users()->pluck('users.email')->map(fn ($e) => strtolower($e))->toArray();
        $pendingEmails = $workspace->invitations()->pluck('email')->map(fn ($e) => strtolower($e))->toArray();

        $rows = [];
        $valid = 0;
        $invalid = 0;
        $skipped = 0;
        $seenEmails = [];

        foreach ($lines as $line) {
            $columns = str_getcsv($line);
            $email = isset($columns[$emailIndex]) ? strtolower(trim($columns[$emailIndex])) : '';
            $role = ($roleIndex !== null && isset($columns[$roleIndex])) ? strtolower(trim($columns[$roleIndex])) : 'member';

            if ($role !== 'admin' && $role !== 'member') {
                $role = 'member';
            }

            // Validate email
            if (empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $rows[] = ['email' => $email ?: '(empty)', 'role' => $role, 'status' => 'invalid', 'error' => 'Invalid email address'];
                $invalid++;

                continue;
            }

            // Check for duplicates in CSV
            if (in_array($email, $seenEmails, true)) {
                $rows[] = ['email' => $email, 'role' => $role, 'status' => 'skipped', 'error' => 'Duplicate in CSV'];
                $skipped++;

                continue;
            }

            // Check if already a member
            if (in_array($email, $existingEmails, true)) {
                $rows[] = ['email' => $email, 'role' => $role, 'status' => 'skipped', 'error' => 'Already a member'];
                $skipped++;
                $seenEmails[] = $email;

                continue;
            }

            // Check if already invited
            if (in_array($email, $pendingEmails, true)) {
                $rows[] = ['email' => $email, 'role' => $role, 'status' => 'skipped', 'error' => 'Already invited'];
                $skipped++;
                $seenEmails[] = $email;

                continue;
            }

            $rows[] = ['email' => $email, 'role' => $role, 'status' => 'valid', 'error' => null];
            $valid++;
            $seenEmails[] = $email;
        }

        return [
            'rows' => $rows,
            'valid' => $valid,
            'invalid' => $invalid,
            'skipped' => $skipped,
        ];
    }

    /**
     * Find a column index by trying multiple possible header names.
     *
     * @param  list<string>  $header
     * @param  list<string>  $possibleNames
     */
    private function findColumnIndex(array $header, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $index = array_search($name, $header, true);
            if ($index !== false) {
                return $index;
            }
        }

        return null;
    }
}
