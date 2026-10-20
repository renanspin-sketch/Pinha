import { describe, it, expect } from 'vitest';
import { lerParametrosConfirmacao, urlConfirmacaoEmail } from '@/lib/confirmacao';

const sp = (q: string) => new URLSearchParams(q);

describe('lerParametrosConfirmacao', () => {
  it('lê token_hash, type e next relativo', () => {
    expect(lerParametrosConfirmacao(sp('token_hash=abc&type=recovery&next=/redefinir-senha'))).toEqual({
      tokenHash: 'abc',
      type: 'recovery',
      next: '/redefinir-senha',
    });
  });

  it.each(['email', 'recovery', 'signup', 'invite', 'magiclink', 'email_change'])('aceita type=%s', (t) => {
    expect(lerParametrosConfirmacao(sp(`token_hash=abc&type=${t}`))?.type).toBe(t);
  });

  it.each(['sms', 'phone_change', 'EMAIL', '', 'recovery '])('recusa type=%j', (t) => {
    expect(lerParametrosConfirmacao(sp(`token_hash=abc&type=${encodeURIComponent(t)}`))).toBeNull();
  });

  it('recusa sem type', () => {
    expect(lerParametrosConfirmacao(sp('token_hash=abc'))).toBeNull();
  });

  it('recusa sem token_hash ou com token_hash vazio', () => {
    expect(lerParametrosConfirmacao(sp('type=email'))).toBeNull();
    expect(lerParametrosConfirmacao(sp('token_hash=&type=email'))).toBeNull();
    expect(lerParametrosConfirmacao(sp('token_hash=%20%20&type=email'))).toBeNull();
  });

  it('next ausente vira /mes', () => {
    expect(lerParametrosConfirmacao(sp('token_hash=abc&type=email'))?.next).toBe('/mes');
  });

  it('next externo vira /mes', () => {
    expect(lerParametrosConfirmacao(sp('token_hash=abc&type=email&next=//evil.com'))?.next).toBe('/mes');
    expect(lerParametrosConfirmacao(sp('token_hash=abc&type=email&next=https://evil.com/x'))?.next).toBe('/mes');
  });

  it('next absoluto (RedirectTo do e-mail) usa só o next de dentro, validado', () => {
    const redirectTo = 'https://pinha.app.br/auth/confirm?next=%2Fconvite%2Fabc';
    expect(
      lerParametrosConfirmacao(sp(`token_hash=abc&type=email&next=${encodeURIComponent(redirectTo)}`))?.next,
    ).toBe('/convite/abc');
    const malicioso = 'https://evil.com/auth/confirm?next=%2F%2Fevil.com';
    expect(
      lerParametrosConfirmacao(sp(`token_hash=abc&type=email&next=${encodeURIComponent(malicioso)}`))?.next,
    ).toBe('/mes');
  });

  it('next absoluto sem next de dentro vira /mes', () => {
    expect(
      lerParametrosConfirmacao(sp(`token_hash=abc&type=email&next=${encodeURIComponent('https://pinha.app.br')}`))?.next,
    ).toBe('/mes');
  });
});

describe('urlConfirmacaoEmail', () => {
  it('monta /auth/confirm com next codificado', () => {
    expect(urlConfirmacaoEmail('https://pinha.app.br', '/convite/abc')).toBe(
      'https://pinha.app.br/auth/confirm?next=%2Fconvite%2Fabc',
    );
  });
  it('tira barra final do site', () => {
    expect(urlConfirmacaoEmail('https://pinha.app.br/', '/mes')).toBe('https://pinha.app.br/auth/confirm?next=%2Fmes');
  });
  it('next inseguro ou ausente vira /mes', () => {
    expect(urlConfirmacaoEmail('https://pinha.app.br', '//evil.com')).toBe('https://pinha.app.br/auth/confirm?next=%2Fmes');
    expect(urlConfirmacaoEmail('https://pinha.app.br', undefined)).toBe('https://pinha.app.br/auth/confirm?next=%2Fmes');
  });
});
