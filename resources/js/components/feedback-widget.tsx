import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, CheckCircle, ChevronDown, Lightbulb, MessageCircle, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackType = 'bug' | 'idea' | 'general';

const TYPES: { value: FeedbackType; label: string; icon: typeof Bug; color: string }[] = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'idea', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-500' },
    { value: 'general', label: 'General', icon: MessageCircle, color: 'text-blue-500' },
];

export function FeedbackWidget() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>('general');
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<{ message?: string; type?: string }>({});
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) { return; }
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setProcessing(true);

        try {
            await axios.post('/feedback', { type, message });
            setSuccess(true);
            setMessage('');
            setType('general');
            setTimeout(() => {
                setSuccess(false);
                setOpen(false);
            }, 2500);
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
            {/* Panel */}
            {open && (
                <div className="mb-3 w-80 rounded-2xl border bg-popover shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Send Feedback</span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded-md p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {success ? (
                        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Thank you!</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Your feedback has been received.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            {/* Type selector */}
                            <div className="grid grid-cols-3 gap-1.5">
                                {TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => setType(t.value)}
                                        className={cn(
                                            'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition',
                                            type === t.value
                                                ? 'border-primary bg-primary/5 font-medium'
                                                : 'border-transparent hover:border-border hover:bg-muted',
                                        )}
                                    >
                                        <t.icon className={cn('h-4 w-4', t.color)} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Message */}
                            <div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={
                                        type === 'bug'
                                            ? 'Describe the bug and how to reproduce it…'
                                            : type === 'idea'
                                                ? 'Describe your feature idea…'
                                                : 'Share your thoughts…'
                                    }
                                    rows={4}
                                    maxLength={2000}
                                    className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {errors.message ? (
                                        <p className="text-xs text-destructive">{errors.message}</p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-[10px] text-muted-foreground">{message.length}/2000</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing || message.trim().length < 10}
                                className="w-full"
                                size="sm"
                            >
                                {processing ? 'Sending…' : 'Send Feedback'}
                            </Button>
                        </form>
                    )}
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={() => {
                    setOpen((o) => !o);
                    setSuccess(false);
                    setErrors({});
                }}
                className={cn(
                    'flex items-center gap-2 rounded-full border bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95',
                    open && 'scale-95',
                )}
            >
                {open ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                <span>{open ? 'Close' : 'Feedback'}</span>
                {!open && <ChevronDown className="h-3 w-3 opacity-60" />}
            </button>
        </div>
    );
}
