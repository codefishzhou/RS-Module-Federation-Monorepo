import { defineConfig } from '@rsbuild/core'
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin'
import { pluginVue } from '@rsbuild/plugin-vue'

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginModuleFederation(
      {
        name: 'remote_playground',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './apps/remote-playground/src/App.vue',
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.13' },
          pinia: { singleton: true, requiredVersion: '^3.0.1' },
          'vue-router': { singleton: true, requiredVersion: '^4.5.0' },
          '@tanstack/vue-query': { singleton: true, requiredVersion: '^5.66.8' },
        },
      },
      {},
    ),
  ],
  source: {
    entry: { index: './apps/remote-playground/src/main.ts' },
  },
  html: {
    template: './apps/remote-playground/index.html',
  },
  output: {
    assetPrefix: process.env.MF_ASSET_PREFIX ?? 'auto',
    distPath: { root: 'dist/apps/remote-playground' },
  },
  server: {
    port: 3001,
    cors: {
      origin: 'http://localhost:3000',
    },
  },
})
