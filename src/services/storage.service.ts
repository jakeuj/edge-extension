// ============================================
// 儲存服務 - 處理 Chrome Storage API 的資料儲存和管理
// ============================================

import type {
  UserSettings,
  AttendanceRecord,
  TodayAttendance,
  StorageResponse,
} from '@/types'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/types/constants'

/**
 * 儲存管理服務
 * 提供統一的資料儲存介面，支援 Chrome Storage API 和 localStorage 回退
 */
export class StorageService {
  private isChromeStorageAvailable: boolean

  constructor() {
    this.isChromeStorageAvailable = this.checkChromeStorageAvailability()
  }

  /**
   * 檢查 Chrome Storage API 可用性
   */
  private checkChromeStorageAvailability(): boolean {
    try {
      return !!(typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)
    } catch (error) {
      console.warn('Chrome Storage API 不可用，將使用 localStorage 作為回退方案')
      return false
    }
  }

  /**
   * 統一的儲存方法
   */
  async setStorage(data: Record<string, any>): Promise<void> {
    if (this.isChromeStorageAvailable) {
      await chrome.storage.local.set(data)
    } else {
      // 使用 localStorage 作為回退
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
    }
  }

  /**
   * 統一的讀取方法
   */
  async getStorage<T = any>(keys: string | string[]): Promise<Record<string, T>> {
    if (this.isChromeStorageAvailable) {
      return (await chrome.storage.local.get(keys)) as Record<string, T>
    } else {
      // 使用 localStorage 作為回退
      const result: Record<string, T> = {}
      const keyArray = Array.isArray(keys) ? keys : [keys]

      keyArray.forEach((key) => {
        const value = localStorage.getItem(key)
        if (value !== null) {
          try {
            result[key] = JSON.parse(value) as T
          } catch (error) {
            result[key] = value as T
          }
        }
      })

      return result
    }
  }

  /**
   * 統一的清除方法
   */
  async removeStorage(keys: string | string[]): Promise<void> {
    if (this.isChromeStorageAvailable) {
      await chrome.storage.local.remove(keys)
    } else {
      // 使用 localStorage 作為回退
      const keyArray = Array.isArray(keys) ? keys : [keys]
      keyArray.forEach((key) => {
        localStorage.removeItem(key)
      })
    }
  }

  /**
   * 清除所有資料
   */
  async clearAllStorage(): Promise<void> {
    if (this.isChromeStorageAvailable) {
      await chrome.storage.local.clear()
    } else {
      localStorage.clear()
    }
  }

  /**
   * 儲存登入資訊
   */
  async saveLoginInfo(serverKey: string, account: string): Promise<StorageResponse> {
    try {
      await this.setStorage({
        [STORAGE_KEYS.IS_LOGGED_IN]: true,
        [STORAGE_KEYS.SERVER_KEY]: serverKey,
        [STORAGE_KEYS.LAST_LOGIN_TIME]: Date.now(),
        [STORAGE_KEYS.SAVED_ACCOUNT]: account,
      })

      return { success: true }
    } catch (error) {
      console.error('儲存登入資訊失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存登入資訊失敗',
      }
    }
  }

  /**
   * 取得登入資訊
   */
  async getLoginInfo(): Promise<
    StorageResponse<{
      isLoggedIn: boolean
      serverKey: string | null
      lastLoginTime: number | null
      savedAccount: string | null
    }>
  > {
    try {
      const data = await this.getStorage([
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.SERVER_KEY,
        STORAGE_KEYS.LAST_LOGIN_TIME,
        STORAGE_KEYS.SAVED_ACCOUNT,
      ])

      return {
        success: true,
        data: {
          isLoggedIn: data[STORAGE_KEYS.IS_LOGGED_IN] || false,
          serverKey: data[STORAGE_KEYS.SERVER_KEY] || null,
          lastLoginTime: data[STORAGE_KEYS.LAST_LOGIN_TIME] || null,
          savedAccount: data[STORAGE_KEYS.SAVED_ACCOUNT] || null,
        },
      }
    } catch (error) {
      console.error('取得登入資訊失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得登入資訊失敗',
      }
    }
  }

  /**
   * 清除登入資訊
   */
  async clearLoginInfo(): Promise<StorageResponse> {
    try {
      await this.removeStorage([
        STORAGE_KEYS.IS_LOGGED_IN,
        STORAGE_KEYS.SERVER_KEY,
        STORAGE_KEYS.LAST_LOGIN_TIME,
      ])

      return { success: true }
    } catch (error) {
      console.error('清除登入資訊失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '清除登入資訊失敗',
      }
    }
  }

