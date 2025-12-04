// ============================================
// API 服務 - 處理與技嘉 EIP 系統的 API 通訊
// ============================================

import type {
  AttendanceRecord,
  TodayAttendance,
  ApiResponse,
  ChromeMessage,
} from '@/types'
import { ERROR_MESSAGES } from '@/types/constants'

/**
 * API 管理服務
 * 處理與技嘉 EIP 系統的所有 API 通訊
 */
export class ApiService {
  /**
   * 取得今日出勤資訊
   */
  async getTodayAttendance(serverKey: string): Promise<ApiResponse<TodayAttendance>> {
    try {
      if (!serverKey) {
        throw new Error(ERROR_MESSAGES.INVALID_SERVER_KEY)
      }

      const response = await this.sendMessage<ApiResponse<TodayAttendance>>({
        type: 'GET_TODAY_ATTENDANCE',
        data: { serverKey },
      })

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        }
      } else {
        throw new Error('無法取得出勤資料')
      }
    } catch (error) {
      console.error('取得今日出勤資訊錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得出勤資料失敗',
      }
    }
  }

  /**
   * 取得歷史出勤資訊
   */
  async getHistoryAttendance(
    serverKey: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      if (!serverKey) {
        throw new Error(ERROR_MESSAGES.INVALID_SERVER_KEY)
      }

      if (!startDate || !endDate) {
        throw new Error('請指定查詢日期範圍')
      }

      const response = await this.sendMessage<ApiResponse<AttendanceRecord[]>>({
        type: 'GET_HISTORY_ATTENDANCE',
        data: { serverKey, startDate, endDate },
      })

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        }
      } else {
        throw new Error('無法取得歷史出勤資料')
      }
    } catch (error) {
      console.error('取得歷史出勤資訊錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得歷史出勤資料失敗',
      }
    }
  }

  /**
   * 取得異常出勤資訊（可自訂天數）
   */
  async getAbnormalAttendance(
    serverKey: string,
    days: number = 45
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      if (!serverKey) {
        throw new Error(ERROR_MESSAGES.INVALID_SERVER_KEY)
      }

      // 計算指定天數的日期範圍
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)

      const startDateStr = this.formatDate(startDate)
      const endDateStr = this.formatDate(endDate)

      return await this.getHistoryAttendance(serverKey, startDateStr, endDateStr)
    } catch (error) {
      console.error('取得異常出勤資訊錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '取得異常出勤資料失敗',
      }
    }
  }

  /**
   * 格式化日期為 YYYY/MM/DD 格式
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  /**
   * 發送訊息到背景腳本
   */
  private async sendMessage<T = any>(message: ChromeMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        reject(new Error('Chrome Runtime API 不可用'))
        return
      }

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response as T)
        }
      })
    })
  }
}

// 匯出單例實例
export const apiService = new ApiService()

