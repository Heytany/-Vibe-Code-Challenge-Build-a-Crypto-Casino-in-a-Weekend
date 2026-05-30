import { defineConfig, devices } from '@playwright/test'

/**
 * @agent-context E2E smoke tests — app boot, routes, i18n, footnotes.
 * @run pnpm test:e2e (starts dev server automatically)
 * @failure-modes: Env overlay blocks UI → check .env; i18n keys missing → console errors
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'NUXT_IGNORE_LOCK=1 pnpm build && NUXT_IGNORE_LOCK=1 pnpm preview --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
