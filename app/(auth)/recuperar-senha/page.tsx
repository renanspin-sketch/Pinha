import { AuthShell, LinkTexto } from '@/components/auth/ui';
import { RecuperarForm } from '@/components/auth/RecuperarForm';

export default function RecuperarSenhaPage() {
  return (
    <AuthShell titulo="Recuperar senha">
      <RecuperarForm />
      <nav className="flex flex-col">
        <LinkTexto href="/entrar">Voltar para entrar</LinkTexto>
      </nav>
    </AuthShell>
  );
}
