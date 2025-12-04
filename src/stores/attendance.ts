// ============================================
// 出勤 Store - 管理出勤資料和歷史記錄
// ============================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AttendanceRecord, TodayAttendance, TimeCalculationResult } from '@/types'
import { apiService, storageService, timeCalculatorService } from '@/services'
import { useAuthStore } from './auth'

/**
 * 出勤資料管理
 */
export const useAttendanceStore = defineStore('attendance', () => {
  // State
  const todayAttendance = ref<TodayAttendance | null>(null)
  const attendanceHistory = ref<AttendanceRecord[]>([])
  const timeCalculation = ref<TimeCalculationResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdateTime = ref<number | null>(null)

  // Getters
  const hasClockIn = computed(() => {
    return todayAttendance.value?.clockIn && todayAttendance.value.clockIn !== '--:--'
  })

  const hasClockOut = computed(() => {
    return todayAttendance.value?.clockOut && todayAttendance.value.clockOut !== '--:--'
  })

  const canLeaveNow = computed(() => {
    return timeCalculation.value?.canLeaveNow || false
  })

  const abnormalRecords = computed(() => {
    return attendanceHistory.value.filter((record) => record.isAbnormal)
  })

  /**
   * 取得今日出勤資訊
   */
  async function fetchTodayAttendance(): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      const authStore = useAuthStore()
      const serverKey = authStore.serverKey

      if (!serverKey) {
        throw new Error('未登入，請先登入')
      }

      const result = await apiService.getTodayAttendance(serverKey)

      if (result.success && result.data) {
        todayAttendance.value = result.data
        lastUpdateTime.value = Date.now()

        // 儲存到本地
        await storageService.saveTodayAttendance(result.data)

        // 如果有上班打卡，計算預計下班時間
        if (result.data.clockIn && result.data.clockIn !== '--:--') {
          updateTimeCalculation(result.data.clockIn)
        }

        return true
      } else {
        error.value = '取得出勤資料失敗'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取得出勤資料失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 取得歷史出勤資訊
   */
  async function fetchHistoryAttendance(startDate: string, endDate: string): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      const authStore = useAuthStore()
      const serverKey = authStore.serverKey

      if (!serverKey) {
        throw new Error('未登入，請先登入')
      }

      const result = await apiService.getHistoryAttendance(serverKey, startDate, endDate)

      if (result.success && result.data) {
        attendanceHistory.value = result.data

        // 儲存到本地
        await storageService.saveAttendanceData(result.data)

        return true
      } else {
        error.value = '取得歷史出勤資料失敗'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取得歷史出勤資料失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 取得異常出勤資訊
   */
  async function fetchAbnormalAttendance(days: number = 45): Promise<boolean> {
    try {
      isLoading.value = true
      error.value = null

      const authStore = useAuthStore()
      const serverKey = authStore.serverKey

      if (!serverKey) {
        throw new Error('未登入，請先登入')
      }

      const result = await apiService.getAbnormalAttendance(serverKey, days)

      if (result.success && result.data) {
        attendanceHistory.value = result.data
        return true
      } else {
        error.value = '取得異常出勤資料失敗'
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取得異常出勤資料失敗'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新時間計算
   */
  function updateTimeCalculation(clockInTime: string): void {
    if (!clockInTime || clockInTime === '--:--') {
      timeCalculation.value = null
      return
    }

    timeCalculation.value = timeCalculatorService.calculateExpectedClockOut(clockInTime)
  }

  /**
   * 從本地儲存載入資料
   */
  async function loadFromStorage(): Promise<void> {
    try {
      const todayResult = await storageService.getTodayAttendance()
      if (todayResult.success && todayResult.data) {
        todayAttendance.value = todayResult.data

        if (todayResult.data.clockIn && todayResult.data.clockIn !== '--:--') {
          updateTimeCalculation(todayResult.data.clockIn)
        }
      }

      const historyResult = await storageService.getAttendanceData()
      if (historyResult.success && historyResult.data) {
        attendanceHistory.value = historyResult.data
      }
    } catch (err) {
      console.error('從本地儲存載入資料失敗:', err)
    }
  }

  /**
   * 清除錯誤訊息
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * 重置狀態
   */
  function reset(): void {
    todayAttendance.value = null
    attendanceHistory.value = []
    timeCalculation.value = null
    error.value = null
    lastUpdateTime.value = null
  }

  return {
    // State
    todayAttendance,
    attendanceHistory,
    timeCalculation,
    isLoading,
    error,
    lastUpdateTime,

    // Getters
    hasClockIn,
    hasClockOut,
    canLeaveNow,
    abnormalRecords,

    // Actions
    fetchTodayAttendance,
    fetchHistoryAttendance,
    fetchAbnormalAttendance,
    updateTimeCalculation,
    loadFromStorage,
    clearError,
    reset,
  }
})

