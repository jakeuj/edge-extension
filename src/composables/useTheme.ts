// ============================================
// useTheme Composable - 主題切換邏輯
// ============================================

import { computed } from 'vue'
import { useThemeStore } from '@/stores'
import type { ThemeType } from '@/types'

/**
 * 主題相關邏輯的組合式函數
 */
export function useTheme() {
  const themeStore = useThemeStore()

  // Computed
  const currentTheme = computed(() => themeStore.currentTheme)
  const currentThemeName = computed(() => themeStore.getThemeName(themeStore.currentTheme))

  /**
   * 設定主題
   */
  async function setTheme(theme: ThemeType) {
    return await themeStore.setTheme(theme)
  }

  /**
   * 切換主題
   */
  async function toggleTheme() {
    return await themeStore.toggleTheme()
  }

  /**
   * 取得主題名稱
   */
  function getThemeName(theme: ThemeType) {
    return themeStore.getThemeName(theme)
  }

  return {
    // State
    currentTheme,
    currentThemeName,

    // Methods
    setTheme,
    toggleTheme,
    getThemeName,
  }
}

