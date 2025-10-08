/**
 * 儲存相關型別定義
 */

import type { AttendanceData } from './attendance'

// 儲存鍵值
export interface StorageKeys {
  // 認證相關
  isLoggedIn: string
  serverKey: string
  lastLoginTime: string
  savedAccount: string
  savedPassword: string
  hasCredentials: string

  // 出勤資料
  attendanceData: string
  lastUpdateTime: string
  todayAttendance: string

  // 設定
  autoRefresh: string
  refreshInterval: string
  notifications: string
  selectedTheme: string
  userSettings: string
  abnormalSearchDays: string

  // 快取
  userProfile: string
  workingRules: string
}

// 使用者設定
export interface UserSettings {
  autoRefresh: boolean
  refreshInterval: number
  notifications: boolean
  abnormalSearchDays: number
}

// 登入資訊
export interface LoginInfo {
  isLoggedIn: boolean
  serverKey: string | null
  lastLoginTime: number | null
  savedAccount: string | null
}

// 出勤資料儲存
export interface AttendanceStorage {
  attendanceData: AttendanceData | null
  lastUpdateTime: number | null
}

// 使用者資料
export interface UserProfile {
  employeeId?: string
  name?: string
  deptName?: string
  lastUpdated: number
}

// 儲存操作結果
export interface StorageResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 儲存使用情況
export interface StorageUsage {
  totalItems: number
  totalSize: number
  items: {
    [key: string]: {
      size: number
      type: string
      lastModified: number | null
    }
  }
}

