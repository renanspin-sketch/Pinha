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
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/mes';
  return next;
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
