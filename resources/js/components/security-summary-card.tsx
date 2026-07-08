import { Github, Google } from '@/components/brand-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import axios from 'axios';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Key,
    Lock,
    Shield,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SecuritySummaryData {
    authentication: {
        password: {
            enabled: boolean;
            last_changed_at: string | null;
        };
        two_factor: {
            enabled: boolean;
            confirmed_at: string | null;
        };
        social_accounts: Array<{
            id: number;
            provider: string;
            provider_name: string;
            connected_at: string;
        }>;
    };
    security_score: number;
    recommendations: Array<{
        text: string;
        priority: 'high' | 'medium' | 'low';
        action?: string;
    }>;
}

const ProviderIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    github: Github,
    google: Google,
};

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
}

function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-amber-600';
    if (score >= 40) return 'bg-orange-600';
    return 'bg-red-600';
}

function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
        case 'medium':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        default:
            return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
}

export function SecuritySummaryCard() {
    const { formatDate } = useDateFormatter();
    const [data, setData] = useState<SecuritySummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
            .get<SecuritySummaryData>('/settings/security-summary')
            .then(({ data }) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(
                    err.response?.data?.message ??
                        'Failed to load security summary',
                );
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Spinner className="h-6 w-6" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm">
                            Failed to load security summary
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { authentication, security_score, recommendations } = data;
    const scoreColor = getScoreColor(security_score);
    const scoreBgColor = getScoreBgColor(security_score);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Authentication Methods
                        </CardTitle>
                        <CardDescription>
                            Manage how you sign in to your account
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${scoreColor}`}>
                            {security_score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Security Score
                        </div>
                    </div>
                </div>
                <Progress
                    value={security_score}
                    className={`h-2 ${scoreBgColor}`}
                />
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Password */}
                <div className="flex items-start gap-4">
                    <div
                        className={`rounded-full p-2 ${authentication.password.enabled ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'}`}
                    >
                        <Lock
                            className={`h-4 w-4 ${authentication.password.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Password</span>
                            {authentication.password.enabled ? (
                                <Badge
                                    variant="outline"
                                    className="border-green-200 text-green-600 dark:border-green-800"
                                >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Set
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-red-200 text-red-600 dark:border-red-800"
                                >
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Not set
                                </Badge>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Last changed:{' '}
                            {formatDate(
                                authentication.password.last_changed_at,
                                { fallback: 'Never' },
                            )}
                        </p>
                        {!authentication.password.enabled && (
                            <Button
                                variant="link"
                                size="sm"
                                className="mt-1 h-auto p-0"
                                asChild
                            >
                                <a href="/settings/password">Set password →</a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-start gap-4">
                    <div
                        className={`rounded-full p-2 ${authentication.two_factor.enabled ? 'bg-green-100 dark:bg-green-950' : 'bg-amber-100 dark:bg-amber-950'}`}
                    >
                        <Key
                            className={`h-4 w-4 ${authentication.two_factor.enabled ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">
                                Two-Factor Authentication
                            </span>
                            {authentication.two_factor.enabled ? (
                                <Badge
                                    variant="outline"
                                    className="border-green-200 text-green-600 dark:border-green-800"
                                >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Enabled
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 text-amber-600 dark:border-amber-800"
                                >
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Disabled
                                </Badge>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {authentication.two_factor.enabled
                                ? `Enabled on ${formatDate(authentication.two_factor.confirmed_at, { fallback: 'Never' })}`
                                : 'Add an extra layer of security to your account'}
                        </p>
                        {!authentication.two_factor.enabled && (
                            <Button
                                variant="link"
                                size="sm"
                                className="mt-1 h-auto p-0"
                                asChild
                            >
                                <a href="/settings/two-factor">Enable 2FA →</a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Social Accounts */}
                <div className="flex items-start gap-4">
                    <div
                        className={`rounded-full p-2 ${authentication.social_accounts.length > 0 ? 'bg-green-100 dark:bg-green-950' : 'bg-muted'}`}
                    >
                        <Shield
                            className={`h-4 w-4 ${authentication.social_accounts.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Social Accounts</span>
                            <Badge variant="secondary">
                                {authentication.social_accounts.length}{' '}
                                connected
                            </Badge>
                        </div>
                        {authentication.social_accounts.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {authentication.social_accounts.map(
                                    (account) => {
                                        const Icon =
                                            ProviderIcons[account.provider] ||
                                            Shield;
                                        return (
                                            <div
                                                key={account.id}
                                                className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {account.provider_name}
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                                No social accounts connected
                            </p>
                        )}
                        <Button
                            variant="link"
                            size="sm"
                            className="mt-1 h-auto p-0"
                            asChild
                        >
                            <a href="/settings/connected-accounts">
                                {authentication.social_accounts.length > 0
                                    ? 'Manage connections →'
                                    : 'Connect accounts →'}
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                        <p className="text-sm font-medium">Recommendations</p>
                        {recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Badge
                                    className={`${getPriorityColor(rec.priority)} shrink-0 text-xs capitalize`}
                                >
                                    {rec.priority}
                                </Badge>
                                <div className="flex-1">
                                    <p className="text-sm">{rec.text}</p>
                                    {rec.action && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="mt-0.5 h-auto p-0"
                                            asChild
                                        >
                                            <a href={rec.action}>
                                                Take action{' '}
                                                <ArrowRight className="ml-1 h-3 w-3" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Perfect Score Message */}
                {security_score === 100 && recommendations.length === 0 && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-300">
                            Great job! Your account is fully secured.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
