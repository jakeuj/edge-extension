// ============================================
// useAuth Composable - 認證邏輯封裝
// ============================================

import { computed } from 'vue'
import { useAuthStore } from '@/stores'

/**
 * 認證相關邏輯的組合式函數
 */
export function useAuth() {
  const authStore = useAuthStore()

  // Computed
  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const serverKey = computed(() => authStore.serverKey)
  const savedAccount = computed(() => authStore.savedAccount)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  /**
   * 登入
   */
  async function login(account: string, password: string, remember: boolean = false) {
    return await authStore.login({ account, password, remember })
  }

  /**
   * 登出
   */
  async function logout(clearCredentials: boolean = false) {
    return await authStore.logout(clearCredentials)
  }

  /**
   * 自動重新登入
   */
  async function autoRelogin() {
    return await authStore.autoRelogin()
  }

  /**
   * 檢查 Session 是否即將過期
   */
  function isSessionExpiringSoon() {
    return authStore.isSessionExpiringSoon()
  }

  /**
   * 清除錯誤訊息
   */
  function clearError() {
    authStore.clearError()
  }

  return {
    // State
    isLoggedIn,
    isAuthenticated,
    serverKey,
    savedAccount,
    isLoading,
    error,

    // Methods
    login,
    logout,
    autoRelogin,
    isSessionExpiringSoon,
    clearError,
  }
}

