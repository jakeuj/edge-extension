// ============================================
// Vue Router 配置
// ============================================

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

// 路由定義
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      title: '登入',
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      requiresAuth: true,
      title: '首頁',
    },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: {
      requiresAuth: true,
      title: '歷史記錄',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      title: '設定',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/home',
  },
]

// 建立路由實例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守衛 - 認證檢查
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化認證狀態（僅在首次導航時）
  if (!authStore.isLoggedIn && from.name === undefined) {
    await authStore.init()
  }

  // 檢查路由是否需要認證
  const requiresAuth = to.meta['requiresAuth'] !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要認證但未登入，導向登入頁
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // 已登入但訪問登入頁，導向首頁
    next({ name: 'Home' })
  } else {
    // 允許導航
    next()
  }
})

// 路由守衛 - 設定頁面標題
router.afterEach((to) => {
  const title = to.meta['title'] as string | undefined
  if (title) {
    document.title = `${title} - 技嘉出勤時間追蹤器`
  }
})

export default router

