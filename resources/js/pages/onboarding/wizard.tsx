import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle, ChevronRight, Store } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { SharedData } from '@/types';

export default function OnboardingWizard() {
    const { auth } = usePage<SharedData>().props;
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        workspace_name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboarding');
    };

    const nextStep = () => {
        setStep(2);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
            <Head title="Welcome to XCO" />

            <div className="mb-8 flex items-center gap-2">
                <div className="h-10 text-primary">
                    <AppLogo />
                </div>
            </div>

            <div className="w-full max-w-md">
                {/* Progress Indicator */}
                <div className="mb-8 flex items-center justify-between px-4">
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            1
                        </div>
                        <span className="mt-2 text-xs font-medium text-muted-foreground">Welcome</span>
                    </div>
                    <div className={`h-px flex-1 mx-4 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
                    <div className="flex flex-col items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            2
                        </div>
                        <span className="mt-2 text-xs font-medium text-muted-foreground">Workspace</span>
                    </div>
                </div>

                <div className="relative overflow-hidden">
                    {/* Step 1: Welcome & Overview */}
                    {step === 1 && (
                        <Card className="border-none shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Welcome, {auth.user.name}!</CardTitle>
                                <CardDescription>
                                    Let's get your account set up. This will only take a minute.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="mt-1 rounded-full bg-primary/10 p-2">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium flex items-center gap-2">
                                                Create your organization
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Set up your primary workspace to collaborate with your team.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div className="mt-1 rounded-full bg-primary/10 p-2">
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium flex items-center gap-2">
                                                Start collaborating
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Invite team members and start utilizing the platform together.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg" onClick={nextStep}>
                                    Get Started
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 2: Workspace Blueprint */}
                    {step === 2 && (
                        <Card className="border-none shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
                            <form onSubmit={submit}>
                                <CardHeader>
                                    <CardTitle className="text-2xl">Name your Workspace</CardTitle>
                                    <CardDescription>
                                        What's the name of your company or organization? You can change this later.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="workspace_name">Workspace Name</Label>
                                        <Input
                                            id="workspace_name"
                                            placeholder="e.g. Acme Corporation"
                                            value={data.workspace_name}
                                            onChange={(e) => setData('workspace_name', e.target.value)}
                                            autoFocus
                                            required
                                        />
                                        {errors.workspace_name && (
                                            <p className="text-sm text-destructive">{errors.workspace_name}</p>
                                        )}
                                    </div>

                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Store className="h-4 w-4 text-muted-foreground" />
                                            What is a Workspace?
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            A workspace is a dedicated environment where you and your team can collaborate securely. You are designated as the owner.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={processing} className="min-w-32">
                                        {processing ? 'Creating...' : 'Continue'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    )}
                </div>
            </div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
                Secured by XCO SAAS Starter
            </div>
        </div>
    );
}
