'use client';

import { useActionState } from 'react';
import { enviarLinkRecuperacao, type FormState } from '@/lib/actions/auth';
import { Aviso, BotaoPrimario, Campo } from './ui';

export function RecuperarForm() {
  const [state, action, pendente] = useActionState<FormState, FormData>(enviarLinkRecuperacao, {});
  if (state.enviado) {
    return <Aviso tipo="ok">Se houver uma conta com este e-mail, enviamos um link para criar uma nova senha.</Aviso>;
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <Campo label="E-mail" id="email" type="email" autoComplete="email" required />
      <BotaoPrimario pendente={pendente}>Enviar link</BotaoPrimario>
    </form>
  );
}
