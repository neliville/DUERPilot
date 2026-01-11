'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
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

  // Grouper les situations par catégorie
  const groupedSituations = React.useMemo(() => {
    const groups: Record<string, DangerousSituation[]> = {};
    situations.forEach((situation) => {
      const categoryKey = situation.category?.code || 'AUTRE';
      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(situation);
    });
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher une situation dangereuse..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Aucune situation dangereuse trouvée.</CommandEmpty>
            {Object.entries(filteredGroups).map(([categoryKey, categorySituations]) => {
              const categoryLabel = getCategoryLabel(categorySituations[0]?.category || null);
              return (
                <CommandGroup key={categoryKey} heading={categoryLabel}>
                  {categorySituations.map((situation) => (
                    <CommandItem
                      key={situation.id}
                      value={situation.id}
                      onSelect={(currentValue) => {
                        // Vérifier que la valeur correspond bien
                        if (currentValue === situation.id) {
                          onValueChange(situation.id);
                          setOpen(false);
                          setSearch('');
                        }
                      }}
                      onMouseDown={(e) => {
                        // Empêcher le blur du champ de recherche
                        e.preventDefault();
                        onValueChange(situation.id);
                        setOpen(false);
                        setSearch('');
                      }}
                      className="cursor-pointer"
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
                              'text-xs border',
                              getCategoryColor(situation.category.code)
                            )}
                          >
                            {getCategoryLabel(situation.category)}
                          </Badge>
                        )}
                        <span>{situation.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

