import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: () => import('@/views/ChatPage.vue'),
    },
    {
      path: '/c/:id',
      name: 'conversation',
      component: () => import('@/views/ChatPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsPage.vue'),
    },
  ],
})

export default router