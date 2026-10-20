import { describe, it, expect } from 'vitest';
import { escolherEspaco, COOKIE_ESPACO, opcoesCookieEspaco } from '@/lib/espaco-atual';

const casa = { id: 'a', nome: 'Casa', papel: 'dono' as const };
const pinheiro = { id: 'b', nome: 'Família Pinheiro', papel: 'membro' as const };

describe('escolherEspaco', () => {
  it('sem espaços: null', () => {
    expect(escolherEspaco([], 'a')).toBeNull();
  });
  it('sem cookie: o mais antigo (primeiro da lista)', () => {
    expect(escolherEspaco([casa, pinheiro], undefined)).toEqual(casa);
  });
  it('cookie de um espaço do usuário: esse espaço', () => {
    expect(escolherEspaco([casa, pinheiro], 'b')).toEqual(pinheiro);
  });
  it('cookie de espaço do qual não é membro: o mais antigo', () => {
    expect(escolherEspaco([casa, pinheiro], 'zzz')).toEqual(casa);
  });
  it('cookie vazio: o mais antigo', () => {
    expect(escolherEspaco([casa, pinheiro], '')).toEqual(casa);
  });
});

describe('cookie do espaço', () => {
  it('nome e opções', () => {
    expect(COOKIE_ESPACO).toBe('pinha_espaco');
    expect(opcoesCookieEspaco).toEqual({ maxAge: 60 * 60 * 24 * 365, path: '/', httpOnly: true, sameSite: 'lax' });
  });
});
