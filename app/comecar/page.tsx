import { redirect } from 'next/navigation';
import { getCurrentSpace } from '@/lib/espaco';
import { AuthShell } from '@/components/auth/ui';
import { CriarEspacoForm } from '@/components/espaco/CriarEspacoForm';

export default async function ComecarPage() {
  if (await getCurrentSpace()) redirect('/mes');
  return (
    <AuthShell titulo="Vamos criar o espaço da sua casa">
      <CriarEspacoForm />
      <p className="text-ink-muted" style={{ fontWeight: 600 }}>
        Recebeu um convite? Abra o link que te mandaram.
      </p>
    </AuthShell>
  );
}
