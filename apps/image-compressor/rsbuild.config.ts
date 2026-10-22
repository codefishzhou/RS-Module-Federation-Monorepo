import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'

const port = Number(process.env.IMAGE_COMPRESSOR_PORT ?? 3002)

export default defineConfig({
  plugins: [pluginVue()],
  source: {
    entry: { index: './apps/image-compressor/src/main.ts' },
  },
  html: {
    template: './apps/image-compressor/index.html',
  },
  output: {
    distPath: { root: 'dist/apps/image-compressor' },
  },
  server: {
    port,
    strictPort: true,
  },
})
