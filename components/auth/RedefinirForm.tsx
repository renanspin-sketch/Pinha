'use client';

import { useActionState } from 'react';
import { redefinirSenha, type FormState } from '@/lib/actions/auth';
import { SENHA_MIN } from '@/lib/auth';
import { Aviso, BotaoPrimario, Campo } from './ui';

export function RedefinirForm() {
  const [state, action, pendente] = useActionState<FormState, FormData>(redefinirSenha, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <Campo label="Nova senha" id="senha" type="password" autoComplete="new-password" minLength={SENHA_MIN} required />
      <Campo label="Confirmar nova senha" id="confirmacao" type="password" autoComplete="new-password" minLength={SENHA_MIN} required />
      <BotaoPrimario pendente={pendente}>Salvar nova senha</BotaoPrimario>
    </form>
  );
}
