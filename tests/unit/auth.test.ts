import { describe, it, expect } from 'vitest';
import { normalizeEmail, mensagemErroAuth } from '@/lib/auth';

describe('normalizeEmail', () => {
  it('apara espaços e converte para minúsculas', () => {
    expect(normalizeEmail('  Renan@Gmail.COM ')).toBe('renan@gmail.com');
  });
  it('mantém e-mail já normalizado', () => {
    expect(normalizeEmail('a@b.com')).toBe('a@b.com');
  });
});

describe('mensagemErroAuth', () => {
  it('invalid_credentials', () => {
    expect(mensagemErroAuth('invalid_credentials')).toBe('E-mail ou senha não conferem. Confira e tente de novo.');
  });
  it('user_already_exists', () => {
    expect(mensagemErroAuth('user_already_exists')).toBe('Já existe uma conta com este e-mail. Entre ou recupere a senha.');
  });
  it('weak_password', () => {
    expect(mensagemErroAuth('weak_password')).toBe('A senha precisa ter pelo menos 8 caracteres.');
  });
  it('desconhecido ou ausente', () => {
    const msg = 'Não deu certo agora. Tente de novo em instantes.';
    expect(mensagemErroAuth('xyz')).toBe(msg);
    expect(mensagemErroAuth(undefined)).toBe(msg);
  });
});
