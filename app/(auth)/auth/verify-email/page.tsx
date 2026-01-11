'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/trpc/client';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Si pas d'email dans l'URL, rediriger vers la connexion
      router.push('/auth/signin');
    }
  }, [searchParams, router]);

  const verifyMutation = api.auth.verifyEmail.useMutation({
    onSuccess: () => {
      toast({
        title: 'Email vérifié',
        description: 'Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.',
      });
      router.push('/auth/signin');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Code de vérification incorrect',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const resendMutation = api.auth.resendVerificationCode.useMutation({
    onSuccess: () => {
      toast({
        title: 'Code renvoyé',
        description: 'Un nouveau code de vérification a été envoyé à votre email.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le code',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsResending(false);
    },
  });

  const handleCodeChange = (index: number, value: string) => {
    // Ne permettre que les chiffres
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passer automatiquement au champ suivant
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Supprimer et revenir au champ précédent
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      // Focus sur le dernier champ
      const lastInput = document.getElementById('code-5');
      lastInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast({
        title: 'Code incomplet',
        description: 'Veuillez entrer les 6 chiffres du code de vérification',
        variant: 'destructive',
      });
      return;
    }

    if (!email) {
      toast({
        title: 'Email manquant',
        description: 'Email non trouvé. Veuillez vous réinscrire.',
        variant: 'destructive',
      });
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    await verifyMutation.mutateAsync({
      email,
      code: fullCode,
    });
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: 'Email manquant',
        description: 'Email non trouvé',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    await resendMutation.mutateAsync({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Vérification de l'email
          </CardTitle>
          <CardDescription className="text-center">
            Entrez le code à 6 chiffres envoyé à <strong>{email || 'votre email'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    disabled={isLoading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                Le code est valide pendant 15 minutes
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || code.join('').length !== 6}>
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Renvoyer le code
                  </>
                )}
              </button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/auth/signin')}
                className="w-full mt-2"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
