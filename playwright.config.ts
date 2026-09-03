import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'NX_DAEMON=false pnpm exec nx run remote-playground:dev',
      url: 'http://localhost:3001/mf-manifest.json',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'NX_DAEMON=false pnpm exec nx run shell:dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
})
