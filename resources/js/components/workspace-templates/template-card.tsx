import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Copy, Rocket, Users, BarChart3, Palette, Headphones, Star, Zap, Briefcase, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building,
  code: Code,
  rocket: Rocket,
  briefcase: Briefcase,
  palette: Palette,
  headphones: Headphones,
  'chart-bar': BarChart3,
  users: Users,
  star: Star,
  zap: Zap,
};

const CATEGORIES: Record<string, string> = {
  general: 'General',
  development: 'Development',
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  design: 'Design',
  operations: 'Operations',
};

interface Template {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  user: {
    name: string;
  };
}

interface TemplateCardProps {
  template: Template;
  onUse?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  showActions?: boolean;
  className?: string;
}

export function TemplateCard({
  template,
  onUse,
  onDuplicate,
  showActions = true,
  className,
}: TemplateCardProps) {
  const Icon = ICONS[template.icon] || Building;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>
                by {template.user?.name || 'Unknown'}
                {template.is_public && (
                  <Badge variant="secondary" className="ml-2">
                    Public
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {template.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{CATEGORIES[template.category] || template.category}</Badge>
          <span>·</span>
          <span>Used {template.usage_count} times</span>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onUse?.(template)}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Use Template
          </Button>
          {onDuplicate && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDuplicate(template)}
              title="Duplicate template"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
