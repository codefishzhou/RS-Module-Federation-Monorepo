import { createApp, defineAsyncComponent, h } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import './styles.css'

const app = createApp(App)
const queryClient = new QueryClient()

app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.component(
  'RemotePlayground',
  defineAsyncComponent({
    loader: () => import('remote_playground/App'),
    timeout: 10000,
    errorComponent: {
      setup() {
        return () => h('p', { class: 'error' }, 'Remote 加载失败，请检查 Manifest 和远程资源。')
      },
    },
  }),
)
app.mount('#app')
