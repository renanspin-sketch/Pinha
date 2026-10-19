import { test, expect } from "@playwright/test";

test("página inicial mostra a marca e a assinatura", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByText("pinha", { exact: true })).toBeVisible();
  await expect(page.getByText("by PINDev", { exact: true })).toBeVisible();
});
