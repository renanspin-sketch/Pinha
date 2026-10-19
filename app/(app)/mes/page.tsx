import { cookies } from 'next/headers';
import { getCurrentSpace } from '@/lib/espaco';
import { rotuloMes } from '@/lib/datas';
import { lerTema } from '@/lib/tema';
import Link from 'next/link';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { Icone } from '@/components/shell/Icone';

export default async function MesPage() {
  const espaco = await getCurrentSpace();
  const tema = lerTema((await cookies()).get('pinha_tema')?.value);
  return (
    <section className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
      <header className="flex items-start justify-between" style={{ gap: 'var(--space-3)' }}>
        <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
          <p className="text-ink-muted" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 600 }}>
            {espaco?.nome}
          </p>
          <h1
            className="text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '32px' }}
          >
            {rotuloMes(new Date())}
          </h1>
        </div>
        <div className="flex items-center md:hidden" style={{ gap: 'var(--space-2)' }}>
          <ThemeToggle inicial={tema} />
          <Link
            href="/configuracoes/membros"
            aria-label="Configurações"
            className="inline-flex items-center justify-center rounded-md border border-line-strong bg-surface-raised text-ink"
            style={{ width: '44px', height: '44px' }}
          >
            <Icone id="config" />
          </Link>
        </div>
      </header>
      <p className="text-ink-muted">O resumo do mês chega na próxima fase.</p>
    </section>
  );
}
