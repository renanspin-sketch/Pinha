'use client';

import { useActionState } from 'react';
import { criarEspaco, type EspacoState } from '@/lib/actions/espaco';
import { Aviso, BotaoPrimario, Campo } from '@/components/auth/ui';

export function CriarEspacoForm() {
  const [state, action, pendente] = useActionState<EspacoState, FormData>(criarEspaco, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <Campo label="Nome do espaço" id="nome" type="text" autoComplete="off" />
      <BotaoPrimario pendente={pendente}>Criar espaço</BotaoPrimario>
    </form>
  );
}
