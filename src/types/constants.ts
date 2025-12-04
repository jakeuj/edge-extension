// ============================================
// 常數定義
// ============================================

import type { FlexTimeRules, UserSettings, ThemeType, LanguageType } from './index'

// ============================================
// API 端點
// ============================================

export const API_ENDPOINTS = {
  BASE_URL: 'https://eipapi.gigabyte.com.tw/GEIP_API/api',
  LOGIN_URL: 'https://geip.gigabyte.com.tw/api_geip/api/auth/login',
  ATTENDANCE_URL: 'https://geip.gigabyte.com.tw/api_geip/api/main/attendance',
} as const

// ============================================
// 彈性上班時間規則
// ============================================

export const FLEX_TIME_RULES: FlexTimeRules = {
  flexStart: '08:30',
  flexEnd: '09:30',
  standardClockOut: '17:45',
  lateClockOut: '18:45',
  requiredWorkHours: 9.25, // 9小時15分鐘
}

// ============================================
// 預設設定
// ============================================

export const DEFAULT_SETTINGS: UserSettings = {
  autoRefresh: true,
  refreshInterval: 60000, // 1分鐘
  notifications: true,
  abnormalSearchDays: 45,
  theme: 'light',
  language: 'zh-TW',
  autoLogin: false,
}

// ============================================
// 儲存鍵值
// ============================================

export const STORAGE_KEYS = {
  // 認證相關
  IS_LOGGED_IN: 'isLoggedIn',
  SERVER_KEY: 'serverKey',
  LAST_LOGIN_TIME: 'lastLoginTime',
  SAVED_ACCOUNT: 'savedAccount',
  ENCRYPTED_CREDENTIALS: 'encryptedCredentials',
  
  // 出勤資料
  ATTENDANCE_DATA: 'attendanceData',
  LAST_UPDATE_TIME: 'lastUpdateTime',
  TODAY_ATTENDANCE: 'todayAttendance',
  
  // 設定
  AUTO_REFRESH: 'autoRefresh',
  REFRESH_INTERVAL: 'refreshInterval',
  NOTIFICATIONS: 'notifications',
  ABNORMAL_SEARCH_DAYS: 'abnormalSearchDays',
  THEME: 'theme',
  LANGUAGE: 'language',
  AUTO_LOGIN: 'autoLogin',
  
  // 快取
  USER_PROFILE: 'userProfile',
  WORKING_RULES: 'workingRules',
} as const

// ============================================
// 時間常數
// ============================================

export const TIME_CONSTANTS = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8小時
  AUTO_RELOGIN_CHECK: 7.5 * 60 * 60 * 1000, // 7.5小時
} as const

// ============================================
// 主題配置
// ============================================

export const THEMES: readonly ThemeType[] = ['light', 'dark', 'morandi'] as const

export const THEME_NAMES: Record<ThemeType, string> = {
  light: '明亮主題',
  dark: '深色主題',
  morandi: '莫蘭迪主題',
} as const

// ============================================
// 語言配置
// ============================================

export const LANGUAGES: Record<LanguageType, { code: string; name: string; displayName: string }> = {
  'zh-TW': {
    code: 'zh-TW',
    name: 'zh-TW',
    displayName: '繁體中文',
  },
  'en-US': {
    code: 'en-US',
    name: 'en-US',
    displayName: 'English',
  },
} as const

// ============================================
// 錯誤訊息
// ============================================

export const ERROR_MESSAGES = {
  // 認證錯誤
  AUTH_REQUIRED: '請先登入',
  AUTH_EXPIRED: '登入已過期，請重新登入',
  AUTH_FAILED: '認證失敗',
  INVALID_CREDENTIALS: '帳號或密碼錯誤',
  INVALID_ACCOUNT_FORMAT: '帳號格式錯誤，請使用 "域名\\使用者名稱" 格式',
  INVALID_SERVER_KEY: '無效的認證金鑰',
  LOGIN_FAILED: '登入失敗',

  // API 錯誤
  API_ERROR: 'API 呼叫失敗',
  NETWORK_ERROR: '網路連線錯誤',
  SERVER_ERROR: '伺服器錯誤',

  // 資料錯誤
  DATA_NOT_FOUND: '找不到資料',
  DATA_INVALID: '資料格式錯誤',

  // 儲存錯誤
  STORAGE_ERROR: '儲存失敗',
  STORAGE_QUOTA_EXCEEDED: '儲存空間不足',

  // 加密錯誤
  ENCRYPTION_FAILED: '加密失敗',
  DECRYPTION_FAILED: '解密失敗',
} as const

// ============================================
// 成功訊息
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登入成功',
  LOGOUT_SUCCESS: '登出成功',
  DATA_UPDATED: '資料已更新',
  SETTINGS_SAVED: '設定已儲存',
} as const

