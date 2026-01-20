import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-config';
import { AssistantDUERPWizard } from '@/components/assistance/assistant-duerp-wizard';

export const metadata = {
  title: 'Assistant DUERP - DUERP AI',
  description: 'Créez votre DUERP en 4 étapes guidées avec l\'assistance de l\'IA',
};

export default async function AssistancePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto py-6">
      <AssistantDUERPWizard />
    </div>
  );
}
