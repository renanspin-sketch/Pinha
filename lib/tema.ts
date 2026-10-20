export type Tema = 'system' | 'light' | 'dark';

export function lerTema(valor: string | undefined | null): Tema {
  return valor === 'light' || valor === 'dark' ? valor : 'system';
}
