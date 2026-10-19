'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ERRO_GENERICO, ERRO_NOME_VAZIO, validarNomeEspaco } from '@/lib/espaco-validacao';

export type EspacoState = { erro?: string };

export async function criarEspaco(_prev: EspacoState, formData: FormData): Promise<EspacoState> {
  const bruto = formData.get('nome');
  const nome = (typeof bruto === 'string' ? bruto : '').trim();
  const erro = validarNomeEspaco(nome);
  if (erro) return { erro };

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_space', { p_nome: nome });
  if (error) return { erro: error.code === '23514' ? ERRO_NOME_VAZIO : ERRO_GENERICO };

  redirect('/mes');
}
