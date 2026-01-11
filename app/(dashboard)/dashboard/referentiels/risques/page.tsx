import { RiskLibrary } from '@/components/referentiel/risk-library';

export default async function RisksLibraryPage() {
  // L'authentification est vérifiée au niveau du layout dashboard

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bibliothèque de risques sectoriels
        </h1>
        <p className="mt-2 text-gray-600">
          Consultez les risques fréquemment observés dans différents secteurs d'activité.
          Ces références sont indicatives et doivent être adaptées à votre situation réelle.
        </p>
      </div>

      <RiskLibrary />
    </div>
  );
}

