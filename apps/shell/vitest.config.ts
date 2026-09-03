import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/shell/src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
