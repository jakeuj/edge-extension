/**
 * Theme Composable - 主題管理
 */

import { ref, onMounted } from 'vue'
import type { ThemeId, Theme, ThemeColors } from '@/types'

const themes: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: '白色主題',
    description: '明亮清爽的白色主題',
    colors: {
      primary: '#667eea',
      primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      background: '#ffffff',
      backgroundSecondary: '#f5f5f5',
      backgroundCard: '#f8f9fa',
      textPrimary: '#333333',
      textSecondary: '#666666',
      textMuted: '#999999',
      textInverse: '#ffffff',
      border: '#ddd',
      borderLight: '#e9ecef',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      hover: 'rgba(102, 126, 234, 0.1)',
      active: 'rgba(102, 126, 234, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHover: 'rgba(102, 126, 234, 0.3)'
    }
  },
  dark: {
    id: 'dark',
    name: '黑夜模式',
    description: '護眼的深色主題',
    colors: {
      primary: '#7c3aed',
      primaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
      background: '#1a1a1a',
      backgroundSecondary: '#2d2d2d',
      backgroundCard: '#333333',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      textMuted: '#888888',
      textInverse: '#1a1a1a',
      border: '#444444',
      borderLight: '#555555',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      hover: 'rgba(124, 58, 237, 0.2)',
      active: 'rgba(124, 58, 237, 0.3)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowHover: 'rgba(124, 58, 237, 0.4)'
    }
  },
  morandi: {
    id: 'morandi',
    name: '莫蘭迪色系',
    description: '柔和優雅的低飽和度主題',
    colors: {
      primary: '#8b9dc3',
      primaryGradient: 'linear-gradient(135deg, #8b9dc3 0%, #a8b5d1 100%)',
      background: '#f7f5f3',
      backgroundSecondary: '#f0ede8',
      backgroundCard: '#faf8f5',
      textPrimary: '#4a4a4a',
      textSecondary: '#6b6b6b',
      textMuted: '#9a9a9a',
      textInverse: '#f7f5f3',
      border: '#d4cfc7',
      borderLight: '#e6e1d8',
      success: '#a8c4a2',
      warning: '#d4b896',
      error: '#c4a2a2',
      info: '#a2b8c4',
      hover: 'rgba(139, 157, 195, 0.15)',
      active: 'rgba(139, 157, 195, 0.25)',
      shadow: 'rgba(74, 74, 74, 0.08)',
      shadowHover: 'rgba(139, 157, 195, 0.2)'
    }
  }
}

const STORAGE_KEY = 'selectedTheme'

export function useTheme() {
  const currentTheme = ref<ThemeId>('light')
  const isInitialized = ref(false)

  /**
   * 初始化主題
   */
  const init = async (): Promise<boolean> => {
    try {
      // 從儲存中載入主題設定
      await loadThemeFromStorage()

      // 應用當前主題
      applyTheme(currentTheme.value)

      isInitialized.value = true
      
      return true
    } catch (error) {
      console.error('主題管理器初始化失敗:', error)
      // 使用預設主題
      currentTheme.value = 'light'
      applyTheme(currentTheme.value)
      return false
    }
  }

  /**
   * 從儲存中載入主題設定
   */
  const loadThemeFromStorage = async (): Promise<void> => {
    try {
      const data = await chrome.storage.local.get([STORAGE_KEY])
      const savedTheme = data[STORAGE_KEY] as ThemeId
      
      if (savedTheme && themes[savedTheme]) {
        currentTheme.value = savedTheme
      }
    } catch (error) {
      console.error('載入主題設定失敗:', error)
    }
  }

  /**
   * 儲存主題設定
   */
  const saveThemeToStorage = async (themeId: ThemeId): Promise<void> => {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEY]: themeId
      })
    } catch (error) {
      console.error('儲存主題設定失敗:', error)
    }
  }

  /**
   * 切換主題
   */
  const switchTheme = async (themeId: ThemeId): Promise<boolean> => {
    if (!themes[themeId]) {
      console.error('未知的主題ID:', themeId)
      return false
    }

    try {
      // 更新當前主題
      currentTheme.value = themeId
      
      // 應用新主題
      applyTheme(themeId)
      
      // 儲存設定
      await saveThemeToStorage(themeId)
      
      return true
    } catch (error) {
      console.error('切換主題失敗:', error)
      return false
    }
  }

  /**
   * 應用主題
   */
  const applyTheme = (themeId: ThemeId): void => {
    const theme = themes[themeId]
    if (!theme) {
      console.error('主題不存在:', themeId)
      return
    }

    const root = document.documentElement
    
    // 設定主題ID到根元素
    root.setAttribute('data-theme', themeId)
    
    // 設定CSS變數
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })
  }

  /**
   * 取得當前主題
   */
  const getCurrentTheme = (): Theme => {
    return {
      id: currentTheme.value,
      ...themes[currentTheme.value]
    }
  }

  /**
   * 取得所有可用主題
   */
  const getAllThemes = (): Theme[] => {
    return Object.values(themes)
  }

  /**
   * 檢查主題是否存在
   */
  const hasTheme = (themeId: ThemeId): boolean => {
    return !!themes[themeId]
  }

  // 在組件掛載時初始化
  onMounted(() => {
    if (!isInitialized.value) {
      init()
    }
  })

  return {
    currentTheme,
    isInitialized,
    init,
    switchTheme,
    getCurrentTheme,
    getAllThemes,
    hasTheme
  }
}

