'use client';

import { useState, useTransition } from 'react';
import { revogarConvite } from '@/lib/actions/convites';

export function CancelarConvite({ id }: { id: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end" style={{ gap: 'var(--space-2)' }}>
      <button
        type="button"
        disabled={pendente}
        onClick={() => {
          setErro(null);
          startTransition(async () => {
            const r = await revogarConvite(id);
            if ('erro' in r) setErro(r.erro);
          });
        }}
        className="rounded-md border border-line-strong bg-surface-raised px-3 text-ink"
        style={{ minHeight: '44px', fontWeight: 700, fontSize: '14px', opacity: pendente ? 0.7 : 1 }}
      >
        Cancelar
      </button>
      {erro && (
        <p role="alert" className="text-danger" style={{ fontSize: '13px', fontWeight: 600 }}>
          {erro}
        </p>
      )}
    </div>
  );
}
