# Pinha

Pinha é o app de finanças da casa: o casal (ou a família) lança, paga e acompanha o dinheiro junto, cada um com o seu login, dentro de um mesmo espaço. Quem cria o espaço convida as outras pessoas por um link de uso único. Tudo em português do Brasil, em reais (BRL) e no fuso `America/Sao_Paulo`. Um produto PINDev.

## Stack

- Next.js 15 (App Router, Server Actions) + React 19 + TypeScript
- Tailwind CSS 4 com tokens da marca em `styles/tokens.css` (gerados de `design/tokens.json` por `npm run tokens`)
- Supabase: Postgres com RLS em todas as tabelas, Auth (e-mail e senha, Google) via `@supabase/ssr`
- Testes: Vitest (unitários), pgTAP (banco), Playwright (e2e)

## Desenvolvimento local

1. `npm i`
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: do `supabase start` (`supabase status`) ou de um projeto Supabase de desenvolvimento.
   - `SITE_URL`: endereço do app, só no servidor (padrão em desenvolvimento: `http://127.0.0.1:3000`). Usado nos links de login com Google, confirmação de e-mail e recuperação de senha.
   - Login com Google (opcional): `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` e `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, exportadas antes do `supabase start`.
3. `npm run dev` e abra http://127.0.0.1:3000.

### Testes

- `npm run test:unit`: Vitest.
- `npm run test:db`: pgTAP num cluster Postgres temporário com um shim do Supabase (`scripts/test-db-local.sh`; precisa de Postgres 16 e pgTAP instalados, não precisa de Docker). Com o Supabase local rodando, `supabase test db` executa os mesmos arquivos de `supabase/tests`.
- e2e: `npm run build` e depois `npm run test:e2e` (o Playwright sobe `npm run start`). Para usar um Chromium já instalado, exporte `PW_CHROMIUM_PATH=/caminho/do/chrome` (e `PLAYWRIGHT_BROWSERS_PATH`, se for o caso). Os testes que precisam do Supabase Auth só rodam quando `NEXT_PUBLIC_SUPABASE_URL` está definida.
- Também: `npx tsc --noEmit` e `npm run lint`.

## CI

`.github/workflows/ci.yml` roda a cada push e pull request: instala o Supabase CLI (versão fixa), `supabase start`, `supabase test db`, testes unitários, build e e2e contra o Supabase local (com confirmação de e-mail desligada, como em `supabase/config.toml`).

## Checklist de produção

1. Crie o projeto no Supabase na região **São Paulo** (`sa-east-1`).
2. `supabase link --project-ref <ref>` e `supabase db push` para aplicar `supabase/migrations`.
3. Auth › URL Configuration:
   - **Site URL**: `https://<domínio>`
   - **Redirect URLs**: `https://<domínio>/**`
4. Auth › Providers › Email:
   - **Confirm email** ligado (confirmação de e-mail obrigatória).
   - **Minimum password length**: 8.
5. Auth › SMTP: configure um **SMTP próprio**. O envio embutido do Supabase só entrega para membros da equipe do projeto e tem limite baixo de e-mails por hora.
6. Auth › Email Templates: cole os dois templates, com os assuntos de `supabase/config.toml`:
   - **Confirm signup**: `supabase/templates/confirmacao.html` ("Confirme sua conta no Pinha")
   - **Reset password**: `supabase/templates/recuperacao.html` ("Redefina sua senha do Pinha")
   Os links levam a `/auth/confirm` (fluxo `token_hash`), que funciona mesmo quando o e-mail é aberto em outro navegador.
7. Auth › Providers › Google: client ID e secret do Google Cloud Console; no Google, a URI de redirecionamento autorizada é `https://<ref>.supabase.co/auth/v1/callback`.
8. Vercel › Environment Variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SITE_URL` (`https://<domínio>`, sem barra no fim; obrigatória em produção)

   Nunca coloque a chave `service_role` no Vercel nem em variáveis `NEXT_PUBLIC_`.
