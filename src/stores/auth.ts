// ============================================
// 認證 Store - 管理使用者認證狀態
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LoginCredentials, LoginResponse } from '@/types'
import { authService } from '@/services'

/**
 * 認證狀態管理
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const isLoggedIn = ref(false)
  const serverKey = ref<string | null>(null)
  const savedAccount = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => isLoggedIn.value && serverKey.value !== null)

  /**
   * 初始化認證狀態
   */
  async function init(): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      const result = await authService.init()
      isLoggedIn.value = result

      if (result) {
        serverKey.value = authService.getServerKey()
        savedAccount.value = await authService.getSavedAccount()
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登入
   */
  async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      isLoading.value = true
      error.value = null

      const result = await authService.login(credentials)

      if (result.success && result.serverKey) {
        isLoggedIn.value = true
        serverKey.value = result.serverKey
        savedAccount.value = credentials.account
      } else {
        error.value = result.error || '登入失敗'
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登入失敗'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout(clearCredentials: boolean = false): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await authService.logout(clearCredentials)

      isLoggedIn.value = false
      serverKey.value = null

      if (clearCredentials) {
        savedAccount.value = ''
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登出失敗'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 自動重新登入
   */
  async function autoRelogin(): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      const result = await authService.attemptAutoRelogin()

      if (result.success && result.serverKey) {
        isLoggedIn.value = true
        serverKey.value = result.serverKey
        return true
      }

      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '自動重新登入失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 檢查 Session 是否即將過期
   */
  function isSessionExpiringSoon(): boolean {
    return authService.isSessionExpiringSoon()
  }

  /**
   * 清除錯誤訊息
   */
  function clearError(): void {
    error.value = null
  }

  return {
    // State
    isLoggedIn,
    serverKey,
    savedAccount,
    isLoading,
    error,

    // Getters
    isAuthenticated,

    // Actions
    init,
    login,
    logout,
    autoRelogin,
    isSessionExpiringSoon,
    clearError,
  }
})

