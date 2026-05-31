/**
 * @agent-context E2E smoke — reduced motion for stable navigation (matrix skipped in CI).
 */
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test.describe('lobby', () => {
  test('shows Brutal wibe title and footnotes accordion', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Brutal wibe')
    await expect(page.getByRole('button', { name: /\[1\]/ })).toBeVisible()
    await expect(page.getByText('Testnet only')).toBeVisible()
  })

  test('game cards navigate to dice and slot routes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Glitch Roll/i }).click()
    await expect(page).toHaveURL(/\/games\/dice/)
    await page.goto('/')
    await page.getByRole('button', { name: /Corrupted Reels/i }).click()
    await expect(page).toHaveURL(/\/games\/slot/)
  })
})

test.describe('games', () => {
  test('dice shows fun funds bar by default', async ({ page }) => {
    await page.goto('/games/dice')
    await expect(page.getByText(/fun credits|fun-кредит/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Refill|Пополнить|Поповнити/i })).toBeVisible()
  })
})

test.describe('i18n', () => {
  test('locale switcher changes UI language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /^EN\b/i }).click()
    await page.getByRole('menuitem', { name: 'RU' }).click()
    await expect(page.getByRole('button', { name: 'Подключить Phantom' })).toBeVisible()
    await page.getByRole('button', { name: /^RU\b/i }).click()
    await page.getByRole('menuitem', { name: 'UK' }).click()
    await expect(page.getByRole('button', { name: 'Підключити Phantom' })).toBeVisible()
  })
})
