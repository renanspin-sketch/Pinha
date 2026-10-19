import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mensagemErroConvite } from '@/lib/convites';
import { AuthShell, Aviso, LinkTexto } from '@/components/auth/ui';
import { AceitarConviteForm } from '@/components/convite/AceitarConviteForm';

type Situacao = 'valido' | 'ja_membro' | 'invalido' | 'expirado' | 'usado';
type Previa = { space_nome: string | null; convidado_por: string | null; situacao: Situacao };

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
  const supabase = configurado ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!supabase || !user) {
    redirect(`/criar-conta?next=${encodeURIComponent(`/convite/${encodeURIComponent(token)}`)}`);
  }

  // Abrir o link só mostra o convite; aceitar é um clique (GET não muda nada).
  const { data, error } = await supabase.rpc('preview_invite', { p_token: token });
  const previa = (Array.isArray(data) ? data[0] : data) as Previa | null | undefined;

  if (!error && previa?.situacao === 'valido') {
    return (
      <AuthShell titulo={`Entrar no espaço ${previa.space_nome ?? ''}?`}>
        <p className="text-ink" style={{ fontWeight: 600 }}>
          {previa.convidado_por ? `${previa.convidado_por} convidou você.` : 'Você recebeu um convite.'}
        </p>
        <AceitarConviteForm token={token} rotulo="Entrar no espaço" />
        <nav className="flex flex-col">
          <LinkTexto href="/mes">Agora não</LinkTexto>
        </nav>
      </AuthShell>
    );
  }

  if (!error && previa?.situacao === 'ja_membro') {
    return (
      <AuthShell titulo="Convite">
        <p className="text-ink" style={{ fontWeight: 600 }}>
          Você já faz parte de {previa.space_nome}.
        </p>
        <AceitarConviteForm token={token} rotulo="Ir para o espaço" />
      </AuthShell>
    );
  }

  const codigo = error ? undefined : previa ? `convite_${previa.situacao}` : 'convite_invalido';
  return (
    <AuthShell titulo="Convite">
      <Aviso>{mensagemErroConvite(codigo)}</Aviso>
      <nav className="flex flex-col">
        <LinkTexto href="/mes">Ir para o início</LinkTexto>
      </nav>
    </AuthShell>
  );
}
