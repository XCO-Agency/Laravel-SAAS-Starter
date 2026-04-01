import {
    AlignLeft,
    Calendar,
    Hash,
    Link,
    List,
    ToggleLeft,
    Type,
} from 'lucide-react';

interface FieldTypeIconProps {
    type: string;
    className?: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    text: Type,
    textarea: AlignLeft,
    number: Hash,
    date: Calendar,
    boolean: ToggleLeft,
    select: List,
    url: Link,
};

export function FieldTypeIcon({ type, className }: FieldTypeIconProps) {
    const Icon = ICONS[type] || Type;
    return <Icon className={className} />;
}

export function getFieldTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        text: 'Text (Single Line)',
        textarea: 'Text (Multi Line)',
        number: 'Number',
        date: 'Date',
        boolean: 'Yes/No Toggle',
        select: 'Dropdown Select',
        url: 'URL/Link',
    };
    return labels[type] || type;
}
