'use client';

import { useActionState } from 'react';
import { aceitarConvite, type AceiteState } from '@/lib/actions/convites';
import { Aviso, BotaoPrimario } from '@/components/auth/ui';

export function AceitarConviteForm({ token, rotulo }: { token: string; rotulo: string }) {
  const [state, action, pendente] = useActionState<AceiteState, FormData>(aceitarConvite, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <BotaoPrimario pendente={pendente}>{rotulo}</BotaoPrimario>
    </form>
  );
}
