import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Workspace } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Code2, Copy, Shield } from 'lucide-react';
import { useState } from 'react';

interface Props {
    workspace: Workspace;
    signatureHeader: string;
    algorithm: string;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between rounded-t-md border border-b-0 bg-muted px-3 py-1.5">
                <span className="text-xs text-muted-foreground">{language}</span>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={handleCopy}>
                    {copied ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
            <pre className="overflow-x-auto rounded-b-md border bg-muted/50 p-4 text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );
}

const PHP_EXAMPLE = `<?php

function verifyWebhookSignature(string $payload, string $secret, string $signature): bool
{
    $expected = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected, $signature);
}

// In your webhook handler:
$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_SIGNATURE'] ?? '';
$secret    = 'your-webhook-secret';

if (!verifyWebhookSignature($payload, $secret, $signature)) {
    http_response_code(403);
    exit('Invalid signature');
}

$event = json_decode($payload, true);
// Handle $event...`;

const NODE_EXAMPLE = `const crypto = require('crypto');

function verifyWebhookSignature(payload, secret, signature) {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
    );
}

// In your Express handler:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const signature = req.headers['signature'];
    const secret    = 'your-webhook-secret';

    if (!verifyWebhookSignature(req.body, secret, signature)) {
        return res.status(403).send('Invalid signature');
    }

    const event = JSON.parse(req.body);
    // Handle event...
    res.sendStatus(200);
});`;

const PYTHON_EXAMPLE = `import hmac
import hashlib
import json
from flask import Flask, request, abort

def verify_webhook_signature(payload: bytes, secret: str, signature: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

# In your Flask handler:
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    payload   = request.get_data()
    signature = request.headers.get('Signature', '')
    secret    = 'your-webhook-secret'

    if not verify_webhook_signature(payload, secret, signature):
        abort(403)

    event = request.get_json()
    # Handle event...
    return '', 200`;

export default function WebhookVerificationGuide({ workspace, signatureHeader, algorithm }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Webhooks', href: `/workspaces/${workspace.id}/webhooks` },
        { title: 'Signature Verification Guide', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Webhook Signature Verification" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex items-start gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/workspaces/${workspace.id}/webhooks`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Webhooks
                        </Link>
                    </Button>
                </div>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Shield className="h-6 w-6" />
                        Webhook Signature Verification
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Verify incoming webhook requests to ensure they originate from this platform.
                    </p>
                </div>

                {/* How it works */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="h-5 w-5" />
                            How Signatures Work
                        </CardTitle>
                        <CardDescription>
                            Every webhook request is signed using HMAC-{algorithm.toUpperCase()} with your endpoint's secret key.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ol className="space-y-2 text-sm">
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    1
                                </span>
                                <span>
                                    The payload is serialised as JSON and signed with{' '}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                        hash_hmac('{algorithm}', json_payload, secret)
                                    </code>
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    2
                                </span>
                                <span>
                                    The signature is sent in the{' '}
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {signatureHeader}
                                    </Badge>{' '}
                                    HTTP header as a hex string.
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    3
                                </span>
                                <span>
                                    Your server recomputes the signature using the raw request body and your secret, then
                                    compares it using a timing-safe comparison function.
                                </span>
                            </li>
                        </ol>

                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                            <strong>Important:</strong> Always use a timing-safe comparison (e.g.{' '}
                            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/40">hash_equals</code> in PHP,{' '}
                            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/40">crypto.timingSafeEqual</code>{' '}
                            in Node.js) to prevent timing attacks. Do not use{' '}
                            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/40">===</code>.
                        </div>
                    </CardContent>
                </Card>

                {/* Code Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Examples</CardTitle>
                        <CardDescription>
                            Replace <code className="rounded bg-muted px-1 py-0.5 text-xs">your-webhook-secret</code> with the
                            secret shown on your webhook endpoint.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">PHP</h3>
                            <CodeBlock code={PHP_EXAMPLE} language="php" />
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">Node.js</h3>
                            <CodeBlock code={NODE_EXAMPLE} language="javascript" />
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">Python (Flask)</h3>
                            <CodeBlock code={PYTHON_EXAMPLE} language="python" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
