export const NOME_ESPACO_MAX = 60;
export const ERRO_NOME_VAZIO = 'Dê um nome ao espaço';
export const ERRO_NOME_LONGO = 'Use até 60 caracteres';
export const ERRO_GENERICO = 'Não deu certo agora. Tente de novo em instantes.';

/** Retorna a mensagem de erro, ou null se o nome (após trim) é válido. */
export function validarNomeEspaco(nome: string): string | null {
  const n = nome.trim();
  if (n.length === 0) return ERRO_NOME_VAZIO;
  if (n.length > NOME_ESPACO_MAX) return ERRO_NOME_LONGO;
  return null;
}
