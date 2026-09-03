import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/remote-playground/src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
