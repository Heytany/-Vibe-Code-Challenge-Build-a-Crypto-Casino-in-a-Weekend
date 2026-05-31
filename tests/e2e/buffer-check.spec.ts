/**
 * @agent-context Guards against Buffer polyfill regressions on lobby boot.
 */
import { test, expect } from '@playwright/test'

test('lobby loads without Buffer is not defined', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Brutal wibe')

  const bufferErrors = pageErrors.filter((m) => /Buffer is not defined/i.test(m))
  expect(bufferErrors, bufferErrors.join('\n')).toEqual([])
})
