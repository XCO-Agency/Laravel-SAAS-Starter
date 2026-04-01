import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    iconClassName?: string;
}

/**
 * A small info icon that shows contextual help text on hover.
 * Use alongside form labels and section headings to guide users.
 */
export function HelpTooltip({
    content,
    side = 'top',
    className,
    iconClassName,
}: HelpTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'inline-flex items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                        className,
                    )}
                    aria-label="Help"
                >
                    <HelpCircle className={cn('h-3.5 w-3.5', iconClassName)} />
                </button>
            </TooltipTrigger>
            <TooltipContent
                side={side}
                className="max-w-xs text-xs leading-relaxed"
            >
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
