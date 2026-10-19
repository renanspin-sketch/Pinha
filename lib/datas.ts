/** 'Outubro 2026': mês e ano no fuso informado, com a primeira letra maiúscula. */
export function rotuloMes(data: Date, fuso = 'America/Sao_Paulo'): string {
  const partes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: fuso }).formatToParts(data);
  const mes = partes.find((p) => p.type === 'month')?.value ?? '';
  const ano = partes.find((p) => p.type === 'year')?.value ?? '';
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${ano}`;
}
