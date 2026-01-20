import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  a_faire: {
    label: 'À faire',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock
  },
  en_cours: {
    label: 'En cours',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: PlayCircle
  },
  bloque: {
    label: 'Bloqué',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: PauseCircle
  },
  termine: {
    label: 'Terminé',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2
  }
};

export default function StatusBadge({ status, showIcon = true }) {
  const config = statusConfig[status] || statusConfig.a_faire;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn("font-medium gap-1.5", config.className)}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </Badge>
  );
}