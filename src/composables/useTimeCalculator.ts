// ============================================
// useTimeCalculator Composable - 時間計算邏輯
// ============================================

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { timeCalculatorService } from '@/services'
import type { TimeCalculationResult, LeaveTimeCalculation } from '@/types'

/**
 * 時間計算相關邏輯的組合式函數
 */
export function useTimeCalculator(clockInTime?: string) {
  // State
  const calculation = ref<TimeCalculationResult | null>(null)
  const currentTime = ref(new Date())
  const updateInterval = ref<number | null>(null)

  // Computed
  const expectedClockOut = computed(() => calculation.value?.expectedClockOut || '--:--')
  const remainingTime = computed(() => calculation.value?.remainingTime || '--:--')
  const remainingMinutes = computed(() => calculation.value?.remainingMinutes || 0)
  const canLeaveNow = computed(() => calculation.value?.canLeaveNow || false)
  const isFlexTime = computed(() => calculation.value?.isFlexTime || false)
  const workHours = computed(() => calculation.value?.workHours || 0)

  /**
   * 計算預計下班時間
   */
  function calculateExpectedClockOut(clockIn: string) {
    calculation.value = timeCalculatorService.calculateExpectedClockOut(clockIn)
  }

  /**
   * 計算請假策略
   */
  function calculateLeaveStrategy(punchIn: string, punchOut: string): LeaveTimeCalculation {
    return timeCalculatorService.calculateLeaveStrategy(punchIn, punchOut)
  }

  /**
   * 格式化時間長度
   */
  function formatDuration(minutes: number): string {
    return timeCalculatorService.formatDuration(minutes)
  }

  /**
   * 檢查是否為工作日
   */
  function isWorkingDay(date?: Date): boolean {
    return timeCalculatorService.isWorkingDay(date)
  }

  /**
   * 格式化日期
   */
  function formatDate(date: Date): string {
    return timeCalculatorService.formatDate(date)
  }

  /**
   * 開始自動更新時間
   */
  function startAutoUpdate(clockIn: string) {
    // 先計算一次
    calculateExpectedClockOut(clockIn)

    // 每秒更新一次
    updateInterval.value = window.setInterval(() => {
      currentTime.value = new Date()
      calculateExpectedClockOut(clockIn)
    }, 1000)
  }

  /**
   * 停止自動更新
   */
  function stopAutoUpdate() {
    if (updateInterval.value !== null) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  // 生命週期
  onMounted(() => {
    if (clockInTime) {
      startAutoUpdate(clockInTime)
    }
  })

  onUnmounted(() => {
    stopAutoUpdate()
  })

  return {
    // State
    calculation,
    currentTime,

    // Computed
    expectedClockOut,
    remainingTime,
    remainingMinutes,
    canLeaveNow,
    isFlexTime,
    workHours,

    // Methods
    calculateExpectedClockOut,
    calculateLeaveStrategy,
    formatDuration,
    isWorkingDay,
    formatDate,
    startAutoUpdate,
    stopAutoUpdate,
  }
}

