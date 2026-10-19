'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SENHA_MIN, mensagemErroAuth, normalizeEmail, siteUrl, validarNovaSenha } from '@/lib/auth';
import { safeNext } from '@/lib/redirect';

export type FormState = { erro?: string; enviado?: boolean };

function texto(formData: FormData, campo: string): string {
  const v = formData.get(campo);
  return typeof v === 'string' ? v : '';
}

function origemDoSite(): string {
  // Nunca derivada de cabeçalhos da requisição: evita envenenar links de OAuth e de recuperação.
  return siteUrl(process.env);
}

export async function entrar(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(texto(formData, 'email'));
  const senha = texto(formData, 'senha');
  if (!email || !senha) return { erro: mensagemErroAuth('invalid_credentials') };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: mensagemErroAuth(error.code) };

  redirect(safeNext(texto(formData, 'next')));
}

export async function criarConta(_prev: FormState, formData: FormData): Promise<FormState> {
  const nome = texto(formData, 'nome').trim();
  const email = normalizeEmail(texto(formData, 'email'));
  const senha = texto(formData, 'senha');
  if (!nome) return { erro: 'Conte como você se chama.' };
  if (!email) return { erro: 'Informe o seu e-mail.' };
  if (senha.length < SENHA_MIN) return { erro: mensagemErroAuth('weak_password') };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome } },
  });
  if (error) return { erro: mensagemErroAuth(error.code) };

  redirect(safeNext(texto(formData, 'next')));
}

export async function entrarComGoogle(formData: FormData): Promise<void> {
  const origin = origemDoSite();
  const next = safeNext(texto(formData, 'next'));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect('/entrar?erro=google');
  redirect(data.url);
}

export async function enviarLinkRecuperacao(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = normalizeEmail(texto(formData, 'email'));
  if (!email) return { erro: 'Informe o seu e-mail.' };

  const origin = origemDoSite();
  const supabase = await createClient();
  // O resultado não é exibido: a resposta é a mesma exista a conta ou não.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/redefinir-senha')}`,
  });
  return { enviado: true };
}

export async function redefinirSenha(_prev: FormState, formData: FormData): Promise<FormState> {
  const senha = texto(formData, 'senha');
  const erro = validarNovaSenha(senha, texto(formData, 'confirmacao'));
  if (erro) return { erro };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar?erro=link');

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: mensagemErroAuth(error.code) };

  redirect('/mes');
}
