import { chromium } from '@playwright/test'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  const logs = []
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`
    logs.push(text)
    if (msg.type() === 'error' || text.includes('compress')) console.log(text)
  })

  await page.goto('http://localhost:3002/')

  const slider = page.locator('input[type="range"]')
  await slider.fill('60')

  const input = page.locator('input[type="file"]')
  await input.setInputFiles(['/tmp/test-image.png'])

  // Wait longer for compression
  await page.waitForTimeout(15000)

  const cards = page.locator('.card')
  const count = await cards.count()

  console.log('\n=== RESULTS ===')
  for (let i = 0; i < count; i++) {
    const name = await cards.nth(i).locator('.card__name').textContent().catch(() => '?')
    const sizeText = await cards.nth(i).locator('.card__size').textContent().catch(() => '?')
    const badge = await cards.nth(i).locator('.card__badge').textContent().catch(() => '?')
    const meta = await cards.nth(i).locator('.card__meta').textContent().catch(() => '?')
    console.log(`${name}  ${sizeText}  ${badge}  ${meta}`)
  }

  // Check for error states
  const statusText = await page.locator('.app__status').textContent().catch(() => '')
  console.log(`Status: "${statusText}"`)

  if (logs.length) {
    console.log('\n=== CONSOLE LOGS ===')
    logs.forEach(l => console.log(l))
  }

  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
