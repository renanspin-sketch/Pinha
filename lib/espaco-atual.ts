export type EspacoAtual = { id: string; nome: string; papel: 'dono' | 'membro' };

export const COOKIE_ESPACO = 'pinha_espaco';

export const opcoesCookieEspaco = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
} as const;

/**
 * Espaço atual: o do cookie, se a pessoa for membro dele; senão o mais antigo.
 * `espacos` vem ordenado por entrou_em (mais antigo primeiro).
 */
export function escolherEspaco(espacos: EspacoAtual[], preferido: string | undefined): EspacoAtual | null {
  if (espacos.length === 0) return null;
  return (preferido && espacos.find((e) => e.id === preferido)) || espacos[0];
}
