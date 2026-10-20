import { safeNext } from '@/lib/redirect';

export const TIPOS_CONFIRMACAO = ['email', 'recovery', 'signup', 'invite', 'magiclink', 'email_change'] as const;
export type TipoConfirmacao = (typeof TIPOS_CONFIRMACAO)[number];

export type ParametrosConfirmacao = { tokenHash: string; type: TipoConfirmacao; next: string };

function ehTipo(t: string | null): t is TipoConfirmacao {
  return t !== null && (TIPOS_CONFIRMACAO as readonly string[]).includes(t);
}

/**
 * O `next` do e-mail pode vir como caminho (/redefinir-senha) ou como o RedirectTo absoluto
 * (https://site/auth/confirm?next=%2Fconvite%2F...). Do absoluto só se aproveita o `next` de dentro,
 * sempre validado por safeNext: nunca se redireciona para outra origem.
 */
function lerNext(bruto: string | null): string {
  if (!bruto) return '/mes';
  if (/^[a-z][a-z0-9+.-]*:/i.test(bruto)) {
    try {
      return safeNext(new URL(bruto).searchParams.get('next'));
    } catch {
      return '/mes';
    }
  }
  return safeNext(bruto);
}

/** Parâmetros de /auth/confirm (fluxo token_hash do Supabase); null se inválidos. */
export function lerParametrosConfirmacao(searchParams: URLSearchParams): ParametrosConfirmacao | null {
  const tokenHash = searchParams.get('token_hash')?.trim() ?? '';
  const type = searchParams.get('type');
  if (!tokenHash || !ehTipo(type)) return null;
  return { tokenHash, type, next: lerNext(searchParams.get('next')) };
}

/** emailRedirectTo do cadastro: volta por /auth/confirm levando o next. */
export function urlConfirmacaoEmail(site: string, next: string | null | undefined): string {
  return `${site.replace(/\/+$/, '')}/auth/confirm?next=${encodeURIComponent(safeNext(next))}`;
}
