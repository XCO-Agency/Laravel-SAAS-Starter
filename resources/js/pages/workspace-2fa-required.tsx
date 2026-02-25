import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Crown, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkspaceItem {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    personal_workspace?: boolean;
    plan?: string;
    role?: string;
}

interface Props {
    workspace_name: string | null;
    workspaces: WorkspaceItem[];
    is_owner: boolean;
}

export default function WorkspaceTwoFactorRequired({ workspace_name, workspaces, is_owner }: Props) {
    const switchTo = (workspaceId: number) => {
        router.post(`/workspaces/${workspaceId}/switch`);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
            <Head title="Two-Factor Authentication Required" />

            <div className="w-full max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                    <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">2FA Required</h1>
                    {workspace_name && (
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{workspace_name}</span> requires two-factor authentication before you can access it.
                        </p>
                    )}
                </div>

                {/* Owner escape hatch: reach settings to disable the requirement */}
                {is_owner ? (
                    <div className="space-y-3">
                        <Button className="w-full" asChild>
                            <Link href="/settings/two-factor">
                                Enable Two-Factor Authentication
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/settings/workspace-security">
                                Disable 2FA Requirement
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <Button className="w-full" asChild>
                        <Link href="/settings/two-factor">
                            Enable Two-Factor Authentication
                        </Link>
                    </Button>
                )}

                {/* Inline workspace picker */}
                {workspaces.length > 0 && (
                    <div className="space-y-3 text-left">
                        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Or switch to another workspace
                        </p>
                        <div className="divide-y rounded-xl border bg-card overflow-hidden">
                            {workspaces.map((ws) => (
                                <button
                                    key={ws.id}
                                    onClick={() => switchTo(ws.id)}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        {ws.logo_url ? (
                                            <img src={ws.logo_url} alt={ws.name} className="h-4 w-4 rounded-sm object-cover" />
                                        ) : (
                                            <Building2 className="h-4 w-4" />
                                        )}
                                    </div>
                                    <span className="font-medium truncate flex-1">{ws.name}</span>
                                    {ws.plan && (
                                        <Badge
                                            variant={ws.plan === 'Free' ? 'outline' : 'secondary'}
                                            className="text-[10px] px-1.5 py-0 shrink-0"
                                        >
                                            {ws.plan}
                                        </Badge>
                                    )}
                                    {ws.personal_workspace && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            Personal
                                        </span>
                                    )}
                                    {ws.role === 'owner' && (
                                        <Crown className="size-4 text-yellow-500 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Button variant="ghost" className="w-full" asChild>
                    <Link href="/logout" method="post" as="button">
                        Sign out
                    </Link>
                </Button>
            </div>
        </div>
    );
}
