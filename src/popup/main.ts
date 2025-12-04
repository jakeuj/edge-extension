// ============================================
// Popup 應用入口
// ============================================

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import i18n from '@/locales'

// 導入全域樣式
import '@/styles/global.scss'

// 建立 Vue 應用實例
const app = createApp(App)

// 建立 Pinia 實例
const pinia = createPinia()

// 註冊插件
app.use(pinia)
app.use(router)
app.use(i18n)

// 掛載應用
app.mount('#app')

// 開發環境下的除錯資訊
if (import.meta.env.DEV) {
  console.log('🚀 Popup App Started')
  console.log('📦 Vue Version:', app.version)
  console.log('🎨 Theme:', document.documentElement.getAttribute('data-theme'))
}

