import { defineConfig } from '@rsbuild/core'
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin'
import { pluginVue } from '@rsbuild/plugin-vue'

const remoteUrl =
  process.env.REMOTE_PLAYGROUND_URL ??
  (process.env.NODE_ENV === 'production'
    ? '/_mf/remote-playground/current/mf-manifest.json'
    : 'http://localhost:3001/mf-manifest.json')
const publicPath = process.env.PUBLIC_PATH ?? '/'
const routerMode = process.env.ROUTER_MODE ?? 'history'

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginModuleFederation(
      {
        name: 'shell',
        remotes: {
          remote_playground: `remote_playground@${remoteUrl}`,
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
    entry: { index: './apps/shell/src/main.ts' },
    define: {
      'process.env.APP_BASE_PATH': JSON.stringify(publicPath),
      'process.env.ROUTER_MODE': JSON.stringify(routerMode),
    },
  },
  html: {
    template: './apps/shell/index.html',
  },
  output: {
    assetPrefix: publicPath,
    distPath: { root: 'dist/apps/shell' },
  },
  server: {
    port: 3000,
  },
})
