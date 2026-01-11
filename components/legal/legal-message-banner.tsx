'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, FileText, Users, RefreshCw, FileCheck } from 'lucide-react';
import {
  LEGAL_RESPONSIBILITY_MESSAGE,
  AI_ASSISTANCE_MESSAGE,
  PAPRIPACT_REQUIREMENT_MESSAGE,
  WORKER_PARTICIPATION_MESSAGE,
  DUERP_UPDATE_REQUIREMENT_MESSAGE,
  TRACEABILITY_MESSAGE,
  type LegalMessage,
} from '@/lib/legal-messages';

interface LegalMessageBannerProps {
  type: 'responsibility' | 'ai' | 'papripact' | 'participation' | 'update' | 'traceability';
  employeeCount?: number | null;
  className?: string;
}

const iconMap = {
  responsibility: AlertTriangle,
  ai: Info,
  papripact: FileText,
  participation: Users,
  update: RefreshCw,
  traceability: FileCheck,
};

const variantMap = {
  warning: 'destructive',
  info: 'default',
} as const;

export function LegalMessageBanner({ type, employeeCount, className }: LegalMessageBannerProps) {
  let message: LegalMessage | null = null;

  switch (type) {
    case 'responsibility':
      message = LEGAL_RESPONSIBILITY_MESSAGE;
      break;
    case 'ai':
      message = AI_ASSISTANCE_MESSAGE;
      break;
    case 'papripact':
      if (employeeCount !== null && employeeCount !== undefined && employeeCount >= 50) {
        message = PAPRIPACT_REQUIREMENT_MESSAGE;
      } else {
        return null; // Ne pas afficher si non éligible
      }
      break;
    case 'participation':
      message = WORKER_PARTICIPATION_MESSAGE;
      break;
    case 'update':
      message = DUERP_UPDATE_REQUIREMENT_MESSAGE;
      break;
    case 'traceability':
      message = TRACEABILITY_MESSAGE;
      break;
  }

  if (!message) {
    return null;
  }

  const Icon = iconMap[type];

  return (
    <Alert variant={variantMap[message.variant]} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription className="mt-2">{message.content}</AlertDescription>
    </Alert>
  );
}

