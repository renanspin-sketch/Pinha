import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentSpace } from '@/lib/espaco';
import { BottomNav } from '@/components/shell/BottomNav';
import { Sidebar } from '@/components/shell/Sidebar';
import { lerTema } from '@/lib/tema';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const espaco = await getCurrentSpace();
  if (!espaco) redirect('/comecar');
  const tema = lerTema((await cookies()).get('pinha_tema')?.value);

  return (
    <div className="flex min-h-dvh">
      <Sidebar nomeEspaco={espaco.nome} temaInicial={tema} />
      <div className="min-w-0 flex-1">
        <main
          className="mx-auto w-full"
          style={{ maxWidth: '960px', padding: 'var(--space-6) var(--space-4) calc(96px + env(safe-area-inset-bottom))' }}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
