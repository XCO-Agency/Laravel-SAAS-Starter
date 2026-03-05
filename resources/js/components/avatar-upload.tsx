import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

// Using simple HTML image upload and form components since standard react-crop can be complex to integrate perfectly in this step.
// We will focus on the UI flow, which includes previewing the image, making the request to the backend, and displaying errors.

interface AvatarUploadProps {
    currentUrl?: string | null;
    uploadUrl: string;
    deleteUrl: string;
    onSuccess?: () => void;
    label?: string;
    description?: string;
}

export default function AvatarUpload({
    currentUrl,
    uploadUrl,
    deleteUrl,
    onSuccess,
    label = 'Profile Picture',
    description = 'Upload a new avatar. Recommended size is 256x256px.',
}: AvatarUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset error
        setError(null);

        // Validate basic file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }

        // Validate basic file size (< 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be less than 2MB.');
            return;
        }

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Auto upload
        handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Setup CSRF/fetch, but Inertia is better if possible. Here we use fetch to upload manually since we don't have UseForm readily passing files perfectly with progress in this custom wrapper without redefining form state.
            // Wait, we can use axios for CSRF cookie support out of the box in Laravel.
            const axios = (await import('axios')).default;

            await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (onSuccess) onSuccess();
            // We do not clear preview on success unless parent changes currentUrl which remounts or we just rely on parent
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
            setPreviewUrl(null); // Revert
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const axios = (await import('axios')).default;
            await axios.delete(deleteUrl);
            setPreviewUrl(null);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete image. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const displayUrl = previewUrl || currentUrl;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative group shrink-0">
                <div className="flex h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-sm ring-1 ring-border sm:h-32 sm:w-32">
                    {displayUrl ? (
                        <img src={displayUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12" />
                        </div>
                    )}
                </div>

                <div
                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="h-6 w-6 text-white" />
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <div>
                    <h3 className="text-lg font-medium">{label}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isDeleting}
                    >
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload Image
                    </Button>

                    {currentUrl && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isUploading || isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    )}
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
        </div>
    );
}
