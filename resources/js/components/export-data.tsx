import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { DownloadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ExportData() {
    const { t } = useTranslations();
    const { post, processing } = useForm();

    const exportData = () => {
        post('/settings/export-data', {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="text-foreground">
                    {t('settings.export.title', 'Export Account Data')}
                </CardTitle>
                <CardDescription>
                    {t('settings.export.description', 'Download a copy of your personal data, workspaces, and activity logs. The export process runs in the background. You will receive an email with a secure download link once it is ready.')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={exportData}
                    disabled={processing}
                    variant="outline"
                >
                    {processing ? (
                        <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                        <DownloadCloud className="mr-2 h-4 w-4" />
                    )}
                    {t('settings.export.button', 'Request Data Export')}
                </Button>
            </CardContent>
        </Card>
    );
}
