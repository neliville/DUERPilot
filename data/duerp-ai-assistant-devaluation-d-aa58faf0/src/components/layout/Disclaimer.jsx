import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Disclaimer({ className, variant = 'default' }) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border",
      variant === 'default' && "bg-amber-50 border-amber-200 text-amber-800",
      variant === 'pdf' && "bg-slate-50 border-slate-200 text-slate-700",
      className
    )}>
      <AlertTriangle className={cn(
        "w-5 h-5 flex-shrink-0 mt-0.5",
        variant === 'default' && "text-amber-600",
        variant === 'pdf' && "text-slate-500"
      )} />
      <p className="text-sm leading-relaxed">
        Ce document a été généré avec l'assistance d'un outil numérique. 
        La responsabilité de l'évaluation et des décisions reste celle de l'employeur.
      </p>
    </div>
  );
}