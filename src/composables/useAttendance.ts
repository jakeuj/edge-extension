/**
 * Attendance Composable - 出勤管理
 */

import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { useTimeCalculator } from './useTimeCalculator'
import type { TodayAttendance, AbnormalAttendance } from '@/types'

export function useAttendance() {
  const { getTodayAttendance, getAbnormalAttendance, loading, error } = useApi()
  const { calculateExpectedClockOut, calculateRemainingTime } = useTimeCalculator()

  const todayData = ref<TodayAttendance | null>(null)
  const abnormalData = ref<AbnormalAttendance[]>([])
  const expectedClockOut = ref<string>('--:--')
  const remainingTime = ref<string>('--:--')

  /**
   * 載入今日出勤資料
   */
  const loadTodayAttendance = async (serverKey: string): Promise<boolean> => {
    try {
      const result = await getTodayAttendance(serverKey)
      
      if (result.success && result.data) {
        todayData.value = result.data
        
        // 計算預計下班時間
        if (result.data.punchIn) {
          const clockOutResult = calculateExpectedClockOut(result.data.punchIn)
          expectedClockOut.value = clockOutResult.expectedTime
          
          // 計算剩餘時間
          const remainingResult = calculateRemainingTime(result.data.punchIn)
          remainingTime.value = remainingResult.remainingTime
        }
        
        return true
      }
      
      return false
    } catch (err) {
      console.error('載入今日出勤資料失敗:', err)
      return false
    }
  }

  /**
   * 載入異常出勤資料
   */
  const loadAbnormalAttendance = async (
    serverKey: string,
    days: number = 45
  ): Promise<boolean> => {
    try {
      const result = await getAbnormalAttendance(serverKey, days)
      
      if (result.success && result.data) {
        abnormalData.value = result.data
        return true
      }
      
      return false
    } catch (err) {
      console.error('載入異常出勤資料失敗:', err)
      return false
    }
  }

  /**
   * 更新剩餘時間（用於定時更新）
   */
  const updateRemainingTime = (): void => {
    if (todayData.value && todayData.value.punchIn) {
      const remainingResult = calculateRemainingTime(todayData.value.punchIn)
      remainingTime.value = remainingResult.remainingTime
    }
  }

  /**
   * 異常記錄數量
   */
  const abnormalCount = computed(() => abnormalData.value.length)

  /**
   * 是否有今日出勤資料
   */
  const hasTodayData = computed(() => todayData.value !== null)

  /**
   * 是否有異常記錄
   */
  const hasAbnormalData = computed(() => abnormalData.value.length > 0)

  return {
    // 狀態
    todayData,
    abnormalData,
    expectedClockOut,
    remainingTime,
    loading,
    error,

    // 計算屬性
    abnormalCount,
    hasTodayData,
    hasAbnormalData,

    // 方法
    loadTodayAttendance,
    loadAbnormalAttendance,
    updateRemainingTime
  }
}

