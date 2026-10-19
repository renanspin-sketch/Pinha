import { redirect } from 'next/navigation';
import { getCurrentSpace } from '@/lib/espaco';
import { AuthShell } from '@/components/auth/ui';
import { CriarEspacoForm } from '@/components/espaco/CriarEspacoForm';

export default async function ComecarPage() {
  if (await getCurrentSpace()) redirect('/mes');
  return (
    <AuthShell titulo="Vamos criar o espaço da sua casa">
      <CriarEspacoForm />
    </AuthShell>
  );
}
