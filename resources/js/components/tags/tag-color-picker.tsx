import { cn } from '@/lib/utils';

const PRESET_COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#0ea5e9', // Sky
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#64748b', // Slate
];

interface TagColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export function TagColorPicker({ value, onChange }: TagColorPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className={cn(
                        'h-8 w-8 rounded-full transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        value === color &&
                            'scale-110 ring-2 ring-primary ring-offset-2',
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                />
            ))}
        </div>
    );
}
