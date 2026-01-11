'use client';

import { HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'default' | 'info';
  className?: string;
  iconClassName?: string;
}

/**
 * Composant tooltip d'aide avec icône
 * Accessible et optimisé pour l'UX
 */
export function HelpTooltip({
  content,
  side = 'top',
  variant = 'default',
  className,
  iconClassName,
}: HelpTooltipProps) {
  const Icon = variant === 'info' ? Info : HelpCircle;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'text-muted-foreground hover:text-foreground transition-colors',
              className
            )}
            aria-label={`Information: ${content}`}
            aria-describedby="help-tooltip"
          >
            <Icon
              className={cn('h-4 w-4', iconClassName)}
              aria-hidden="true"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-xs text-base font-normal leading-relaxed z-50"
          id="help-tooltip"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Composant Label avec tooltip d'aide intégré
 * Pour les formulaires
 */
interface LabelWithHelpProps {
  label: string;
  helpText?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function LabelWithHelp({
  label,
  helpText,
  required = false,
  htmlFor,
  className,
}: LabelWithHelpProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={htmlFor}
        className={cn('text-base font-semibold', className)}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="requis">*</span>}
      </label>
      {helpText && (
        <HelpTooltip content={helpText} side="right" />
      )}
    </div>
  );
}

