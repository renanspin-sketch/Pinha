import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lerParametrosConfirmacao } from '@/lib/confirmacao';

// Links de confirmação de e-mail e de recuperação de senha (fluxo token_hash do Supabase SSR):
// funcionam mesmo abertos em outro navegador, ao contrário do PKCE.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const params = lerParametrosConfirmacao(searchParams);

  if (params) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: params.type, token_hash: params.tokenHash });
    if (!error) return NextResponse.redirect(new URL(params.next, origin));
  }
  return NextResponse.redirect(new URL('/entrar?erro=link', origin));
}