  /**
   * 儲存出勤資料
   */
  async saveAttendanceData(data: AttendanceRecord[]): Promise<StorageResponse> {
    try {
      await this.setStorage({
        [STORAGE_KEYS.ATTENDANCE_DATA]: data,
        [STORAGE_KEYS.LAST_UPDATE_TIME]: Date.now(),
      })

      return { success: true }
    } catch (error) {
      console.error('儲存出勤資料失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存出勤資料失敗',
      }
    }
  }

  /**
   * 取得出勤資料
   */
  async getAttendanceData(): Promise<StorageResponse<AttendanceRecord[]>> {
    try {
      const data = await this.getStorage([STORAGE_KEYS.ATTENDANCE_DATA])

      return {
        success: true,
        data: data[STORAGE_KEYS.ATTENDANCE_DATA] || [],
      }
    } catch (error) {
      console.error('取得出勤資料失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得出勤資料失敗',
      }
    }
  }

  /**
   * 儲存今日出勤資訊
   */
  async saveTodayAttendance(data: TodayAttendance): Promise<StorageResponse> {
    try {
      await this.setStorage({
        [STORAGE_KEYS.TODAY_ATTENDANCE]: data,
      })

      return { success: true }
    } catch (error) {
      console.error('儲存今日出勤資訊失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存今日出勤資訊失敗',
      }
    }
  }

  /**
   * 取得今日出勤資訊
   */
  async getTodayAttendance(): Promise<StorageResponse<TodayAttendance | null>> {
    try {
      const data = await this.getStorage([STORAGE_KEYS.TODAY_ATTENDANCE])

      return {
        success: true,
        data: data[STORAGE_KEYS.TODAY_ATTENDANCE] || null,
      }
    } catch (error) {
      console.error('取得今日出勤資訊失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得今日出勤資訊失敗',
      }
    }
  }

  /**
   * 儲存使用者設定
   */
  async saveSettings(settings: Partial<UserSettings>): Promise<StorageResponse> {
    try {
      const currentSettings = await this.getSettings()
      const mergedSettings = {
        ...DEFAULT_SETTINGS,
        ...(currentSettings.data || {}),
        ...settings,
      }

      await this.setStorage({
        [STORAGE_KEYS.AUTO_REFRESH]: mergedSettings.autoRefresh,
        [STORAGE_KEYS.REFRESH_INTERVAL]: mergedSettings.refreshInterval,
        [STORAGE_KEYS.NOTIFICATIONS]: mergedSettings.notifications,
        [STORAGE_KEYS.ABNORMAL_SEARCH_DAYS]: mergedSettings.abnormalSearchDays,
        [STORAGE_KEYS.THEME]: mergedSettings.theme,
        [STORAGE_KEYS.LANGUAGE]: mergedSettings.language,
        [STORAGE_KEYS.AUTO_LOGIN]: mergedSettings.autoLogin,
      })

      return { success: true }
    } catch (error) {
      console.error('儲存設定失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存設定失敗',
      }
    }
  }

  /**
   * 取得使用者設定
   */
  async getSettings(): Promise<StorageResponse<UserSettings>> {
    try {
      const data = await this.getStorage([
        STORAGE_KEYS.AUTO_REFRESH,
        STORAGE_KEYS.REFRESH_INTERVAL,
        STORAGE_KEYS.NOTIFICATIONS,
        STORAGE_KEYS.ABNORMAL_SEARCH_DAYS,
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.LANGUAGE,
        STORAGE_KEYS.AUTO_LOGIN,
      ])

      const settings: UserSettings = {
        autoRefresh: data[STORAGE_KEYS.AUTO_REFRESH] ?? DEFAULT_SETTINGS.autoRefresh,
        refreshInterval: data[STORAGE_KEYS.REFRESH_INTERVAL] ?? DEFAULT_SETTINGS.refreshInterval,
        notifications: data[STORAGE_KEYS.NOTIFICATIONS] ?? DEFAULT_SETTINGS.notifications,
        abnormalSearchDays:
          data[STORAGE_KEYS.ABNORMAL_SEARCH_DAYS] ?? DEFAULT_SETTINGS.abnormalSearchDays,
        theme: data[STORAGE_KEYS.THEME] ?? DEFAULT_SETTINGS.theme,
        language: data[STORAGE_KEYS.LANGUAGE] ?? DEFAULT_SETTINGS.language,
        autoLogin: data[STORAGE_KEYS.AUTO_LOGIN] ?? DEFAULT_SETTINGS.autoLogin,
      }

      return {
        success: true,
        data: settings,
      }
    } catch (error) {
      console.error('取得設定失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得設定失敗',
      }
    }
  }
}

// 匯出單例實例
export const storageService = new StorageService()
