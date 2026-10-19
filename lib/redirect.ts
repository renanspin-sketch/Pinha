export const PROTECTED_PREFIXES = [
  '/mes',
  '/contas',
  '/novo',
  '/cartoes',
  '/carteira',
  '/recorrentes',
  '/configuracoes',
  '/comecar',
] as const;

/** Só aceita caminhos relativos internos; qualquer outra coisa vira '/mes'. */
export function safeNext(next: string | null | undefined): string {
  if (!next) return '/mes';
  if (!next.startsWith('/') || next.startsWith('//')) return '/mes';
  // Navegadores removem tab/CR/LF e tratam '\\' como '/': rejeitar controles e barra invertida.
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return '/mes';
  try {
    if (new URL(next, 'http://x').origin !== 'http://x') return '/mes';
  } catch {
    return '/mes';
  }
  return next;
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
