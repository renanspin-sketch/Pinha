'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icone } from './Icone';
import { ITENS_NAV, itemAtivo, type ItemNav } from './navegacao';

function ItemBarra({ item, pathname }: { item: ItemNav; pathname: string }) {
  const ativo = itemAtivo(item, pathname);
  return (
    <Link
      href={item.href}
      aria-current={ativo ? 'page' : undefined}
      className="flex flex-col items-center justify-center"
      style={{
        gap: 'var(--space-1)',
        minWidth: '56px',
        minHeight: '44px',
        fontSize: '11px',
        lineHeight: '14px',
        fontWeight: ativo ? 700 : 600,
        color: ativo ? 'var(--brand)' : 'var(--ink-muted)',
      }}
    >
      <Icone id={item.icone} />
      {item.rotulo}
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [mes, contas, cartoes, carteira] = ITENS_NAV.filter((i) => i.barra);
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-line bg-surface-raised md:hidden"
      style={{ minHeight: '68px', padding: '0 6px env(safe-area-inset-bottom)' }}
    >
      <ItemBarra item={mes} pathname={pathname} />
      <ItemBarra item={contas} pathname={pathname} />
      <Link
        href="/novo"
        aria-label="Novo lançamento"
        className="flex items-center justify-center bg-brand text-on-brand shadow-raised"
        style={{ width: '56px', height: '56px', borderRadius: '50%', marginTop: '-18px' }}
      >
        <Icone id="mais" tamanho={26} traco={2.4} />
      </Link>
      <ItemBarra item={cartoes} pathname={pathname} />
      <ItemBarra item={carteira} pathname={pathname} />
    </nav>
  );
}
