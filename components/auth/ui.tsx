import type { ReactNode, InputHTMLAttributes } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

export function AuthShell({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col gap-6 px-4 py-8">
      <Logo variant="assinatura" />
      <h1
        className="text-ink"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '32px' }}
      >
        {titulo}
      </h1>
      {children}
    </main>
  );
}

export function Campo({ label, id, ...rest }: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-ink" style={{ fontWeight: 700, fontSize: '14px', lineHeight: '20px' }}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="rounded-md border border-line-strong bg-surface-raised px-3 text-ink"
        style={{ minHeight: '48px', fontSize: '16px' }}
        {...rest}
      />
    </div>
  );
}

const botaoBase = 'rounded-md px-4 text-center';
const botaoStyle = { minHeight: '48px', fontWeight: 700, fontSize: '15px' } as const;

export function BotaoPrimario({ children, pendente }: { children: ReactNode; pendente?: boolean }) {
  return (
    <button type="submit" disabled={pendente} className={`${botaoBase} bg-brand text-on-brand`} style={{ ...botaoStyle, opacity: pendente ? 0.7 : 1 }}>
      {children}
    </button>
  );
}

export function BotaoSecundario({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className={`${botaoBase} border border-line-strong bg-surface-raised text-ink`} style={botaoStyle}>
      {children}
    </button>
  );
}

export function Aviso({ children, tipo = 'erro' }: { children: ReactNode; tipo?: 'erro' | 'ok' }) {
  const cores = tipo === 'erro' ? 'bg-danger-tint text-danger' : 'bg-positive-tint text-positive';
  return (
    <p role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-md px-3 py-3 ${cores}`} style={{ fontWeight: 600 }}>
      {children}
    </p>
  );
}

export function LinkTexto({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-brand underline"
      style={{ minHeight: '44px', fontWeight: 700 }}
    >
      {children}
    </Link>
  );
}

export function comNext(rota: string, next: string | undefined): string {
  return next ? `${rota}?next=${encodeURIComponent(next)}` : rota;
}
