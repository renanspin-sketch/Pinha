'use client';

import { useActionState } from 'react';
import { criarConta, type FormState } from '@/lib/actions/auth';
import { SENHA_MIN } from '@/lib/auth';
import { Aviso, BotaoPrimario, Campo } from './ui';

export function CriarContaForm({ next }: { next?: string }) {
  const [state, action, pendente] = useActionState<FormState, FormData>(criarConta, {});
  if (state.enviado) {
    return (
      <Aviso tipo="ok">
        Enviamos um link para {state.email}. Abra o e-mail para confirmar sua conta e continuar.
      </Aviso>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ''} />
      {state.erro && <Aviso>{state.erro}</Aviso>}
      <Campo label="Nome" id="nome" type="text" autoComplete="name" required />
      <Campo label="E-mail" id="email" type="email" autoComplete="email" required />
      <Campo label="Senha" id="senha" type="password" autoComplete="new-password" minLength={SENHA_MIN} required />
      <BotaoPrimario pendente={pendente}>Criar conta</BotaoPrimario>
    </form>
  );
}
