import { describe, it, expect } from 'vitest';
import { normalizeEmail, mensagemErroAuth, validarNovaSenha, siteUrl } from '@/lib/auth';

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

describe('validarNovaSenha', () => {
  it('aceita senhas iguais com 8+ caracteres', () => {
    expect(validarNovaSenha('12345678', '12345678')).toBeNull();
  });
  it('rejeita senha curta', () => {
    expect(validarNovaSenha('1234567', '1234567')).toBe('A senha precisa ter pelo menos 8 caracteres.');
  });
  it('rejeita confirmação diferente', () => {
    expect(validarNovaSenha('12345678', '12345679')).toBe('As senhas não conferem.');
  });
});

describe('siteUrl', () => {
  it('usa SITE_URL sem barra final', () => {
    expect(siteUrl({ SITE_URL: 'https://pinha.app.br/', NODE_ENV: 'production' })).toBe('https://pinha.app.br');
  });
  it('cai em 127.0.0.1:3000 fora de produção', () => {
    expect(siteUrl({ NODE_ENV: 'development' })).toBe('http://127.0.0.1:3000');
    expect(siteUrl({})).toBe('http://127.0.0.1:3000');
  });
  it('falha em produção sem SITE_URL', () => {
    expect(() => siteUrl({ NODE_ENV: 'production' })).toThrow(/SITE_URL/);
    expect(() => siteUrl({ SITE_URL: '  ', NODE_ENV: 'production' })).toThrow(/SITE_URL/);
  });
});
