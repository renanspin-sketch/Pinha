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
