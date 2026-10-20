'use client';

import { useRef, useState, useTransition } from 'react';
import { criarConvite } from '@/lib/actions/convites';
import { Aviso } from '@/components/auth/ui';

const secundario = 'inline-flex items-center justify-center rounded-md border border-line-strong bg-surface-raised px-4 text-ink';
const estilo = { minHeight: '48px', fontWeight: 700, fontSize: '15px' } as const;

export function GerarConvite() {
  const [link, setLink] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pendente, startTransition] = useTransition();
  const campo = useRef<HTMLInputElement>(null);

  function gerar() {
    setErro(null);
    setCopiado(false);
    startTransition(async () => {
      const r = await criarConvite();
      if ('erro' in r) {
        setErro(r.erro);
        setLink(null);
      } else setLink(r.link);
    });
  }

  async function copiar() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      campo.current?.focus();
      campo.current?.select();
      try {
        setCopiado(document.execCommand('copy'));
      } catch {
        setCopiado(false);
      }
    }
  }

  const whatsapp = link
    ? `https://wa.me/?text=${encodeURIComponent(`Entre no espaço da nossa casa na Pinha: ${link}`)}`
    : null;

  return (
    <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
      <button
        type="button"
        onClick={gerar}
        disabled={pendente}
        className="rounded-md bg-brand px-4 text-on-brand"
        style={{ ...estilo, opacity: pendente ? 0.7 : 1 }}
      >
        Gerar link de convite
      </button>
      {erro && <Aviso>{erro}</Aviso>}
      {link && whatsapp && (
        <div className="flex flex-col rounded-lg border border-line bg-surface-raised" style={{ gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
          <label htmlFor="link-convite" className="text-ink" style={{ fontWeight: 700, fontSize: '14px' }}>
            Link do convite
          </label>
          <input
            id="link-convite"
            ref={campo}
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="rounded-md border border-line-strong bg-surface px-3 text-ink"
            style={{ minHeight: '48px', fontSize: '16px' }}
          />
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
            <button type="button" onClick={copiar} className={secundario} style={estilo}>
              Copiar
            </button>
            <a href={whatsapp} target="_blank" rel="noopener" className={secundario} style={estilo}>
              Compartilhar no WhatsApp
            </a>
          </div>
          <p role="status" className="text-positive" style={{ fontWeight: 600, minHeight: '20px' }}>
            {copiado ? 'Link copiado' : ''}
          </p>
          <p className="text-ink-muted" style={{ fontSize: '13px' }}>
            Este link só aparece agora e vale por 7 dias.
          </p>
        </div>
      )}
    </div>
  );
}
