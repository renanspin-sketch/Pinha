import { entrarComGoogle } from '@/lib/actions/auth';
import { safeNext } from '@/lib/redirect';
import { AuthShell, Aviso, BotaoSecundario, LinkTexto, comNext } from '@/components/auth/ui';
import { EntrarForm } from '@/components/auth/EntrarForm';

type Search = Promise<{ next?: string; erro?: string }>;

export default async function EntrarPage({ searchParams }: { searchParams: Search }) {
  const { next: nextBruto, erro } = await searchParams;
  const next = nextBruto ? safeNext(nextBruto) : undefined;
  return (
    <AuthShell titulo="Entrar">
      {erro === 'link' && <Aviso>O link expirou ou já foi usado. Peça outro.</Aviso>}
      {erro === 'google' && <Aviso>Não deu certo agora. Tente de novo em instantes.</Aviso>}
      <EntrarForm next={next} />
      <form action={entrarComGoogle}>
        <input type="hidden" name="next" value={next ?? ''} />
        <div className="flex flex-col">
          <BotaoSecundario>Continuar com Google</BotaoSecundario>
        </div>
      </form>
      <nav className="flex flex-col">
        <LinkTexto href="/recuperar-senha">Esqueci a senha</LinkTexto>
        <LinkTexto href={comNext('/criar-conta', next)}>Ainda não tem conta? Criar conta</LinkTexto>
      </nav>
    </AuthShell>
  );
}
