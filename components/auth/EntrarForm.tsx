'use client';

import { useActionState } from 'react';
import { entrar, type FormState } from '@/lib/actions/auth';
import { SENHA_MIN } from '@/lib/auth';
import { Aviso, BotaoPrimario, Campo } from './ui';

export function EntrarForm({ next }: { next?: string }) {
  const [state, action, pendente] = useActionState<FormState, FormData>(entrar, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ''} />
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <Campo label="E-mail" id="email" type="email" autoComplete="email" required />
      <Campo label="Senha" id="senha" type="password" autoComplete="current-password" minLength={SENHA_MIN} required />
      <BotaoPrimario pendente={pendente}>Entrar</BotaoPrimario>
    </form>
  );
}
