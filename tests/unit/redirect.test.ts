import { test, expect } from 'vitest';
import { safeNext, isProtectedPath } from '@/lib/redirect';

test.each([
  ['/contas', '/contas'],
  ['/convite/abc?x=1', '/convite/abc?x=1'],
  ['//evil.com', '/mes'],
  ['/\\evil.com', '/mes'],
  ['https://evil.com', '/mes'],
  ['', '/mes'],
  [null, '/mes'],
  [undefined, '/mes'],
  ['/\t/evil.com', '/mes'],
  ['/\n/evil.com', '/mes'],
  ['/\r/evil.com', '/mes'],
  ['/a\\b', '/mes'],
  // %0a literal não é caractere de controle e permanece same-origin: aceito como está
  ['/%0a/evil.com', '/%0a/evil.com'],
])('safeNext(%s) = %s', (inp, out) => expect(safeNext(inp)).toBe(out));

test.each([
  ['/mes', true],
  ['/configuracoes/membros', true],
  ['/comecar', true],
  ['/novo', true],
  ['/entrar', false],
  ['/convite/abc', false],
  ['/mesa', false],
  ['/', false],
])('isProtectedPath(%s) = %s', (p, out) => expect(isProtectedPath(p)).toBe(out));
