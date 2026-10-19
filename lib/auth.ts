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
