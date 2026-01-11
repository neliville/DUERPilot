'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { cn } from '@/lib/utils';

interface CardWithHelpProps {
  title: string;
  helpText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/**
 * Composant Card avec tooltip d'aide intégré
 * Pour les KPIs et métriques
 */
export function CardWithHelp({
  title,
  helpText,
  icon,
  children,
  className,
  headerClassName,
}: CardWithHelpProps) {
  return (
    <Card className={className}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", headerClassName)}>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {helpText && <HelpTooltip content={helpText} side="top" />}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

