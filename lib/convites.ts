const GENERICO = 'Não deu certo agora. Tente de novo em instantes.';

export function mensagemErroConvite(code: string | undefined): string {
  switch (code) {
    case 'convite_invalido':
      return 'Este convite não existe ou foi cancelado.';
    case 'convite_expirado':
      return 'Este convite venceu. Peça um novo a quem te convidou.';
    case 'convite_usado':
      return 'Este convite já foi usado.';
    case 'espaco_cheio':
      return 'Este espaço já tem o máximo de pessoas.';
    case 'sem_permissao':
      return 'Só quem criou o espaço pode fazer isso.';
    case 'dono_nao_pode_sair':
      return 'Quem criou o espaço não pode sair dele.';
    default:
      return GENERICO;
  }
}

export function linkConvite(site: string, token: string): string {
  return `${site.replace(/\/+$/, '')}/convite/${encodeURIComponent(token)}`;
}

/** 'Vale até 26/10' no fuso informado. */
export function formatarValidade(expiraEm: string | Date, fuso = 'America/Sao_Paulo'): string {
  const data = typeof expiraEm === 'string' ? new Date(expiraEm) : expiraEm;
  const partes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: fuso }).formatToParts(data);
  const dia = partes.find((p) => p.type === 'day')?.value ?? '';
  const mes = partes.find((p) => p.type === 'month')?.value ?? '';
  return `Vale até ${dia}/${mes}`;
}
