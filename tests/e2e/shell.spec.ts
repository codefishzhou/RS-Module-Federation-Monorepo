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

test('shell embeds a static HTML tool', async ({ page }) => {
  await page.goto('/tools/json-formatter')
  await expect(page.getByRole('heading', { name: '产品 Shell' })).toBeVisible()

  const tool = page.frameLocator('iframe[title="JSON 格式化"]')
  await expect(tool.getByRole('heading', { name: 'JSON 格式化' })).toBeVisible()
  await tool.getByRole('button', { name: '格式化' }).click()
  await expect(tool.getByRole('status')).toHaveText('JSON 有效，已处理')
})

test('shell embeds the ZIP manager', async ({ page }) => {
  await page.goto('/tools/zip-manager')
  await expect(page.getByRole('heading', { name: '产品 Shell' })).toBeVisible()

  const tool = page.frameLocator('iframe[title="ZIP 压缩与解压"]')
  await expect(tool.getByRole('heading', { name: 'ZIP 压缩与解压' })).toBeVisible()

  await tool.locator('#compress-files').setInputFiles({
    name: 'example.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('ZIP manager smoke test'),
  })
  await expect(tool.getByText('example.txt')).toBeVisible()
  await expect(tool.getByRole('button', { name: '生成 ZIP' })).toBeEnabled()

  const downloadPromise = page.waitForEvent('download')
  await tool.getByRole('button', { name: '生成 ZIP' }).click()
  const archive = await downloadPromise
  expect(archive.suggestedFilename()).toBe('archive.zip')
  const archivePath = await archive.path()
  expect(archivePath).not.toBeNull()

  await tool.getByRole('tab', { name: '解压' }).click()
  await expect(tool.getByText('拖入一个 ZIP 文件')).toBeVisible()
  await tool.locator('#extract-file').setInputFiles(archivePath!)
  await expect(tool.locator('#extract-panel').getByText('example.txt')).toBeVisible()
  await expect(tool.getByRole('button', { name: '下载全部' })).toBeEnabled()
})
