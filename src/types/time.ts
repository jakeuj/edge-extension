/**
 * 時間計算相關型別定義
 */

// 時間物件
export interface TimeObject {
  hours: number
  minutes: number
}

// 彈性上班規則
export interface FlexTimeRules {
  flexStartTime: TimeObject
  flexEndTime: TimeObject
  standardWorkHours: number
  standardWorkMinutes: number
  earlyClockOut: TimeObject
  lateClockOut: TimeObject
}

// 預計下班時間計算結果
export interface ExpectedClockOut {
  expectedTime: string
  workingHours: number
  workingMinutes: number
  totalWorkingMinutes?: number
  rule: 'early' | 'flexible' | 'late' | 'unknown' | 'error'
  description: string
  clockInMinutes?: number
  expectedClockOutMinutes?: number
}

// 剩餘時間計算結果
export interface RemainingTime {
  remainingTime: string
  remainingMinutes: number
  isOvertime: boolean
  overtimeMinutes: number
  description: string
}

// 上班時間分析結果
export interface ClockInAnalysis {
  type: 'early' | 'flexible' | 'late' | 'none' | 'error'
  description: string
  isEarly: boolean
  isLate: boolean
  isFlexible: boolean
}

// 彈性上班規則說明
export interface FlexTimeRulesDescription {
  title: string
  rules: Array<{
    condition: string
    result: string
    description: string
  }>
  notes: string[]
}

// 今日資訊
export interface TodayInfo {
  date: Date
  dateString: string
  weekday: string
  isWorkingDay: boolean
  timestamp: number
}

