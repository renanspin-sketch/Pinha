'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { Icone } from './Icone';
import { ThemeToggle } from './ThemeToggle';
import { ITENS_NAV, itemAtivo } from './navegacao';

export function Sidebar({ nomeEspaco, temaInicial }: { nomeEspaco: string; temaInicial: 'system' | 'light' | 'dark' }) {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex md:flex-col border-r border-line bg-surface-raised"
      style={{ width: '240px', flexShrink: 0, padding: 'var(--space-6) var(--space-4)', gap: 'var(--space-6)', position: 'sticky', top: 0, height: '100dvh' }}
    >
      <p
        className="text-ink"
        style={{ padding: '0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', lineHeight: '24px', letterSpacing: '-0.02em' }}
      >
        {nomeEspaco}
      </p>
      <nav aria-label="Navegação principal" className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
        {ITENS_NAV.map((item) => {
          const ativo = itemAtivo(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? 'page' : undefined}
              className="flex items-center rounded-md"
              style={{
                minHeight: '44px',
                gap: 'var(--space-3)',
                padding: '0 var(--space-3)',
                fontSize: '14px',
                fontWeight: ativo ? 800 : 700,
                color: ativo ? 'var(--brand)' : 'var(--ink-muted)',
                background: ativo ? 'var(--brand-tint)' : 'transparent',
              }}
            >
              <Icone id={item.icone} tamanho={20} />
              {item.rotuloLateral ?? item.rotulo}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col" style={{ marginTop: 'auto', gap: 'var(--space-4)', padding: '0 var(--space-2)' }}>
        <ThemeToggle inicial={temaInicial} />
        <Logo variant="assinatura" />
      </div>
    </aside>
  );
}
