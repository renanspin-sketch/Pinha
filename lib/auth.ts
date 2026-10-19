export const SENHA_MIN = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function mensagemErroAuth(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'E-mail ou senha não conferem. Confira e tente de novo.';
    case 'user_already_exists':
      return 'Já existe uma conta com este e-mail. Entre ou recupere a senha.';
    case 'weak_password':
      return 'A senha precisa ter pelo menos 8 caracteres.';
    default:
      return 'Não deu certo agora. Tente de novo em instantes.';
  }
}

export function validarNovaSenha(senha: string, confirmacao: string): string | null {
  if (senha.length < SENHA_MIN) return mensagemErroAuth('weak_password');
  if (senha !== confirmacao) return 'As senhas não conferem.';
  return null;
}

export function siteUrl(env: { SITE_URL?: string; NODE_ENV?: string }): string {
  const url = env.SITE_URL?.trim();
  if (url) return url.replace(/\/+$/, '');
  if (env.NODE_ENV !== 'production') return 'http://127.0.0.1:3000';
  throw new Error('Configuração ausente: defina SITE_URL com o endereço público do Pinha.');
}
