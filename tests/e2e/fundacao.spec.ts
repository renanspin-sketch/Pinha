import { test, expect, type Page } from "@playwright/test";

const SEM_SUPABASE = !process.env.NEXT_PUBLIC_SUPABASE_URL;
const SENHA = "senha-forte-123";

test("página inicial mostra a marca e a assinatura", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByText("pinha", { exact: true })).toBeVisible();
  await expect(page.getByText("by PINDev", { exact: true })).toBeVisible();
});

test("telas de acesso têm os campos e links esperados", async ({ page }) => {
  await page.goto("/criar-conta?next=/contas");
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Entrar/ })).toHaveAttribute("href", "/entrar?next=%2Fcontas");
  await page.goto("/recuperar-senha");
  await expect(page.getByRole("button", { name: "Enviar link" })).toBeVisible();
});

test("link expirado mostra aviso em /entrar", async ({ page }) => {
  await page.goto("/entrar?erro=link");
  await expect(page.getByText("O link expirou ou já foi usado. Peça outro.")).toBeVisible();
});

async function criar(page: Page, email: string) {
  await page.goto("/criar-conta");
  await page.getByLabel("Nome").fill("Renan");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
}

test.describe("com Supabase Auth", () => {
  test.skip(SEM_SUPABASE, "requer Supabase");

  test("cria conta e cai em /comecar", async ({ page }) => {
    await criar(page, `Renan+${Date.now()}@Teste.com`);
    await expect(page).toHaveURL(/\/comecar$/);
  });

  test("login aceita e-mail com outra caixa", async ({ page, context }) => {
    const stamp = Date.now();
    await criar(page, `Renan+${stamp}@Teste.com`);
    await expect(page).toHaveURL(/\/comecar$/);
    await context.clearCookies();
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(`renan+${stamp}@teste.com`);
    await page.getByLabel("Senha").fill(SENHA);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/comecar$/);
  });

  test("senha errada mostra a mensagem", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill(`ninguem+${Date.now()}@teste.com`);
    await page.getByLabel("Senha").fill("senha-errada-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("E-mail ou senha não conferem. Confira e tente de novo.")).toBeVisible();
  });

  test("next externo é ignorado", async ({ page, context }) => {
    const stamp = Date.now();
    await criar(page, `Renan+${stamp}@Teste.com`);
    await expect(page).toHaveURL(/\/comecar$/);
    await context.clearCookies();
    await page.goto("/entrar?next=//evil.com");
    await page.getByLabel("E-mail").fill(`renan+${stamp}@teste.com`);
    await page.getByLabel("Senha").fill(SENHA);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/(comecar|mes)$/);
  });

  test("redefinir senha sem sessão manda para o login", async ({ page }) => {
    await page.goto("/redefinir-senha");
    await expect(page).toHaveURL(/\/entrar\?next=%2Fredefinir-senha/);
  });
});

test("manifest do app é servido", async ({ request }) => {
  const res = await request.get("/manifest.webmanifest");
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.name).toBe("Pinha");
  expect(m.display).toBe("standalone");
});

test.describe("espaço e shell (com Supabase Auth)", () => {
  test.skip(SEM_SUPABASE, "requer Supabase");

  test("cria o espaço e vê o mês", async ({ page }) => {
    await criar(page, `Renan+${Date.now()}@Teste.com`);
    await expect(page).toHaveURL(/\/comecar$/);
    await expect(page.getByRole("heading", { name: "Vamos criar o espaço da sua casa" })).toBeVisible();
    await page.getByRole("button", { name: "Criar espaço" }).click();
    await expect(page.getByText("Dê um nome ao espaço")).toBeVisible();
    await page.getByLabel("Nome do espaço").fill("Família Pinheiro");
    await page.getByRole("button", { name: "Criar espaço" }).click();
    await expect(page).toHaveURL(/\/mes$/);
    await expect(page.getByText("Família Pinheiro")).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Mês" }),
    ).toBeVisible();
    await expect(page.getByText("by PINDev")).toBeHidden(); // não aparece na tela do dia a dia no celular
  });
});

test("convite sem sessão manda para criar conta com next", async ({ page }) => {
  await page.goto("/convite/qualquer-coisa");
  await expect(page).toHaveURL(/\/criar-conta\?next=%2Fconvite%2Fqualquer-coisa$/);
  await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();
});

test.describe("convite entre duas pessoas (com Supabase Auth)", () => {
  test.skip(SEM_SUPABASE, "requer Supabase");

  test("Renan convida, Ellen entra e vê o mesmo espaço", async ({ browser }) => {
    const stamp = Date.now();
    const renanCtx = await browser.newContext();
    const ellenCtx = await browser.newContext();
    const outraCtx = await browser.newContext();
    const renan = await renanCtx.newPage();
    const ellen = await ellenCtx.newPage();
    const outra = await outraCtx.newPage();

    // Renan: conta, espaço e link
    await criar(renan, `Renan+${stamp}@Teste.com`);
    await renan.getByLabel("Nome do espaço").fill("Família Pinheiro");
    await renan.getByRole("button", { name: "Criar espaço" }).click();
    await expect(renan).toHaveURL(/\/mes$/);
    await renan.goto("/configuracoes/membros");
    await renan.getByRole("button", { name: "Gerar link de convite" }).click();
    const link1 = await renan.getByLabel("Link do convite").inputValue();
    expect(link1).toContain("/convite/");

    // Ellen: abre sem sessão, cria conta e cai em /mes no mesmo espaço
    await ellen.goto(link1);
    await expect(ellen).toHaveURL(/\/criar-conta\?next=/);
    await ellen.getByLabel("Nome").fill("Ellen");
    await ellen.getByLabel("E-mail").fill(`ellen+${stamp}@teste.com`);
    await ellen.getByLabel("Senha").fill(SENHA);
    await ellen.getByRole("button", { name: "Criar conta" }).click();
    await expect(ellen).toHaveURL(/\/mes$/);
    await expect(ellen.getByText("Família Pinheiro")).toBeVisible();

    // Renan vê Ellen como membro
    await renan.reload();
    await expect(renan.getByText("Ellen", { exact: true })).toBeVisible();
    await expect(renan.getByText("membro", { exact: true })).toBeVisible();

    // Ellen não vê o convite
    await ellen.goto("/configuracoes/membros");
    await expect(ellen.getByRole("heading", { name: "Pessoas do espaço" })).toBeVisible();
    await expect(ellen.getByRole("button", { name: "Gerar link de convite" })).toHaveCount(0);

    // Segundo link: Ellen, já membro, vai para /mes sem erro
    await renan.getByRole("button", { name: "Gerar link de convite" }).click();
    await expect(renan.getByLabel("Link do convite")).not.toHaveValue(link1);
    const link2 = await renan.getByLabel("Link do convite").inputValue();
    await ellen.goto(link2);
    await expect(ellen).toHaveURL(/\/mes$/);

    // Outra pessoa com o primeiro link (já usado)
    await outra.goto("/criar-conta");
    await outra.getByLabel("Nome").fill("Visita");
    await outra.getByLabel("E-mail").fill(`visita+${stamp}@teste.com`);
    await outra.getByLabel("Senha").fill(SENHA);
    await outra.getByRole("button", { name: "Criar conta" }).click();
    await expect(outra).toHaveURL(/\/comecar$/);
    await outra.goto(link1);
    await expect(outra.getByText("Este convite já foi usado.")).toBeVisible();
    await expect(outra.getByRole("link", { name: "Ir para o início" })).toBeVisible();

    await renanCtx.close();
    await ellenCtx.close();
    await outraCtx.close();
  });
});
