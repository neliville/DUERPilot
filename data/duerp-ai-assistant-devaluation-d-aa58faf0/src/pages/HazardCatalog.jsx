import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CategoryBadge from '../components/common/CategoryBadge';
import EmptyState from '../components/common/EmptyState';
import { 
  Search, 
  Filter,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const categories = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'physique', label: 'Physique' },
  { value: 'chimique', label: 'Chimique' },
  { value: 'biologique', label: 'Biologique' },
  { value: 'organisationnel', label: 'Organisationnel' },
  { value: 'psychosocial', label: 'Psychosocial' },
  { value: 'machines', label: 'Machines' },
  { value: 'deplacements', label: 'Déplacements' },
  { value: 'environnement', label: 'Environnement' },
  { value: 'autre', label: 'Autre' }
];

export default function HazardCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: hazards = [], isLoading } = useQuery({
    queryKey: ['hazards'],
    queryFn: () => base44.entities.HazardRef.filter({ is_active: true }),
  });

  // Filter hazards
  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch = searchTerm === '' || 
      hazard.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.examples?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hazard.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || hazard.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedHazards = filteredHazards.reduce((acc, hazard) => {
    const cat = hazard.category || 'autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(hazard);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Référentiel des dangers</h1>
          <p className="text-slate-500 mt-1">
            {hazards.length} dangers référencés (source: INRS)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un danger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredHazards.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={BookOpen}
              title="Aucun danger trouvé"
              description="Modifiez vos critères de recherche"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedHazards).map(([category, hazardList]) => (
            <Card key={category}>
              <CardHeader className="py-3 px-4 bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={category} />
                    <span className="text-sm text-slate-500">
                      {hazardList.length} danger{hazardList.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {hazardList.map((hazard) => (
                    <AccordionItem key={hazard.id} value={hazard.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium text-slate-900">{hazard.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 pl-7">
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">Description</p>
                            <p className="text-sm text-slate-600">{hazard.description}</p>
                          </div>
                          
                          {hazard.examples && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Exemples de situations</p>
                              <p className="text-sm text-slate-600">{hazard.examples}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            {hazard.source && (
                              <Badge variant="outline" className="text-xs">
                                Source: {hazard.source}
                              </Badge>
                            )}
                            {hazard.keywords && hazard.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {hazard.keywords.slice(0, 4).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}