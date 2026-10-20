'use client';

import { useState } from 'react';

type Tema = 'system' | 'light' | 'dark';
const ORDEM: Tema[] = ['system', 'light', 'dark'];
const ROTULO: Record<Tema, string> = { system: 'Sistema', light: 'Claro', dark: 'Escuro' };

function temaAtual(): Tema {
  if (typeof document === 'undefined') return 'system';
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' || t === 'dark' ? t : 'system';
}

export function ThemeToggle({ inicial = 'system' }: { inicial?: Tema }) {
  const [tema, setTema] = useState<Tema>(inicial);

  function alternar() {
    const base = temaAtual();
    const proximo = ORDEM[(ORDEM.indexOf(base) + 1) % ORDEM.length];
    if (proximo === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', proximo);
    document.cookie = `pinha_tema=${proximo}; path=/; max-age=31536000; samesite=lax`;
    setTema(proximo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="inline-flex items-center rounded-md border border-line-strong bg-surface-raised px-3 text-ink"
      style={{ minHeight: '44px', fontSize: '14px', fontWeight: 700, gap: 'var(--space-2)' }}
    >
      Tema: {ROTULO[tema]}
    </button>
  );
}
