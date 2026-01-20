'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface DangerousSituation {
  id: string;
  label: string;
  description?: string | null;
  category?: {
    id: string;
    label: string;
    code: string;
  } | null;
}

interface HazardComboboxProps {
  situations: DangerousSituation[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const getCategoryColor = (categoryCode?: string): string => {
  if (!categoryCode) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  const colors: Record<string, string> = {
    PHYSIQUE: 'bg-blue-100 text-blue-800 border-blue-200',
    CHIMIQUE: 'bg-purple-100 text-purple-800 border-purple-200',
    BIOLOGIQUE: 'bg-green-100 text-green-800 border-green-200',
    ORGANISATIONNEL: 'bg-gray-100 text-gray-800 border-gray-200',
    PSYCHOSOCIAL: 'bg-pink-100 text-pink-800 border-pink-200',
    MACHINES: 'bg-orange-100 text-orange-800 border-orange-200',
    DEPLACEMENTS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ENVIRONNEMENT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ERGONOMIQUE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    MECANIQUE: 'bg-orange-100 text-orange-800 border-orange-200',
    ELECTRIQUE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    INCENDIE: 'bg-red-100 text-red-800 border-red-200',
    AUTRE: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[categoryCode.toUpperCase()] || colors.AUTRE;
};

const getCategoryLabel = (category?: { label: string } | null): string => {
  return category?.label || 'Autre';
};

export function HazardCombobox({
  situations,
  value,
  onValueChange,
  placeholder = 'Sélectionner une situation dangereuse',
}: HazardComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedSituation = situations.find((s) => s.id === value);

  // Debug: vérifier que les situations sont bien reçues
  React.useEffect(() => {
    if (situations.length === 0) {
      console.warn('HazardCombobox: Aucune situation dangereuse disponible', {
        situationsCount: situations.length,
        situations: situations,
      });
    } else {
      console.log(`HazardCombobox: ${situations.length} situations dangereuses chargées`);
    }
  }, [situations]);

  // Grouper les situations par catégorie
  const groupedSituations = React.useMemo(() => {
    const groups: Record<string, DangerousSituation[]> = {};
    situations.forEach((situation) => {
      // Utiliser le code de catégorie ou 'AUTRE' si pas de catégorie
      const categoryKey = situation.category?.code || 'AUTRE';
      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(situation);
    });
    
    // Debug: vérifier le groupement
    if (situations.length > 0 && Object.keys(groups).length === 0) {
      console.error('[HazardCombobox] Erreur de groupement:', {
        situationsCount: situations.length,
        situations: situations.slice(0, 3).map(s => ({
          id: s.id,
          label: s.label,
          category: s.category,
        })),
      });
    }
    
    return groups;
  }, [situations]);

  // Filtrer les situations selon la recherche
  const filteredGroups = React.useMemo(() => {
    if (!search) return groupedSituations;

    const searchLower = search.toLowerCase();
    const filtered: Record<string, DangerousSituation[]> = {};
    
    Object.entries(groupedSituations).forEach(([categoryKey, categorySituations]) => {
      const categoryLabel = getCategoryLabel(categorySituations[0]?.category || null);
      // Vérifier si la recherche correspond à la catégorie
      const categoryMatches = categoryLabel.toLowerCase().includes(searchLower) ||
                             categoryKey.toLowerCase().includes(searchLower);
      
      // Filtrer les situations qui correspondent à la recherche
      const matching = categorySituations.filter(
        (situation) => {
          const labelMatch = situation.label.toLowerCase().includes(searchLower);
          const descriptionMatch = situation.description?.toLowerCase().includes(searchLower) || false;
          const categoryMatch = categoryMatches;
          
          return labelMatch || descriptionMatch || categoryMatch;
        }
      );
      
      // Si la catégorie correspond ou si des situations correspondent, inclure la catégorie
      if (categoryMatches || matching.length > 0) {
        filtered[categoryKey] = categoryMatches ? categorySituations : matching;
      }
    });
    return filtered;
  }, [groupedSituations, search]);

  // Debug: vérifier filteredGroups quand le popover s'ouvre
  React.useEffect(() => {
    if (open) {
      const totalSituations = Object.values(filteredGroups).flat().length;
      console.log('[HazardCombobox] Popover ouvert:', {
        totalSituations,
        categories: Object.keys(filteredGroups),
        groupedSituationsCount: Object.keys(groupedSituations).length,
        situationsCount: situations.length,
      });
    }
  }, [open, filteredGroups, groupedSituations, situations]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] py-2"
        >
          <div className="flex flex-wrap gap-1 flex-1 items-center">
            {selectedSituation ? (
              <>
                {selectedSituation.category && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'border text-xs',
                      getCategoryColor(selectedSituation.category.code)
                    )}
                  >
                    {getCategoryLabel(selectedSituation.category)}
                  </Badge>
                )}
                <span className="ml-1">{selectedSituation.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[500px] p-0 z-[9999]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher une situation dangereuse..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {Object.keys(filteredGroups).length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucune situation dangereuse trouvée.
              </div>
            )}
            {Object.keys(filteredGroups).length > 0 && (
              <>
                {Object.entries(filteredGroups).map(([categoryKey, categorySituations]) => {
                  const categoryLabel = getCategoryLabel(categorySituations[0]?.category || null);
                  return (
                    <CommandGroup key={categoryKey} heading={categoryLabel}>
                      {categorySituations.map((situation) => {
                        const handleSelect = () => {
                          console.log('[HazardCombobox] Sélection:', {
                            situationId: situation.id,
                            situationLabel: situation.label,
                          });
                          onValueChange(situation.id);
                          setOpen(false);
                          setSearch('');
                        };

                        return (
                          <div
                            key={situation.id}
                            role="option"
                            aria-selected={value === situation.id}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onPointerUp={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelect();
                            }}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                              "hover:bg-accent hover:text-accent-foreground",
                              "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                              value === situation.id && "bg-accent text-accent-foreground"
                            )}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                value === situation.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {situation.category && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs border pointer-events-none',
                                    getCategoryColor(situation.category.code)
                                  )}
                                >
                                  {getCategoryLabel(situation.category)}
                                </Badge>
                              )}
                              <span className="pointer-events-none">{situation.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

