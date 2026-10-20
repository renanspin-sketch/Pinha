'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { definirEspacoAtual, getCurrentSpace } from '@/lib/espaco';
import { siteUrl } from '@/lib/auth';
import { linkConvite, mensagemErroConvite } from '@/lib/convites';

const PAGINA = '/configuracoes/membros';

export type ResultadoLink = { link: string } | { erro: string };
export type ResultadoSimples = { ok: true } | { erro: string };

export async function criarConvite(): Promise<ResultadoLink> {
  const espaco = await getCurrentSpace();
  if (!espaco) return { erro: mensagemErroConvite(undefined) };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_invite', { p_space: espaco.id });
  if (error || typeof data !== 'string') return { erro: mensagemErroConvite(error?.message) };
  revalidatePath(PAGINA);
  return { link: linkConvite(siteUrl(process.env), data) };
}

export async function revogarConvite(id: string): Promise<ResultadoSimples> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('revoke_invite', { p_invite: id });
  if (error) return { erro: mensagemErroConvite(error.message) };
  revalidatePath(PAGINA);
  return { ok: true };
}

export async function removerMembro(userId: string): Promise<ResultadoSimples> {
  const espaco = await getCurrentSpace();
  if (!espaco) return { erro: mensagemErroConvite(undefined) };
  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_member', { p_space: espaco.id, p_user: userId });
  if (error) return { erro: mensagemErroConvite(error.message) };
  revalidatePath(PAGINA);
  return { ok: true };
}

export type AceiteState = { erro?: string };

/** Form de /convite/[token]: entra (ou volta) no espaço, torna-o o atual e vai para /mes. */
export async function aceitarConvite(_prev: AceiteState, formData: FormData): Promise<AceiteState> {
  const bruto = formData.get('token');
  const token = typeof bruto === 'string' ? bruto : '';
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('accept_invite', { p_token: token });
  if (error || typeof data !== 'string') return { erro: mensagemErroConvite(error?.message) };
  await definirEspacoAtual(data);
  redirect('/mes');
}
