# Pinha · Fase 1 (Fundação) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pinha no ar com login (e-mail e senha, Google), criação do espaço da família, convite por link, gestão de membros e o esqueleto do app (navegação, tema, PWA, marca), tudo protegido por RLS.

**Architecture:** Next.js (App Router) só desenha telas e chama o Supabase. Toda regra de acesso mora no banco: RLS em todas as tabelas e funções `security definer` para operações que mexem em mais de uma tabela. O futuro app nativo usará as mesmas funções.

**Tech Stack:** Next.js 15 + TypeScript, Tailwind CSS 4, shadcn/ui, `@supabase/ssr`, Supabase (Postgres 15, Auth, CLI local), pgTAP (`supabase test db`), Vitest, Playwright, GitHub Actions, Vercel.

**Spec:** [Pinha – Especificação da primeira versão](https://claude.ai/code/artifact/8e750fe0-5723-4b6e-9a52-5344e9d00ac3), aprovada em 19/10/2026. Identidade: [Pinha – Identidade Visual](https://claude.ai/artifact/NZ1ajrTnCc2BVrXHCsuPra). Protótipos: [Finanças da Casa – Protótipos](https://claude.ai/artifact/VNpuhJQwXtQHR1N515dqeb).

**Roadmap (um plano por fase, escrito antes de cada uma):** Fase 1 Fundação (este) · Fase 2 Carteiras, saldos e lançamentos · Fase 3 Cartão, faturas e parcelamentos · Fase 4 Recorrências, rotina diária e alertas (inclui envio de e-mail, também o de convite).

## Global Constraints

- Idioma único pt-BR; tratar o usuário por "você"; sem emoji na interface.
- Fuso padrão do espaço `America/Sao_Paulo`; moeda `BRL`.
- Valores de dinheiro sempre `bigint` em centavos (vale a partir da Fase 2; nenhuma coluna `numeric`/`float` para dinheiro).
- RLS ligada em TODA tabela do schema `public`; nenhuma tabela sem policy.
- A chave `service_role` nunca vai para o navegador; só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são públicas.
- Cores, tipos, espaços e raios só por tokens do design system (CSS variables em `styles/tokens.css`); nenhum hex em componentes.
- Fontes: Bricolage Grotesque (700, 800) para wordmark, `title-lg`, `money-xl`; Manrope (500–800) para o resto.
- Assinatura escrita exatamente `by PINDev`; aparece no login, no carregamento e no rodapé do menu; nunca nas telas do dia a dia.
- Alvos de toque ≥ 44px; anel de foco `--focus` 2px com offset 2px.
- Convite: token aleatório de uso único, guardado só como hash SHA-256, válido por 7 dias.
- Papéis: `dono` e `membro`; só dono convida, remove membro, renomeia ou exclui o espaço.

## Review Focus

1. Token de convite colado com espaços ou quebra de linha → deve funcionar (trim antes do hash). Teste em Task 4.
2. Pessoa que já é membro abre um convite do mesmo espaço → entra no espaço sem erro e sem membership duplicada; o convite é consumido. Teste em Task 4.
3. E-mail com maiúsculas no cadastro e no login (`Renan@Gmail.com` vs `renan@gmail.com`) → mesma conta. Teste em Task 5.
4. Dono tenta remover a si mesmo ou o último dono → recusado com `dono_nao_pode_sair`. Teste em Task 4.
5. Parâmetro `next` de redirecionamento apontando para outro site (`//evil.com`, `https://evil.com`) → ignorado, vai para `/mes`. Teste em Task 5.

---

## File Structure

```
app/
  layout.tsx                    fontes, tema, <html lang="pt-BR">
  globals.css                   Tailwind + import de styles/tokens.css
  (auth)/entrar/page.tsx        login
  (auth)/criar-conta/page.tsx   cadastro
  (auth)/recuperar-senha/page.tsx
  auth/callback/route.ts        troca de código OAuth / link de e-mail
  comecar/page.tsx              criar o espaço (passo 1 do assistente)
  convite/[token]/page.tsx      aceitar convite
  (app)/layout.tsx              shell: BottomNav (celular) + Sidebar (PC)
  (app)/mes/page.tsx            placeholder "Outubro 2026" até a Fase 2
  (app)/configuracoes/membros/page.tsx
lib/
  supabase/client.ts            createBrowserClient
  supabase/server.ts            createServerClient (cookies)
  supabase/middleware.ts        refresh de sessão
  redirect.ts                   safeNext()
  espaco.ts                     getCurrentSpace()
  actions/espaco.ts             server actions: criarEspaco
  actions/convites.ts           server actions: criarConvite, revogarConvite, aceitarConvite, removerMembro
components/
  brand/Logo.tsx                lockup + assinatura
  shell/BottomNav.tsx, shell/Sidebar.tsx, shell/ThemeToggle.tsx
styles/tokens.css               tokens do design system Pinha
public/manifest.webmanifest, public/icons/icon-192.png, icon-512.png, pinha-mark.svg
middleware.ts
supabase/config.toml
supabase/migrations/20261019000001_fundacao.sql
supabase/migrations/20261019000002_convites.sql
supabase/tests/001_espacos_rls.test.sql
supabase/tests/002_convites.test.sql
tests/unit/redirect.test.ts
tests/e2e/fundacao.spec.ts
.github/workflows/ci.yml
```

---

### Task 1: Projeto, tokens e CI

**Files:**
- Create: `package.json` (via create-next-app), `app/layout.tsx`, `app/globals.css`, `styles/tokens.css`, `components/brand/Logo.tsx`, `supabase/config.toml` (via `supabase init`), `.github/workflows/ci.yml`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`
- Test: `tests/e2e/fundacao.spec.ts` (primeiro caso)

**Interfaces:**
- Produces: `<Logo variant="horizontal" | "assinatura" | "invertido" />`; CSS variables com os nomes exatos dos tokens (`--surface`, `--surface-raised`, `--ink`, `--ink-muted`, `--brand`, `--on-brand`, `--brand-deep`, `--resina`, `--danger`, …, `--space-1`…`--space-8`, `--radius-sm`…`--radius-pill`); scripts `npm run test:unit`, `npm run test:e2e`, `npm run test:db`.

- [ ] **Step 1:** `npx create-next-app@15 . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*"`, depois `npx supabase init` e `npm i @supabase/ssr @supabase/supabase-js` e `npm i -D vitest @playwright/test`.
- [ ] **Step 2:** Copiar `project/tokens.css` do design system (read do artifact Pinha) para `styles/tokens.css`; mapear no `@theme` do Tailwind (`--color-brand: var(--brand)` etc.). Tema escuro por `[data-theme="dark"]` e `prefers-color-scheme`.
- [ ] **Step 3:** Copiar os SVGs `pinha-mark.svg`, `pinha-mark-branca.svg` e gerar `icon-192.png`/`icon-512.png` de `pinha-icone-app.svg` em `public/icons/`.
- [ ] **Step 4: Teste e2e que falha**

```ts
test('página inicial mostra a marca e a assinatura', async ({ page }) => {
  await page.goto('/entrar');
  await expect(page.getByText('pinha', { exact: true })).toBeVisible();
  await expect(page.getByText('by PINDev', { exact: true })).toBeVisible();
});
```

- [ ] **Step 5:** `npx playwright test -g "marca"` → FAIL (rota não existe).
- [ ] **Step 6:** Criar `Logo.tsx` e uma `app/(auth)/entrar/page.tsx` mínima com `<Logo variant="assinatura" />`.
- [ ] **Step 7:** `npx playwright test -g "marca"` → PASS.
- [ ] **Step 8:** `ci.yml`: job único em ubuntu com `supabase/setup-cli`, `supabase start`, `supabase test db`, `npm run test:unit`, `npx playwright install --with-deps chromium`, `npm run build`, `npm run test:e2e`.
- [ ] **Step 9:** Commit `chore: projeto Next.js + Supabase com tokens Pinha e CI`.

---

### Task 2: Espaços, membros e RLS

**Files:**
- Create: `supabase/migrations/20261019000001_fundacao.sql`
- Test: `supabase/tests/001_espacos_rls.test.sql`

**Interfaces:**
- Produces (SQL):
  - `profiles(id uuid pk references auth.users on delete cascade, nome text not null, apelido text, foto_url text, criado_em timestamptz default now())`; trigger `on_auth_user_created` cria a linha com `nome = coalesce(raw_user_meta_data->>'nome', split_part(email,'@',1))`.
  - `spaces(id uuid pk default gen_random_uuid(), nome text not null check (length(trim(nome)) between 1 and 60), moeda text not null default 'BRL', fuso text not null default 'America/Sao_Paulo', criado_por uuid references profiles, criado_em timestamptz default now())`
  - `space_members(space_id uuid references spaces on delete cascade, user_id uuid references profiles on delete cascade, papel text not null check (papel in ('dono','membro')), cor_pessoa smallint not null check (cor_pessoa between 1 and 8), entrou_em timestamptz default now(), primary key (space_id, user_id))`
  - `is_member(p_space uuid) returns boolean` e `is_owner(p_space uuid) returns boolean` — `security definer`, `stable`, usando `auth.uid()`.
  - `create_space(p_nome text, p_fuso text default 'America/Sao_Paulo') returns uuid` — cria o espaço e a membership `dono`, `cor_pessoa = 1`.
  - `update_space(p_space uuid, p_nome text) returns void` — só dono; senão `raise exception 'sem_permissao'`.
- Policies: `profiles` select se é o próprio ou divide algum espaço; update só o próprio. `spaces` select se `is_member(id)`; sem insert/update/delete direto (só pelas funções). `space_members` select se `is_member(space_id)`; sem escrita direta.

- [ ] **Step 1: Testes pgTAP que falham** (usuários de teste criados com `tests.create_supabase_user` do pacote `basejump-supabase_test_helpers`, ou insert direto em `auth.users`)

```sql
-- renan cria espaço; ellen é estranha
select tests.authenticate_as('renan');
select lives_ok($$ select create_space('Família Pinheiro') $$, 'cria espaço');
select is((select papel from space_members where user_id = auth.uid()), 'dono', 'criador é dono');
select tests.authenticate_as('estranho');
select is_empty($$ select * from spaces $$, 'estranho não vê espaço');
select is_empty($$ select * from space_members $$, 'estranho não vê membros');
select throws_ok($$ insert into spaces(nome) values ('x') $$, '42501', null, 'insert direto bloqueado');
select throws_ok($$ select update_space((select id from spaces limit 1), 'X') $$, 'sem_permissao');
select throws_ok($$ select create_space('   ') $$, '23514', null, 'nome vazio recusado');
```

- [ ] **Step 2:** `npx supabase test db` → FAIL (funções inexistentes).
- [ ] **Step 3:** Escrever a migration com as tabelas, trigger, funções e policies acima; `alter table ... enable row level security` em todas.
- [ ] **Step 4:** `npx supabase db reset && npx supabase test db` → PASS.
- [ ] **Step 5:** Commit `feat(db): espaços, membros e RLS`.

---

### Task 3: Sessão e redirecionamento seguro

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `lib/redirect.ts`, `lib/espaco.ts`
- Test: `tests/unit/redirect.test.ts`

**Interfaces:**
- Produces: `safeNext(next: string | null | undefined): string` (retorna o caminho se começa com `/` e não com `//` nem `/\`, senão `'/mes'`); `getCurrentSpace(): Promise<{ id: string; nome: string; papel: 'dono' | 'membro' } | null>` (primeiro espaço por `entrou_em`); `createClient()` nos dois arquivos de supabase.
- Middleware: rotas de `(app)`, `/comecar` e `/configuracoes` exigem sessão; sem sessão → `/entrar?next=<caminho>`. Com sessão e sem espaço em rotas de `(app)` → `/comecar`.

- [ ] **Step 1: Teste que falha**

```ts
import { safeNext } from '@/lib/redirect';
test.each([
  ['/contas', '/contas'],
  ['/convite/abc?x=1', '/convite/abc?x=1'],
  ['//evil.com', '/mes'],
  ['/\\evil.com', '/mes'],
  ['https://evil.com', '/mes'],
  ['', '/mes'],
  [null, '/mes'],
])('safeNext(%s) = %s', (inp, out) => expect(safeNext(inp)).toBe(out));
```

- [ ] **Step 2:** `npm run test:unit` → FAIL.
- [ ] **Step 3:** Implementar `safeNext` e os clientes Supabase conforme a documentação do `@supabase/ssr` para App Router.
- [ ] **Step 4:** `npm run test:unit` → PASS.
- [ ] **Step 5:** Commit `feat: sessão Supabase e redirecionamento seguro`.

---

### Task 4: Convites e gestão de membros

**Files:**
- Create: `supabase/migrations/20261019000002_convites.sql`
- Test: `supabase/tests/002_convites.test.sql`

**Interfaces:**
- Produces (SQL):
  - `invites(id uuid pk, space_id uuid references spaces on delete cascade, email text, token_hash text not null unique, criado_por uuid references profiles, criado_em timestamptz default now(), expira_em timestamptz not null, usado_em timestamptz, usado_por uuid, revogado_em timestamptz)`; select só para dono do espaço; sem escrita direta.
  - `create_invite(p_space uuid, p_email text default null) returns text` — só dono; gera 32 bytes aleatórios em base64url, guarda `encode(digest(token,'sha256'),'hex')`, `expira_em = now() + interval '7 days'`; retorna o token cru (única vez que existe).
  - `revoke_invite(p_invite uuid) returns void` — só dono.
  - `accept_invite(p_token text) returns uuid` — faz `trim` do token; erros `convite_invalido` (não existe ou revogado), `convite_expirado`, `convite_usado`; se já é membro, não duplica e retorna o `space_id`; novo membro entra como `membro` com a menor `cor_pessoa` livre; marca `usado_em/usado_por`.
  - `remove_member(p_space uuid, p_user uuid) returns void` — só dono; dono não remove a si mesmo (`dono_nao_pode_sair`).

- [ ] **Step 1: Testes pgTAP que falham**

```sql
select tests.authenticate_as('renan');
select create_space('Família Pinheiro') as sid \gset
select create_invite(:'sid') as tok \gset
select tests.authenticate_as('ellen');
select is(accept_invite(E'  ' || :'tok' || E'\n'), :'sid'::uuid, 'aceita com espaços em volta');
select is((select papel from space_members where user_id = auth.uid()), 'membro');
select is((select cor_pessoa from space_members where user_id = auth.uid()), 2::smallint);
select throws_ok(format('select accept_invite(%L)', :'tok'), 'convite_usado');
select throws_ok($$ select create_invite((select id from spaces limit 1)) $$, 'sem_permissao', 'membro não convida');
select throws_ok($$ select accept_invite('nao-existe') $$, 'convite_invalido');
-- convite vencido
select tests.authenticate_as('renan');
select create_invite(:'sid') as tok2 \gset
update invites set expira_em = now() - interval '1 second' where token_hash = encode(digest(:'tok2','sha256'),'hex');
select tests.authenticate_as('outro');
select throws_ok(format('select accept_invite(%L)', :'tok2'), 'convite_expirado');
-- já membro aceitando de novo
select tests.authenticate_as('renan');
select create_invite(:'sid') as tok3 \gset
select tests.authenticate_as('ellen');
select is(accept_invite(:'tok3'), :'sid'::uuid, 'já membro: sem erro');
select is((select count(*) from space_members where user_id = auth.uid())::int, 1, 'sem duplicar');
-- remoção
select tests.authenticate_as('renan');
select throws_ok(format('select remove_member(%L, auth.uid())', :'sid'), 'dono_nao_pode_sair');
select lives_ok(format('select remove_member(%L, %L)', :'sid', tests.get_supabase_uid('ellen')));
select tests.authenticate_as('ellen');
select is_empty($$ select * from spaces $$, 'removida não vê mais o espaço');
```

- [ ] **Step 2:** `npx supabase test db` → FAIL.
- [ ] **Step 3:** Migration com `create extension if not exists pgcrypto`, tabela, policies e funções acima.
- [ ] **Step 4:** `npx supabase db reset && npx supabase test db` → PASS.
- [ ] **Step 5:** Commit `feat(db): convites e gestão de membros`.

---

### Task 5: Telas de login, cadastro e recuperação

**Files:**
- Create: `app/(auth)/entrar/page.tsx` (completa), `app/(auth)/criar-conta/page.tsx`, `app/(auth)/recuperar-senha/page.tsx`, `app/auth/callback/route.ts`
- Modify: `supabase/config.toml` (Google provider via env; `enable_confirmations = false` só no local)
- Test: `tests/e2e/fundacao.spec.ts`

**Interfaces:**
- Consumes: `safeNext`, `createClient`, `<Logo variant="assinatura" />`.
- Produces: rotas `/entrar?next=`, `/criar-conta?next=`, `/recuperar-senha`, `/auth/callback?code=&next=`.
- Copy exata: botões "Entrar", "Criar conta", "Continuar com Google", "Enviar link"; erro de login "E-mail ou senha não conferem. Confira e tente de novo."; e-mail é normalizado com `trim().toLowerCase()` antes de enviar.

- [ ] **Step 1: Testes e2e que falham**

```ts
test('cria conta e cai em /comecar', async ({ page }) => {
  const email = `Renan+${Date.now()}@Teste.com`;
  await page.goto('/criar-conta');
  await page.getByLabel('Nome').fill('Renan');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-forte-123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/comecar$/);
});
test('login aceita e-mail com outra caixa', async ({ page }) => { /* cria com Renan@Teste.com, entra com renan@teste.com, chega em /comecar */ });
test('senha errada mostra a mensagem', async ({ page }) => { /* espera o texto exato do erro */ });
test('next externo é ignorado', async ({ page }) => { /* /entrar?next=//evil.com → após login URL termina em /comecar ou /mes */ });
```

- [ ] **Step 2:** `npm run test:e2e` → FAIL.
- [ ] **Step 3:** Implementar as páginas com server actions (`signUp` com `options.data.nome`, `signInWithPassword`, `signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback?next=' } })`, `resetPasswordForEmail`) e o callback com `exchangeCodeForSession`.
- [ ] **Step 4:** `npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `feat: login, cadastro e recuperação de senha`.

---

### Task 6: Criar o espaço e o shell do app

**Files:**
- Create: `app/comecar/page.tsx`, `lib/actions/espaco.ts`, `app/(app)/layout.tsx`, `app/(app)/mes/page.tsx`, `components/shell/BottomNav.tsx`, `components/shell/Sidebar.tsx`, `components/shell/ThemeToggle.tsx`, `public/manifest.webmanifest`
- Test: `tests/e2e/fundacao.spec.ts`

**Interfaces:**
- Consumes: `create_space` (RPC), `getCurrentSpace()`.
- Produces: `criarEspaco(formData: FormData): Promise<{ erro?: string }>` (redireciona para `/mes` em sucesso); BottomNav com itens Mês `/mes`, Contas `/contas`, `+` `/novo`, Cartões `/cartoes`, Carteira `/carteira`; Sidebar com os mesmos + Recorrentes `/recorrentes`, Configurações `/configuracoes/membros`, e `<Logo variant="assinatura" />` no rodapé. Rotas ainda não construídas mostram "Chega na próxima fase." Manifest: `name` "Pinha", `short_name` "Pinha", `theme_color` e `background_color` = valores claros de `--brand-deep` e `--surface`, `display` "standalone", `lang` "pt-BR".

- [ ] **Step 1: Teste e2e que falha**

```ts
test('cria o espaço e vê o mês', async ({ page }) => {
  // usuário novo logado
  await page.getByLabel('Nome do espaço').fill('Família Pinheiro');
  await page.getByRole('button', { name: 'Criar espaço' }).click();
  await expect(page).toHaveURL(/\/mes$/);
  await expect(page.getByText('Família Pinheiro')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Mês' })).toBeVisible();
  await expect(page.getByText('by PINDev')).toBeHidden(); // não aparece na tela do dia a dia no celular
});
```

- [ ] **Step 2:** `npm run test:e2e -g "espaço"` → FAIL.
- [ ] **Step 3:** Implementar `/comecar` (campo "Nome do espaço", valor sugerido vazio, erro "Dê um nome ao espaço" para vazio), o layout responsivo (BottomNav < 768px, Sidebar ≥ 768px), o placeholder do mês com o nome do espaço e o mês atual em `title-lg`, o toggle de tema (persistido em cookie), o manifest e o link `<link rel="manifest">`.
- [ ] **Step 4:** `npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `feat: criação do espaço e shell do app`.

---

### Task 7: Membros e convite pela interface

**Files:**
- Create: `app/(app)/configuracoes/membros/page.tsx`, `lib/actions/convites.ts`, `app/convite/[token]/page.tsx`
- Test: `tests/e2e/fundacao.spec.ts`

**Interfaces:**
- Consumes: `create_invite`, `revoke_invite`, `accept_invite`, `remove_member` (RPC), `getCurrentSpace()`, `safeNext`.
- Produces: `criarConvite(): Promise<{ link: string } | { erro: string }>` (link = `${origin}/convite/${token}`), `revogarConvite(id: string)`, `removerMembro(userId: string)`, `aceitarConvite(token: string)`.
- Tela de membros: lista com avatar (cor de pessoa), nome, papel; dono vê "Gerar link de convite" (mostra o link com botão "Copiar" e "Compartilhar no WhatsApp" via `https://wa.me/?text=`), convites pendentes com validade e "Cancelar", e "Remover" por membro. Membro vê só a lista.
- `/convite/[token]`: sem sessão → `/criar-conta?next=/convite/<token>` com link "Já tenho conta" para `/entrar?next=…`; com sessão → aceita e vai para `/mes`. Mensagens: `convite_invalido` "Este convite não existe ou foi cancelado.", `convite_expirado` "Este convite venceu. Peça um novo a quem te convidou.", `convite_usado` "Este convite já foi usado."
- Envio do convite por e-mail entra na Fase 4, junto com o provedor de e-mail dos alertas.

- [ ] **Step 1: Teste e2e que falha** (dois contextos de navegador)

```ts
test('Renan convida, Ellen entra e vê o mesmo espaço', async ({ browser }) => {
  // renan: cria conta + espaço, gera link em /configuracoes/membros, lê o link do campo
  // ellen: abre o link sem sessão → cria conta → cai em /mes com "Família Pinheiro"
  // renan: recarrega membros → vê Ellen como "membro"
  // ellen: abre /configuracoes/membros → não vê "Gerar link de convite"
  // renan: gera um segundo link; ellen (já membro) abre → vai para /mes sem erro (Review Focus 2)
  // outra pessoa abre o primeiro link → vê "Este convite já foi usado."
});
```

- [ ] **Step 2:** `npm run test:e2e -g "convida"` → FAIL.
- [ ] **Step 3:** Implementar telas e actions.
- [ ] **Step 4:** `npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit `feat: convite por link e gestão de membros`.

---

### Task 8: Publicar

**Files:**
- Modify: `README.md` (como rodar localmente, variáveis de ambiente)

- [ ] **Step 1:** Criar projeto Supabase (região São Paulo se disponível), rodar `npx supabase link` e `npx supabase db push`; configurar Google OAuth e URL do site.
- [ ] **Step 2:** Criar projeto na Vercel ligado ao GitHub com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] **Step 3:** Verificação manual em produção: criar conta, criar espaço, gerar convite, aceitar em outro aparelho, instalar na tela inicial do celular (Android e iPhone), alternar tema.
- [ ] **Step 4:** Commit `docs: como rodar e publicar`.
