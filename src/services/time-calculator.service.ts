// ============================================
// 時間計算服務 - 處理彈性上班制度的時間計算邏輯
// ============================================

import type { TimeCalculationResult, LeaveTimeCalculation, FlexTimeRules } from '@/types'
import { FLEX_TIME_RULES } from '@/types/constants'

/**
 * 時間計算服務
 * 處理彈性上班制度的所有時間計算邏輯
 */
export class TimeCalculatorService {
  private readonly rules: FlexTimeRules = FLEX_TIME_RULES

  /**
   * 計算預計下班時間
   */
  calculateExpectedClockOut(clockInTime: string): TimeCalculationResult {
    if (!clockInTime || clockInTime === '--:--') {
      return {
        expectedClockOut: '--:--',
        remainingTime: '--:--',
        remainingMinutes: 0,
        isFlexTime: false,
        canLeaveNow: false,
        workHours: 0,
      }
    }

    try {
      const clockInMinutes = this.parseTimeToMinutes(clockInTime)
      if (clockInMinutes === null) {
        throw new Error('無效的上班時間格式')
      }

      const flexStartMinutes = this.parseTimeToMinutes(this.rules.flexStart)!
      const flexEndMinutes = this.parseTimeToMinutes(this.rules.flexEnd)!

      let expectedClockOutMinutes: number
      let isFlexTime: boolean

      if (clockInMinutes <= flexStartMinutes) {
        // 8:30 或之前上班 → 17:45 下班
        expectedClockOutMinutes = this.parseTimeToMinutes(this.rules.standardClockOut)!
        isFlexTime = false
      } else if (clockInMinutes <= flexEndMinutes) {
        // 8:30-9:30 之間上班 → 固定工作 9小時15分鐘
        const totalWorkMinutes = this.rules.requiredWorkHours * 60
        expectedClockOutMinutes = clockInMinutes + totalWorkMinutes
        isFlexTime = true
      } else {
        // 9:30 之後上班 → 18:45 下班
        expectedClockOutMinutes = this.parseTimeToMinutes(this.rules.lateClockOut)!
        isFlexTime = false
      }

      const expectedClockOut = this.minutesToTimeString(expectedClockOutMinutes)
      const workMinutes = expectedClockOutMinutes - clockInMinutes
      const workHours = workMinutes / 60

      // 計算剩餘時間
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const remainingMinutes = Math.max(0, expectedClockOutMinutes - currentMinutes)
      const remainingTime = this.minutesToTimeString(remainingMinutes)
      const canLeaveNow = remainingMinutes <= 0

      return {
        expectedClockOut,
        remainingTime,
        remainingMinutes,
        isFlexTime,
        canLeaveNow,
        workHours,
      }
    } catch (error) {
      console.error('計算預計下班時間錯誤:', error)
      return {
        expectedClockOut: '--:--',
        remainingTime: '--:--',
        remainingMinutes: 0,
        isFlexTime: false,
        canLeaveNow: false,
        workHours: 0,
      }
    }
  }

