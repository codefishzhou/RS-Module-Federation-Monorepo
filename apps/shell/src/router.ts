import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlaygroundView from './views/PlaygroundView.vue'
import HtmlToolView from './views/HtmlToolView.vue'
import ToolsView from './views/ToolsView.vue'

export const router = createRouter({
  history:
    process.env.ROUTER_MODE === 'hash'
      ? createWebHashHistory(process.env.APP_BASE_PATH)
      : createWebHistory(process.env.APP_BASE_PATH),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/playground', name: 'playground', component: PlaygroundView },
    { path: '/tools', name: 'tools', component: ToolsView },
    { path: '/tools/:toolId', name: 'html-tool', component: HtmlToolView },
  ],
})
