import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type EspacoAtual = { id: string; nome: string; papel: 'dono' | 'membro' };

type Linha = {
  papel: 'dono' | 'membro';
  spaces: { id: string; nome: string } | { id: string; nome: string }[] | null;
};

/** Primeiro espaço do usuário atual (por entrou_em), ou null. */
export async function getCurrentSpace(): Promise<EspacoAtual | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('space_members')
    .select('papel, spaces(id, nome)')
    .eq('user_id', auth.user.id)
    .order('entrou_em', { ascending: true })
    .limit(1);
  if (error) throw error;

  const linha = (data as Linha[] | null)?.[0];
  const espaco = Array.isArray(linha?.spaces) ? linha?.spaces[0] : linha?.spaces;
  if (!linha || !espaco) return null;
  return { id: espaco.id, nome: espaco.nome, papel: linha.papel };
}
