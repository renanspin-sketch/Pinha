import { describe, expect, it } from 'vitest';
import { validarNomeEspaco } from '@/lib/espaco-validacao';

describe('validarNomeEspaco', () => {
  it('aceita um nome comum', () => {
    expect(validarNomeEspaco('Família Pinheiro')).toBeNull();
  });
  it('rejeita vazio e só espaços', () => {
    expect(validarNomeEspaco('')).toBe('Dê um nome ao espaço');
    expect(validarNomeEspaco('   ')).toBe('Dê um nome ao espaço');
  });
  it('aceita 60 caracteres (após trim) e rejeita 61', () => {
    expect(validarNomeEspaco(`  ${'a'.repeat(60)}  `)).toBeNull();
    expect(validarNomeEspaco('a'.repeat(61))).toBe('Use até 60 caracteres');
  });
});
