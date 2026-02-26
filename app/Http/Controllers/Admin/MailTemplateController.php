<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MailTemplates\Models\MailTemplate;

class MailTemplateController extends Controller
{
    /**
     * Display a listing of the mail templates.
     */
    public function index(): Response
    {
        $templates = MailTemplate::query()
            ->orderBy('mailable')
            ->paginate(20)
            ->through(fn ($template) => [
                'id' => $template->id,
                'mailable' => class_basename($template->mailable),
                'subject' => $template->subject,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ]);

        return Inertia::render('admin/mail-templates/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for editing the specified mail template.
     */
    public function edit(MailTemplate $mailTemplate): Response
    {
        return Inertia::render('admin/mail-templates/edit', [
            'mailTemplate' => [
                'id' => $mailTemplate->id,
                'mailable_name' => class_basename($mailTemplate->mailable),
                'mailable' => $mailTemplate->mailable,
                'subject' => $mailTemplate->subject,
                'html_template' => $mailTemplate->html_template,
                'text_template' => $mailTemplate->text_template,
            ],
            'variables' => $this->extractVariables($mailTemplate->html_template.' '.$mailTemplate->text_template.' '.$mailTemplate->subject),
        ]);
    }

    /**
     * Update the specified mail template in storage.
     */
    public function update(Request $request, MailTemplate $mailTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'html_template' => ['required', 'string'],
            'text_template' => ['nullable', 'string'],
        ]);

        $mailTemplate->update($validated);

        return redirect()->route('admin.mail-templates.index')
            ->with('success', 'Email template updated successfully.');
    }

    /**
     * Extract mustache variables from templates for helper display.
     */
    private function extractVariables(string ...$templateStrings): array
    {
        $combined = implode(' ', $templateStrings);
        preg_match_all('/{{\s*([a-zA-Z0-9_]+)\s*}}/', $combined, $matches);

        return array_values(array_unique($matches[1] ?? []));
    }
}
