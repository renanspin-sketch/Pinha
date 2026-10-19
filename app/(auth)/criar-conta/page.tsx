import { entrarComGoogle } from '@/lib/actions/auth';
import { safeNext } from '@/lib/redirect';
import { AuthShell, BotaoSecundario, LinkTexto, comNext } from '@/components/auth/ui';
import { CriarContaForm } from '@/components/auth/CriarContaForm';

type Search = Promise<{ next?: string }>;

export default async function CriarContaPage({ searchParams }: { searchParams: Search }) {
  const { next: nextBruto } = await searchParams;
  const next = nextBruto ? safeNext(nextBruto) : undefined;
  return (
    <AuthShell titulo="Criar conta">
      <CriarContaForm next={next} />
      <form action={entrarComGoogle}>
        <input type="hidden" name="next" value={next ?? ''} />
        <div className="flex flex-col">
          <BotaoSecundario>Continuar com Google</BotaoSecundario>
        </div>
      </form>
      <nav className="flex flex-col">
        <LinkTexto href={comNext('/entrar', next)}>Já tem conta? Entrar</LinkTexto>
      </nav>
    </AuthShell>
  );
}