  /**
   * 計算請假策略（雙向工時補償邏輯）
   */
  calculateLeaveStrategy(punchIn: string, punchOut: string): LeaveTimeCalculation {
    // 常數定義
    const BASE_START = 8 * 60 + 30 // 08:30 = 510 分鐘
    const BASE_END = 18 * 60 + 45 // 18:45 = 1125 分鐘
    const LATE_THRESHOLD = 9 * 60 + 30 // 09:30 = 570 分鐘
    const TARGET = this.rules.requiredWorkHours * 60 // 9小時15分鐘 = 555 分鐘

    // 處理無效輸入
    if (!punchIn || punchIn === '--:--' || !punchOut || punchOut === '--:--') {
      return {
        earliestLeaveTime: '--:--',
        latestArrivalTime: '--:--',
        requiredWorkHours: this.rules.requiredWorkHours,
        currentWorkHours: 0,
        remainingHours: this.rules.requiredWorkHours,
        canLeaveNow: false,
      }
    }

    try {
      // 解析時間並計算有效時間
      const T_in = this.parseTimeToMinutes(punchIn)
      const T_out = this.parseTimeToMinutes(punchOut)

      if (T_in === null || T_out === null) {
        throw new Error('時間格式錯誤')
      }

      // 限制在公司規定的時間範圍內
      const T_valid_in = Math.max(T_in, BASE_START)
      const T_valid_out = Math.min(T_out, BASE_END)

      // 計算實際工作時長和工時缺口
      const duration = T_valid_out - T_valid_in
      const deficit = TARGET - duration

      const currentWorkHours = duration / 60
      const remainingHours = Math.max(0, deficit / 60)

      // 如果工作時數足夠，不需要請假
      if (deficit <= 0) {
        return {
          earliestLeaveTime: this.minutesToTimeString(T_valid_out),
          latestArrivalTime: this.minutesToTimeString(T_valid_in),
          requiredWorkHours: this.rules.requiredWorkHours,
          currentWorkHours,
          remainingHours: 0,
          canLeaveNow: true,
        }
      }

      // 計算需要請假的時數（向上取整到30分鐘）
      const leaveMinutes = Math.ceil(deficit / 30) * 30

      // 雙向工時補償邏輯
      let earliestLeaveTime: string
      let latestArrivalTime: string

      // 情況 A：下班卡 ≥ 18:45（下班達標）
      if (T_out >= BASE_END) {
        // 缺口全部補在上班段，最早可補至 09:30
        const calculatedStartTime = T_in - leaveMinutes
        latestArrivalTime = this.minutesToTimeString(Math.max(LATE_THRESHOLD, calculatedStartTime))
        earliestLeaveTime = this.minutesToTimeString(T_out)
      }
      // 情況 B：上班卡 ≤ 08:30（上班達標）
      else if (T_in <= BASE_START) {
        // 缺口全部補在下班段，最晚可補至 17:45
        const EARLY_CLOCK_OUT = 17 * 60 + 45
        const calculatedEndTime = T_out + leaveMinutes
        earliestLeaveTime = this.minutesToTimeString(Math.min(EARLY_CLOCK_OUT, calculatedEndTime))
        latestArrivalTime = this.minutesToTimeString(T_in)
      }
      // 情況 C：兩端都未達標（雙向補償）
      else {
        // 優先補下班段（因為早退更常見）
        const EARLY_CLOCK_OUT = 17 * 60 + 45
        const maxAfterLeave = EARLY_CLOCK_OUT - T_out

        if (leaveMinutes <= maxAfterLeave) {
          // 全部補在下班段
          earliestLeaveTime = this.minutesToTimeString(T_out + leaveMinutes)
          latestArrivalTime = this.minutesToTimeString(T_in)
        } else {
          // 下班段補滿，剩餘補上班段
          const remainingLeave = leaveMinutes - maxAfterLeave
          earliestLeaveTime = this.minutesToTimeString(EARLY_CLOCK_OUT)
          const calculatedStartTime = T_in - remainingLeave
          latestArrivalTime = this.minutesToTimeString(Math.max(LATE_THRESHOLD, calculatedStartTime))
        }
      }

      return {
        earliestLeaveTime,
        latestArrivalTime,
        requiredWorkHours: this.rules.requiredWorkHours,
        currentWorkHours,
        remainingHours,
        canLeaveNow: false,
      }
    } catch (error) {
      console.error('計算請假策略錯誤:', error)
      return {
        earliestLeaveTime: '--:--',
        latestArrivalTime: '--:--',
        requiredWorkHours: this.rules.requiredWorkHours,
        currentWorkHours: 0,
        remainingHours: this.rules.requiredWorkHours,
        canLeaveNow: false,
      }
    }
  }

  /**
   * 解析時間字串為分鐘數
   */
  private parseTimeToMinutes(timeString: string): number | null {
    if (!timeString || timeString === '--:--' || timeString === '') {
      return null
    }

    try {
      const parts = timeString.split(':')
      if (parts.length === 2) {
        const hours = parseInt(parts[0]!, 10)
        const minutes = parseInt(parts[1]!, 10)

        if (isNaN(hours) || isNaN(minutes)) {
          return null
        }

        return hours * 60 + minutes
      }
    } catch (error) {
      console.error('解析時間錯誤:', error)
    }

    return null
  }

  /**
   * 將分鐘數轉換為時間字串
   */
  private minutesToTimeString(minutes: number): string {
    if (minutes === null || minutes === undefined || isNaN(minutes)) {
      return '--:--'
    }

    // 處理跨日情況
    const normalizedMinutes = minutes % (24 * 60)
    const hours = Math.floor(normalizedMinutes / 60)
    const mins = normalizedMinutes % 60

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  /**
   * 格式化時間長度顯示
   */
  formatDuration(minutes: number): string {
    if (minutes === null || minutes === undefined || isNaN(minutes)) {
      return '0分鐘'
    }

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours}小時${mins}分鐘`
    } else if (hours > 0) {
      return `${hours}小時`
    } else {
      return `${mins}分鐘`
    }
  }

  /**
   * 檢查是否為工作日
   */
  isWorkingDay(date: Date = new Date()): boolean {
    const dayOfWeek = date.getDay()
    // 0 = 星期日, 6 = 星期六
    return dayOfWeek >= 1 && dayOfWeek <= 5
  }

  /**
   * 格式化日期顯示
   */
  formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }
}

// 匯出單例實例
export const timeCalculatorService = new TimeCalculatorService()

