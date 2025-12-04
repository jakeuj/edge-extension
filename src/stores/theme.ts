// ============================================
// 主題 Store - 管理主題切換
// ============================================

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ThemeType } from '@/types'
import { THEMES, THEME_NAMES } from '@/types/constants'
import { useSettingsStore } from './settings'

/**
 * 主題管理
 */
export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<ThemeType>('light')

  /**
   * 初始化主題
   */
  async function init(): Promise<void> {
    const settingsStore = useSettingsStore()
    await settingsStore.init()

    currentTheme.value = settingsStore.settings.theme

    // 應用主題
    applyTheme(currentTheme.value)

    // 監聽設定變化
    watch(
      () => settingsStore.settings.theme,
      (newTheme) => {
        if (newTheme !== currentTheme.value) {
          setTheme(newTheme)
        }
      }
    )
  }

  /**
   * 設定主題
   */
  async function setTheme(theme: ThemeType): Promise<void> {
    if (!THEMES.includes(theme)) {
      console.warn(`無效的主題: ${theme}，使用預設主題 light`)
      theme = 'light'
    }

    currentTheme.value = theme
    applyTheme(theme)

    // 儲存到設定
    const settingsStore = useSettingsStore()
    await settingsStore.updateSettings({ theme })
  }

  /**
   * 切換主題
   */
  async function toggleTheme(): Promise<void> {
    const currentIndex = THEMES.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % THEMES.length
    const nextTheme = THEMES[nextIndex]!

    await setTheme(nextTheme)
  }

  /**
   * 應用主題到 DOM
   */
  function applyTheme(theme: ThemeType): void {
    // 移除所有主題類別
    document.documentElement.removeAttribute('data-theme')

    // 如果不是 light 主題，添加對應的 data-theme 屬性
    if (theme !== 'light') {
      document.documentElement.setAttribute('data-theme', theme)
    }

    // 儲存到 localStorage 作為備份
    try {
      localStorage.setItem('theme', theme)
    } catch (error) {
      console.warn('無法儲存主題到 localStorage:', error)
    }
  }

  /**
   * 取得主題名稱（用於顯示）
   */
  function getThemeName(theme: ThemeType): string {
    return THEME_NAMES[theme] || theme
  }

  return {
    // State
    currentTheme,

    // Actions
    init,
    setTheme,
    toggleTheme,
    getThemeName,
  }
})

