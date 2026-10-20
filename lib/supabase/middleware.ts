import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedPath } from '@/lib/redirect';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname, search } = request.nextUrl;
  const protegida = isProtectedPath(pathname);

  if (!url || !anonKey) {
    // Sem configuração não há sessão: rotas públicas passam, protegidas vão ao login.
    if (!protegida) return response;
    return redirectToLogin(request, pathname + search);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && protegida) return redirectToLogin(request, pathname + search);
  return response;
}

function redirectToLogin(request: NextRequest, next: string): NextResponse {
  const target = request.nextUrl.clone();
  target.pathname = '/entrar';
  target.search = '';
  target.searchParams.set('next', next);
  return NextResponse.redirect(target);
}
