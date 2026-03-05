import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
                        'inline-flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                        className,
                    )}
                    aria-label="Help"
                >
                    <HelpCircle className={cn('h-3.5 w-3.5', iconClassName)} />
                </button>
            </TooltipTrigger>
            <TooltipContent side={side} className="max-w-xs text-xs leading-relaxed">
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
