import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

const priorityConfig = {
  prioritaire: {
    label: 'Prioritaire',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
    icon: AlertTriangle,
    iconClass: 'text-red-600'
  },
  a_ameliorer: {
    label: 'À améliorer',
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
    icon: AlertCircle,
    iconClass: 'text-amber-600'
  },
  faible: {
    label: 'Faible',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600'
  }
};

export default function RiskBadge({ level, score, showScore = false, size = 'default' }) {
  const config = priorityConfig[level] || priorityConfig.faible;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium gap-1.5",
        config.className,
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'lg' && "text-sm px-3 py-1.5"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.iconClass)} />
      {config.label}
      {showScore && score !== undefined && (
        <span className="ml-1 font-bold">({score})</span>
      )}
    </Badge>
  );
}