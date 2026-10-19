export type IconeId = 'mes' | 'contas' | 'cartoes' | 'carteira' | 'recorrentes' | 'config';

export type ItemNav = {
  href: string;
  /** Rótulo curto (barra inferior) */
  rotulo: string;
  /** Rótulo da lateral, quando diferente */
  rotuloLateral?: string;
  icone: IconeId;
  /** Prefixo usado para marcar o item ativo */
  prefixo: string;
  barra: boolean;
};

export const ITENS_NAV: ItemNav[] = [
  { href: '/mes', rotulo: 'Mês', icone: 'mes', prefixo: '/mes', barra: true },
  { href: '/contas', rotulo: 'Contas', icone: 'contas', prefixo: '/contas', barra: true },
  { href: '/cartoes', rotulo: 'Cartões', icone: 'cartoes', prefixo: '/cartoes', barra: true },
  { href: '/carteira', rotulo: 'Carteira', icone: 'carteira', prefixo: '/carteira', barra: true },
  { href: '/recorrentes', rotulo: 'Recorrentes', icone: 'recorrentes', prefixo: '/recorrentes', barra: false },
  { href: '/configuracoes/membros', rotulo: 'Configurações', icone: 'config', prefixo: '/configuracoes', barra: false },
];

export function itemAtivo(item: ItemNav, pathname: string): boolean {
  return pathname === item.prefixo || pathname.startsWith(item.prefixo + '/');
}
