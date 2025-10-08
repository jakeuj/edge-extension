/**
 * 主題相關型別定義
 */

// 主題 ID
export type ThemeId = 'light' | 'dark' | 'morandi'

// 主題顏色配置
export interface ThemeColors {
  // 主要顏色
  primary: string
  primaryGradient: string
  
  // 背景顏色
  background: string
  backgroundSecondary: string
  backgroundCard: string
  
  // 文字顏色
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string
  
  // 邊框顏色
  border: string
  borderLight: string
  
  // 狀態顏色
  success: string
  warning: string
  error: string
  info: string
  
  // 互動顏色
  hover: string
  active: string
  
  // 陰影
  shadow: string
  shadowHover: string
}

// 主題配置
export interface Theme {
  id: ThemeId
  name: string
  description: string
  colors: ThemeColors
}

// 主題預覽資訊
export interface ThemePreview {
  id: ThemeId
  name: string
  description: string
  primaryColor: string
  backgroundColor: string
  textColor: string
}

// 主題統計資訊
export interface ThemeStats {
  totalThemes: number
  currentTheme: ThemeId
  availableThemes: ThemeId[]
  isInitialized: boolean
}

// 主題變更事件
export interface ThemeChangeEvent {
  themeId: ThemeId
  theme: Theme
}

