import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagBadgeProps {
    name: string;
    color: string;
    onRemove?: () => void;
    className?: string;
}

export function TagBadge({ name, color, onRemove, className }: TagBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                className,
            )}
            style={{
                backgroundColor: `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
            }}
        >
            {name}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="transition-opacity hover:opacity-70"
                    type="button"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </span>
    );
}
