import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { aceitarConvite } from '@/lib/actions/convites';
import { AuthShell, Aviso, LinkTexto } from '@/components/auth/ui';

function decodificar(token: string): string {
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const token = decodificar((await params).token);

  // Sem configuração do Supabase não há sessão (mesma regra do middleware).
  const configurado = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const user = configurado ? (await (await createClient()).auth.getUser()).data.user : null;
  if (!user) {
    redirect(`/criar-conta?next=${encodeURIComponent(`/convite/${encodeURIComponent(token)}`)}`);
  }

  const resultado = await aceitarConvite(token);
  if ('ok' in resultado) redirect('/mes');

  return (
    <AuthShell titulo="Convite">
      <Aviso>{resultado.erro}</Aviso>
      <nav className="flex flex-col">
        <LinkTexto href="/mes">Ir para o início</LinkTexto>
      </nav>
    </AuthShell>
  );
}
