import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSpace } from '@/lib/espaco';
import { formatarValidade } from '@/lib/convites';
import { Avatar } from '@/components/membros/Avatar';
import { GerarConvite } from '@/components/membros/GerarConvite';
import { CancelarConvite } from '@/components/membros/CancelarConvite';
import { RemoverMembro } from '@/components/membros/RemoverMembro';
import { BotaoSair } from '@/components/shell/BotaoSair';

type Perfil = { nome: string | null; apelido: string | null };
type LinhaMembro = {
  user_id: string;
  papel: 'dono' | 'membro';
  cor_pessoa: number;
  entrou_em: string;
  profiles: Perfil | Perfil[] | null;
};
type Convite = { id: string; criado_em: string; expira_em: string };

const titulo = { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '32px' } as const;
const subtitulo = { fontWeight: 800, fontSize: '18px', lineHeight: '24px' } as const;

function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}

export default async function MembrosPage() {
  const espaco = await getCurrentSpace();
  if (!espaco) redirect('/comecar');

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const euId = auth.user?.id;
  const ehDono = espaco.papel === 'dono';

  const { data: membrosBrutos, error } = await supabase
    .from('space_members')
    .select('user_id, papel, cor_pessoa, entrou_em, profiles(nome, apelido)')
    .eq('space_id', espaco.id)
    .order('entrou_em', { ascending: true });
  if (error) throw error;
  const membros = (membrosBrutos ?? []) as unknown as LinhaMembro[];

  let convites: Convite[] = [];
  if (ehDono) {
    const { data, error: erroConvites } = await supabase
      .from('invites')
      .select('id, criado_em, expira_em')
      .eq('space_id', espaco.id)
      .is('usado_em', null)
      .is('revogado_em', null)
      .gt('expira_em', new Date().toISOString())
      .order('criado_em', { ascending: false });
    if (erroConvites) throw erroConvites;
    convites = data ?? [];
  }

  return (
    <section className="flex flex-col" style={{ gap: 'var(--space-6)' }}>
      <header className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
        <p className="text-ink-muted" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 600 }}>
          {espaco.nome}
        </p>
        <h1 className="text-ink" style={titulo}>
          Pessoas do espaço
        </h1>
      </header>

      <ul className="flex flex-col rounded-lg border border-line bg-surface-raised" style={{ padding: '0 var(--space-4)' }}>
        {membros.map((m, i) => {
          const perfil = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          const nome = perfil?.apelido || perfil?.nome || 'Sem nome';
          const sou = m.user_id === euId;
          return (
            <li
              key={m.user_id}
              className="flex items-center justify-between"
              style={{
                gap: 'var(--space-3)',
                padding: 'var(--space-3) 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              <div className="flex min-w-0 items-center" style={{ gap: 'var(--space-3)' }}>
                <Avatar nome={nome} cor={m.cor_pessoa} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-ink" style={{ fontWeight: 700 }}>
                    {nome}
                    {sou ? ' (você)' : ''}
                  </span>
                  <span className="text-ink-muted" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 600 }}>
                    {m.papel}
                  </span>
                </div>
              </div>
              {ehDono && !sou && <RemoverMembro userId={m.user_id} nome={nome} />}
            </li>
          );
        })}
      </ul>

      {ehDono && (
        <>
          <section className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
            <h2 className="text-ink" style={subtitulo}>
              Convidar
            </h2>
            <GerarConvite />
          </section>

          {convites.length > 0 && (
            <section className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
              <h2 className="text-ink" style={subtitulo}>
                Convites pendentes
              </h2>
              <ul className="flex flex-col rounded-lg border border-line bg-surface-raised" style={{ padding: '0 var(--space-4)' }}>
                {convites.map((c, i) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between"
                    style={{
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-ink" style={{ fontWeight: 700 }}>
                        Criado em {dataCurta(c.criado_em)}
                      </span>
                      <span className="text-ink-muted" style={{ fontSize: '13px', lineHeight: '18px', fontWeight: 600 }}>
                        {formatarValidade(c.expira_em)}
                      </span>
                    </div>
                    <CancelarConvite id={c.id} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* No PC o Sair fica no rodapé do menu lateral. */}
      <BotaoSair className="md:hidden" />
    </section>
  );
}
