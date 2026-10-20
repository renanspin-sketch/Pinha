import { describe, expect, it } from 'vitest';
import { formatarValidade, linkConvite, mensagemErroConvite } from '@/lib/convites';

describe('mensagemErroConvite', () => {
  it.each([
    ['convite_invalido', 'Este convite não existe ou foi cancelado.'],
    ['convite_expirado', 'Este convite venceu. Peça um novo a quem te convidou.'],
    ['convite_usado', 'Este convite já foi usado.'],
    ['espaco_cheio', 'Este espaço já tem o máximo de pessoas.'],
    ['sem_permissao', 'Só quem criou o espaço pode fazer isso.'],
    ['dono_nao_pode_sair', 'Quem criou o espaço não pode sair dele.'],
    ['qualquer_outro', 'Não deu certo agora. Tente de novo em instantes.'],
    [undefined, 'Não deu certo agora. Tente de novo em instantes.'],
  ])('%s', (code, texto) => {
    expect(mensagemErroConvite(code)).toBe(texto);
  });
});

describe('linkConvite', () => {
  it('monta o link com o token', () => {
    expect(linkConvite('https://pinha.app', 'abc')).toBe('https://pinha.app/convite/abc');
  });
  it('não duplica a barra final do site', () => {
    expect(linkConvite('https://pinha.app/', 'abc')).toBe('https://pinha.app/convite/abc');
  });
  it('codifica o token', () => {
    expect(linkConvite('https://x.y', 'a/b c')).toBe('https://x.y/convite/a%2Fb%20c');
  });
});

describe('formatarValidade', () => {
  it('formata DD/MM no fuso de São Paulo', () => {
    expect(formatarValidade('2026-10-26T15:00:00Z')).toBe('Vale até 26/10');
  });
  it('ainda é 25/10 em São Paulo à 01:00 UTC do dia 26', () => {
    expect(formatarValidade(new Date('2026-10-26T01:00:00Z'))).toBe('Vale até 25/10');
  });
  it('respeita outro fuso', () => {
    expect(formatarValidade('2026-10-26T01:00:00Z', 'UTC')).toBe('Vale até 26/10');
  });
});
