import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    type Crop,
    type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspect?: number;
    circularCrop?: boolean;
}

export default function ImageCropper({
    imageSrc,
    onCropComplete,
    onCancel,
    aspect = 1,
    circularCrop = true,
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect,
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);
    }

    async function getCroppedImg(
        image: HTMLImageElement,
        crop: PixelCrop
    ): Promise<Blob> {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    }

    const handleSave = async () => {
        if (imgRef.current && completedCrop) {
            try {
                const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
                onCropComplete(croppedBlob);
            } catch (e) {
                console.error('Error cropping image', e);
            }
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>
                        Adjust the selection to crop your image.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center bg-muted p-4 rounded-md overflow-hidden max-h-[400px]">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop={circularCrop}
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imageSrc}
                            onLoad={onImageLoad}
                            style={{ maxWidth: '100%', maxHeight: '350px' }}
                        />
                    </ReactCrop>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
