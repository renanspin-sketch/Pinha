import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
    locale: "pt-BR",
    // Local: aponte para um Chromium já instalado; no CI fica sem definir.
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
    timezoneId: "America/Sao_Paulo",
  },
  projects: [{ name: "chromium", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: "npm run start",
    url: `http://127.0.0.1:${PORT}/entrar`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
