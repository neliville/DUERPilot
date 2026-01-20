'use client';

import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recherche</h1>
        <p className="text-gray-500 mt-2">
          Recherchez des dangers, des sites, des évaluations et plus encore
        </p>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-lg"
              autoFocus
            />
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {searchQuery ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Résultats pour "{searchQuery}"
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalité en développement</CardTitle>
              <CardDescription>
                La recherche globale sera bientôt disponible. Elle permettra de rechercher dans :
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Les dangers du référentiel INRS</li>
                <li>Les sites et unités de travail</li>
                <li>Les évaluations de risques</li>
                <li>Les observations et mesures de prévention</li>
                <li>Les documents et rapports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Entrez un terme de recherche pour commencer</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
