import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Inscription confirmée | DUERPilot',
  description: 'Votre inscription à la liste d\'attente DUERPilot a été confirmée. Vous serez informé en priorité du lancement.',
  robots: 'noindex, nofollow',
};

export default function ConfirmationPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Header Simple */}
      <header className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-blue-600">DUERPilot</span>
            </Link>
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition text-sm md:text-base"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          
          {/* Card de confirmation */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transition-all duration-300">
            
            {/* Icône de succès */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 transition-transform duration-300 hover:scale-110">
                <svg 
                  className="w-12 h-12 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              
              {/* Titre principal */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Inscription confirmée ✅
              </h1>
            </div>
            
            {/* Texte principal */}
            <div className="text-center mb-8">
              <p className="text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
                Merci pour votre intérêt pour <strong className="text-gray-900">DUERPilot</strong>.
              </p>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Vous êtes désormais inscrit à la liste d&apos;attente et serez informé en priorité du lancement.
              </p>
            </div>
            
            {/* Bloc rassurance */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Vos données sont en sécurité
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg 
                    className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm md:text-base">
                    <strong>Données sécurisées</strong> : Vos informations sont protégées et conformes au RGPD
                  </span>
                </li>
                <li className="flex items-start">
                  <svg 
                    className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm md:text-base">
                    <strong>Aucun spam</strong> : Nous vous contacterons uniquement pour vous informer du lancement
                  </span>
                </li>
                <li className="flex items-start">
                  <svg 
                    className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm md:text-base">
                    <strong>Désinscription possible à tout moment</strong> : Un lien de désinscription est inclus dans chaque email
                  </span>
                </li>
              </ul>
            </div>
            
            {/* Texte secondaire */}
            <div className="text-center mb-8">
              <p className="text-base text-gray-600 leading-relaxed">
                En attendant le lancement, nous préparons une solution simple et conforme pour la gestion du DUERP.
              </p>
            </div>
            
            {/* Appels à l'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
            
            {/* Lien politique de confidentialité */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                <Link 
                  href="/landing/legal/politique-confidentialite.html" 
                  className="text-blue-600 hover:underline"
                >
                  Politique de confidentialité
                </Link>
              </p>
            </div>
            
          </div>
          
          {/* Badge Early Adopters (optionnel) */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg px-6 py-3">
              <p className="text-sm md:text-base font-semibold">
                🎁 Early Adopter : -30% pendant 3 mois + Onboarding offert
              </p>
            </div>
          </div>
          
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 DUERPilot. Tous droits réservés.</p>
            <p className="mt-2">
              <Link 
                href="/landing/legal/mentions-legales.html" 
                className="text-blue-600 hover:underline mr-4"
              >
                Mentions légales
              </Link>
              <Link 
                href="/landing/legal/politique-confidentialite.html" 
                className="text-blue-600 hover:underline"
              >
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

