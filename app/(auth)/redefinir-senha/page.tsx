import { AuthShell } from '@/components/auth/ui';
import { RedefinirForm } from '@/components/auth/RedefinirForm';

export default function RedefinirSenhaPage() {
  return (
    <AuthShell titulo="Nova senha">
      <RedefinirForm />
    </AuthShell>
  );
}
