/**
 * @agent-context E2E: lobby loads with Brutal wibe branding and footer footnotes.
 * @env Requires valid .env or .env.example values copied to .env
 */
import { test, expect } from '@playwright/test'

test.describe('lobby', () => {
  test('shows Brutal wibe title and footnotes accordion', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Brutal wibe')
    await expect(page.getByRole('button', { name: /\[1\]/ })).toBeVisible()
    await expect(page.getByText('Testnet only')).toBeVisible()
  })

  test('game cards link to dice and slot routes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Glitch Roll/i }).click()
    await expect(page).toHaveURL(/\/games\/dice/)
    await page.goto('/')
    await page.getByRole('link', { name: /Corrupted Reels/i }).click()
    await expect(page).toHaveURL(/\/games\/slot/)
  })
})

test.describe('i18n', () => {
  test('locale switcher changes UI language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Русский' }).click()
    await expect(page.getByRole('button', { name: 'Подключить Phantom' })).toBeVisible()
    await page.getByRole('button', { name: 'Українська' }).click()
    await expect(page.getByRole('button', { name: 'Підключити Phantom' })).toBeVisible()
  })
})
