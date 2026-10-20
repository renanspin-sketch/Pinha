'use client';

import { useState, useTransition } from 'react';
import { removerMembro } from '@/lib/actions/convites';

const botao = 'rounded-md border border-line-strong bg-surface-raised px-3 text-ink';
const estilo = { minHeight: '44px', fontWeight: 700, fontSize: '14px' } as const;

export function RemoverMembro({ userId, nome }: { userId: string; nome: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const r = await removerMembro(userId);
      if ('erro' in r) setErro(r.erro);
    });
  }

  return (
    <div className="flex flex-col items-end" style={{ gap: 'var(--space-2)' }}>
      {confirmando ? (
        <div className="flex flex-wrap justify-end" style={{ gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={confirmar}
            disabled={pendente}
            className="rounded-md bg-danger px-3 text-on-danger"
            style={{ ...estilo, opacity: pendente ? 0.7 : 1 }}
          >
            Confirmar remoção
          </button>
          <button type="button" onClick={() => setConfirmando(false)} disabled={pendente} className={botao} style={estilo}>
            Voltar
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmando(true)} aria-label={`Remover ${nome}`} className={botao} style={estilo}>
          Remover
        </button>
      )}
      {erro && (
        <p role="alert" className="text-danger" style={{ fontSize: '13px', fontWeight: 600 }}>
          {erro}
        </p>
      )}
    </div>
  );
}
