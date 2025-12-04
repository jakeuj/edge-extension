// ============================================
// 設定 Store - 管理使用者設定
// ============================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types/constants'
import { storageService } from '@/services'

/**
 * 使用者設定管理
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 初始化設定
   */
  async function init(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      const result = await storageService.getSettings()

      if (result.success && result.data) {
        settings.value = result.data
      } else {
        // 使用預設設定
        settings.value = { ...DEFAULT_SETTINGS }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入設定失敗'
      settings.value = { ...DEFAULT_SETTINGS }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新設定
   */
  async function updateSettings(newSettings: Partial<UserSettings>): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      // 合併設定
      const mergedSettings = {
        ...settings.value,
        ...newSettings,
      }

      // 儲存到本地
      const result = await storageService.saveSettings(mergedSettings)

      if (result.success) {
        settings.value = mergedSettings
        return true
      } else {
        error.value = result.error || '儲存設定失敗'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '儲存設定失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 重置為預設設定
   */
  async function resetToDefaults(): Promise<boolean> {
    return await updateSettings(DEFAULT_SETTINGS)
  }

  /**
   * 清除錯誤訊息
   */
  function clearError(): void {
    error.value = null
  }

  return {
    // State
    settings,
    isLoading,
    error,

    // Actions
    init,
    updateSettings,
    resetToDefaults,
    clearError,
  }
})

