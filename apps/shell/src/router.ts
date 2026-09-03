import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlaygroundView from './views/PlaygroundView.vue'

export const router = createRouter({
  history:
    process.env.ROUTER_MODE === 'hash'
      ? createWebHashHistory(process.env.APP_BASE_PATH)
      : createWebHistory(process.env.APP_BASE_PATH),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/playground', name: 'playground', component: PlaygroundView },
  ],
})
