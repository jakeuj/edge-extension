/**
 * Storage Composable - 儲存管理
 */

import { storageManager } from '@/utils/storage'
import type { UserSettings, LoginInfo, AttendanceStorage, UserProfile, StorageResult } from '@/types'

export function useStorage() {
  /**
   * 儲存登入資訊
   */
  const saveLoginInfo = async (loginData: {
    serverKey: string
    remember?: boolean
    account?: string
  }): Promise<StorageResult> => {
    return await storageManager.saveLoginInfo(loginData)
  }

  /**
   * 取得登入資訊
   */
  const getLoginInfo = async (): Promise<StorageResult<LoginInfo>> => {
    return await storageManager.getLoginInfo()
  }

  /**
   * 清除登入資訊
   */
  const clearLoginInfo = async (): Promise<StorageResult> => {
    return await storageManager.clearLoginInfo()
  }

  /**
   * 儲存出勤資料
   */
  const saveAttendanceData = async (attendanceData: any): Promise<StorageResult> => {
    return await storageManager.saveAttendanceData(attendanceData)
  }

  /**
   * 取得出勤資料
   */
  const getAttendanceData = async (): Promise<StorageResult<AttendanceStorage>> => {
    return await storageManager.getAttendanceData()
  }

  /**
   * 儲存使用者設定
   */
  const saveSettings = async (settings: Partial<UserSettings>): Promise<StorageResult> => {
    return await storageManager.saveSettings(settings)
  }

  /**
   * 取得使用者設定
   */
  const getSettings = async (): Promise<StorageResult<UserSettings>> => {
    return await storageManager.getSettings()
  }

  /**
   * 儲存使用者資料
   */
  const saveUserProfile = async (profile: Partial<UserProfile>): Promise<StorageResult> => {
    return await storageManager.saveUserProfile(profile)
  }

  /**
   * 取得使用者資料
   */
  const getUserProfile = async (): Promise<StorageResult<UserProfile | null>> => {
    return await storageManager.getUserProfile()
  }

  /**
   * 清除所有資料
   */
  const clearAllData = async (): Promise<StorageResult> => {
    return await storageManager.clearAllData()
  }

  /**
   * 檢查資料是否過期
   */
  const isDataExpired = (timestamp: number | null, maxAgeHours: number = 24): boolean => {
    return storageManager.isDataExpired(timestamp, maxAgeHours)
  }

  return {
    saveLoginInfo,
    getLoginInfo,
    clearLoginInfo,
    saveAttendanceData,
    getAttendanceData,
    saveSettings,
    getSettings,
    saveUserProfile,
    getUserProfile,
    clearAllData,
    isDataExpired
  }
}

