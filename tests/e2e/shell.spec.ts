import { test, expect } from '@playwright/test'

test('shell loads the federated playground', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/playground')
  await expect(page.getByRole('heading', { name: '产品 Shell' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '独立 Remote 已加载' })).toBeVisible()

  const stateButton = page.getByRole('button', { name: '测试状态：0' })
  await stateButton.click()
  await expect(page.getByRole('button', { name: '测试状态：1' })).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('remote playground runs independently', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await expect(page.getByRole('heading', { name: '独立 Remote 已加载' })).toBeVisible()
})
