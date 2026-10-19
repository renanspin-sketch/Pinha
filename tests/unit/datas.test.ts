import { describe, expect, it } from 'vitest';
import { rotuloMes } from '@/lib/datas';

describe('rotuloMes', () => {
  it('formata mês e ano com inicial maiúscula', () => {
    expect(rotuloMes(new Date('2026-10-19T12:00:00Z'))).toBe('Outubro 2026');
  });
  it('usa o fuso de São Paulo (ainda 31/10 lá)', () => {
    expect(rotuloMes(new Date('2026-11-01T02:00:00Z'))).toBe('Outubro 2026');
  });
  it('respeita outro fuso', () => {
    expect(rotuloMes(new Date('2026-11-01T02:00:00Z'), 'UTC')).toBe('Novembro 2026');
  });
});
