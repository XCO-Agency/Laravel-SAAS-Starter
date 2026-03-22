import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import http from '@/lib/http';
import { AlertTriangle, Clock, HeartHandshake, ArrowRight, CheckCircle } from 'lucide-react';

interface CancellationFlowProps {
    isOpen: boolean;
    onClose: () => void;
    onCancelled: () => void;
    planName: string;
    endsAt: string | null;
}

const cancellationReasons = [
    { id: 'too_expensive', label: 'Too expensive', offer: 'We can offer you a 20% discount for the next 3 months.' },
    { id: 'missing_features', label: 'Missing features I need', offer: 'We\'d love to hear what features you need - many are on our roadmap!' },
    { id: 'not_using', label: 'Not using it enough', offer: 'Would you like to downgrade to our Free plan instead?' },
    { id: 'switched', label: 'Switched to a competitor', offer: 'We\'d appreciate feedback on what we could do better.' },
    { id: 'temporary', label: 'Temporary break', offer: 'You can pause your subscription and resume anytime.' },
    { id: 'other', label: 'Other', offer: '' },
];

export default function CancellationFlow({
    isOpen,
    onClose,
    onCancelled,
    planName,
    endsAt,
}: CancellationFlowProps) {
    const [step, setStep] = useState<'reason' | 'offer' | 'confirm' | 'success'>('reason');
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleReasonSubmit = () => {
        if (!reason) return;
        
        const selectedReason = cancellationReasons.find(r => r.id === reason);
        if (selectedReason?.offer) {
            setStep('offer');
        } else {
            setStep('confirm');
        }
    };

    const handleAcceptOffer = () => {
        // In a real implementation, this would apply the retention offer
        addToast('Great! We\'ve applied the discount to your account.', 'success');
        onClose();
    };

    const handleDeclineOffer = () => {
        setStep('confirm');
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const { data } = await http.post('/billing/cancel', {
                body: { reason, feedback },
            });

            if (data.success) {
                setStep('success');
                setTimeout(() => {
                    onCancelled();
                }, 2000);
            } else {
                addToast(data.error || 'Failed to cancel subscription', 'error');
            }
        } catch (error) {
            addToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('reason');
        setReason('');
        setFeedback('');
        onClose();
    };

    const selectedReason = cancellationReasons.find(r => r.id === reason);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {step === 'reason' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                We\'re sorry to see you go
                            </DialogTitle>
                            <DialogDescription>
                                Please let us know why you\'re cancelling. Your feedback helps us improve.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="reason">Why are you cancelling?</Label>
                                <Select value={reason} onValueChange={setReason}>
                                    <SelectTrigger id="reason" className="mt-2">
                                        <SelectValue placeholder="Select a reason..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cancellationReasons.map((option) => (
                                            <SelectItem key={option.id} value={option.id}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="feedback">Additional feedback (optional)</Label>
                                <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us more about your experience..."
                                    className="mt-2"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Keep Subscription
                            </Button>
                            <Button 
                                onClick={handleReasonSubmit} 
                                disabled={!reason}
                                variant="destructive"
                            >
                                Continue
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'offer' && selectedReason?.offer && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <HeartHandshake className="h-5 w-5 text-primary" />
                                Before you go...
                            </DialogTitle>
                            <DialogDescription>
                                We have an offer that might help!
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                                <p className="text-sm font-medium text-primary">
                                    {selectedReason.offer}
                                </p>
                            </div>

                            <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>
                                    If you cancel now, you\'ll continue to have access until{' '}
                                    <strong>{endsAt ? new Date(endsAt).toLocaleDateString() : 'the end of your billing period'}</strong>.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={handleDeclineOffer} className="w-full sm:w-auto">
                                No thanks, continue cancelling
                            </Button>
                            <Button onClick={handleAcceptOffer} className="w-full sm:w-auto">
                                Accept Offer
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'confirm' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Final Confirmation
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to cancel your {planName} subscription?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                                <p className="font-medium mb-1">What happens next:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>You\'ll keep access until {endsAt ? new Date(endsAt).toLocaleDateString() : 'the end of your billing period'}</li>
                                    <li>You won\'t be charged again</li>
                                    <li>Your data will be preserved for 30 days</li>
                                    <li>You can resume anytime before the end date</li>
                                </ul>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Keep Subscription
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                {loading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'success' && (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="mb-2">Subscription Cancelled</DialogTitle>
                        <DialogDescription>
                            Your subscription has been cancelled. You\'ll have access until{' '}
                            {endsAt ? new Date(endsAt).toLocaleDateString() : 'the end of your billing period'}.
                        </DialogDescription>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
