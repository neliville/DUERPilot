'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';
import { api } from '@/lib/trpc/client';

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // S'assurer que isLoading est réinitialisé au montage du composant
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const registerMutation = api.auth.register.useMutation({
    onError: (error) => {
      console.error('❌ Erreur inscription:', error);
      setIsLoading(false);
      toast({
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue lors de l\'inscription',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      console.log('✅ Inscription réussie');
      setIsLoading(false);
      toast({
        title: 'Inscription réussie',
        description: 'Un code de vérification a été envoyé à votre email. Veuillez vérifier votre boîte de réception.',
      });
      // Rediriger vers la page de vérification email
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }, 500);
    },
    onSettled: () => {
      // S'assurer que isLoading est toujours réinitialisé
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 handleSubmit called', { isSignUp, email, password });

    if (isSignUp) {
      // Vérifier que les mots de passe correspondent
      if (password !== confirmPassword) {
        toast({
          title: 'Erreur',
          description: 'Les mots de passe ne correspondent pas',
          variant: 'destructive',
        });
        return;
      }

      // Vérifier la longueur du mot de passe
      if (password.length < 6) {
        toast({
          title: 'Erreur',
          description: 'Le mot de passe doit contenir au moins 6 caractères',
          variant: 'destructive',
        });
        return;
      }

      // Activer le loading avant la mutation
      setIsLoading(true);
      
      console.log('📝 Tentative d\'inscription pour:', email);
      
      // Inscription - utiliser mutate au lieu de mutateAsync pour éviter les blocages
      try {
        registerMutation.mutate({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
        console.log('✅ Mutation déclenchée');
      } catch (mutateError) {
        console.error('❌ Erreur lors de la mutation:', mutateError);
        setIsLoading(false);
        toast({
          title: 'Erreur',
          description: 'Impossible de déclencher l\'inscription',
          variant: 'destructive',
        });
      }
      // Ne pas attendre, les callbacks onSuccess/onError géreront le reste
      return;
    }
    
    // Connexion
    console.log('🔐 Tentative de connexion pour:', email);
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      console.log('📊 Résultat signIn:', result);

      if (result?.error) {
        // Vérifier si l'email n'est pas vérifié
        if (result.error === 'CredentialsSignin') {
          // Vérifier si l'utilisateur existe mais l'email n'est pas vérifié
          try {
            // Utiliser fetch directement car checkEmailVerification est une query
            const response = await fetch(`/api/trpc/auth.checkEmailVerification?input=${encodeURIComponent(JSON.stringify({ email }))}`);
            if (response.ok) {
              const data = await response.json();
              if (data.result?.data && !data.result.data.emailVerified) {
                toast({
                  title: 'Email non vérifié',
                  description: 'Veuillez vérifier votre email avant de vous connecter.',
                });
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                setIsLoading(false);
                return;
              }
            }
          } catch {
            // L'utilisateur n'existe pas ou autre erreur, continuer avec le message d'erreur générique
          }
        }
        
        // Gérer les autres erreurs
        let errorMessage = 'Email ou mot de passe incorrect';
        
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (result.error === 'Configuration') {
          errorMessage = 'Erreur de configuration. Veuillez contacter le support.';
        } else if (result.error === 'AccessDenied') {
          errorMessage = 'Accès refusé. Votre compte n\'a peut-être pas été activé.';
        }
        
        toast({
          title: 'Erreur de connexion',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      if (result?.ok) {
        // Connexion réussie - rediriger vers la page d'accueil qui gère la redirection appropriée
        // (super admin -> /admin, autres -> /onboarding ou /dashboard)
        toast({
          title: 'Connexion réussie',
          description: 'Redirection en cours...',
        });
        // Utiliser window.location pour forcer un rechargement complet et éviter les problèmes de session
        // Augmenter le délai pour s'assurer que la session JWT est établie côté serveur
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        return;
      }
      
      // Cas où result n'a ni error ni ok
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
      setIsLoading(false);
    } catch (signInError: unknown) {
      console.error('Erreur lors de la connexion:', signInError);
      const errorMessage = signInError instanceof Error ? signInError.message : 'Une erreur est survenue lors de la connexion';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">DU</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            DUERP AI
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Votre prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Votre nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  autoComplete="new-password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md transition-all duration-200" 
              disabled={isLoading || registerMutation.isPending}
            >
              {isLoading || registerMutation.isPending
                ? 'Traitement...'
                : isSignUp
                  ? 'S\'inscrire'
                  : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              {isSignUp ? (
                <span>
                  Vous avez déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer underline bg-transparent border-none p-0 m-0"
                  >
                    Se connecter
                  </button>
                </span>
              ) : (
                <span>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer underline relative z-10 bg-transparent border-none p-0 m-0"
                  >
                    S'inscrire
                  </button>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
