import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { COOKIE_ESPACO, escolherEspaco, opcoesCookieEspaco, type EspacoAtual } from '@/lib/espaco-atual';

export type { EspacoAtual };

type Linha = {
  papel: 'dono' | 'membro';
  spaces: { id: string; nome: string } | { id: string; nome: string }[] | null;
};

/**
 * Espaço atual do usuário: o do cookie pinha_espaco, se ele for membro; senão o mais antigo
 * (por entrou_em). null se não tiver espaço. Memoizado por requisição.
 */
export const getCurrentSpace = cache(async (): Promise<EspacoAtual | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('space_members')
    .select('papel, spaces(id, nome)')
    .eq('user_id', auth.user.id)
    .order('entrou_em', { ascending: true });
  if (error) throw error;

  const espacos: EspacoAtual[] = [];
  for (const linha of (data as Linha[] | null) ?? []) {
    const espaco = Array.isArray(linha.spaces) ? linha.spaces[0] : linha.spaces;
    if (espaco) espacos.push({ id: espaco.id, nome: espaco.nome, papel: linha.papel });
  }
  const preferido = (await cookies()).get(COOKIE_ESPACO)?.value;
  return escolherEspaco(espacos, preferido);
});

/** Só em Server Actions e Route Handlers. */
export async function definirEspacoAtual(spaceId: string): Promise<void> {
  (await cookies()).set(COOKIE_ESPACO, spaceId, opcoesCookieEspaco);
}

export async function limparEspacoAtual(): Promise<void> {
  (await cookies()).delete(COOKIE_ESPACO);
}
