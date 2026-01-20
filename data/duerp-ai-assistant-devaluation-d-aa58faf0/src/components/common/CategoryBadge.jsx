import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categoryConfig = {
  physique: { label: 'Physique', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  chimique: { label: 'Chimique', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  biologique: { label: 'Biologique', className: 'bg-green-100 text-green-700 border-green-200' },
  organisationnel: { label: 'Organisationnel', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  psychosocial: { label: 'Psychosocial', className: 'bg-pink-100 text-pink-700 border-pink-200' },
  machines: { label: 'Machines', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  deplacements: { label: 'Déplacements', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  environnement: { label: 'Environnement', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  autre: { label: 'Autre', className: 'bg-gray-100 text-gray-700 border-gray-200' }
};

export default function CategoryBadge({ category, size = 'default' }) {
  const config = categoryConfig[category] || categoryConfig.autre;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium",
        config.className,
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'lg' && "text-sm px-3 py-1"
      )}
    >
      {config.label}
    </Badge>
  );
}