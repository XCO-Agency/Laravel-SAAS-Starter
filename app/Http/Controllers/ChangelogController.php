<?php

namespace App\Http\Controllers;

use App\Models\ChangelogEntry;
use Inertia\Inertia;
use Inertia\Response;

class ChangelogController extends Controller
{
    /**
     * Display the public changelog page.
     */
    public function index(): Response
    {
        $entries = ChangelogEntry::query()
            ->published()
            ->orderByDesc('published_at')
            ->get();

        return Inertia::render('changelog', [
            'entries' => $entries,
        ]);
    }
}
