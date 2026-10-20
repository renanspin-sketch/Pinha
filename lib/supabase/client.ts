import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Acesso estático às variáveis: o Next só inlina NEXT_PUBLIC_* assim no navegador.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url) throw new Error('Variável de ambiente ausente: NEXT_PUBLIC_SUPABASE_URL.');
  if (!anonKey) throw new Error('Variável de ambiente ausente: NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  return createBrowserClient(url, anonKey);
}
