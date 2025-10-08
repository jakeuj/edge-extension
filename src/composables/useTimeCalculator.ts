/**
 * Time Calculator Composable - 時間計算
 */

import { timeCalculator } from '@/utils/timeCalculator'
import type {
  ExpectedClockOut,
  RemainingTime,
  ClockInAnalysis,
  FlexTimeRulesDescription,
  TodayInfo
} from '@/types'

export function useTimeCalculator() {
  /**
   * 計算預計下班時間
   */
  const calculateExpectedClockOut = (clockInTime: string): ExpectedClockOut => {
    return timeCalculator.calculateExpectedClockOut(clockInTime)
  }

  /**
   * 計算剩餘工作時間
   */
  const calculateRemainingTime = (
    clockInTime: string,
    currentTime: Date | null = null
  ): RemainingTime => {
    return timeCalculator.calculateRemainingTime(clockInTime, currentTime)
  }

  /**
   * 分析上班時間類型
   */
  const analyzeClockInTime = (clockInTime: string): ClockInAnalysis => {
    return timeCalculator.analyzeClockInTime(clockInTime)
  }

  /**
   * 取得彈性上班制度說明
   */
  const getFlexTimeRules = (): FlexTimeRulesDescription => {
    return timeCalculator.getFlexTimeRules()
  }

  /**
   * 解析時間字串為分鐘數
   */
  const parseTimeToMinutes = (timeString: string): number | null => {
    return timeCalculator.parseTimeToMinutes(timeString)
  }

  /**
   * 將分鐘數轉換為時間字串
   */
  const minutesToTimeString = (minutes: number): string => {
    return timeCalculator.minutesToTimeString(minutes)
  }

  /**
   * 格式化時間長度顯示
   */
  const formatDuration = (minutes: number): string => {
    return timeCalculator.formatDuration(minutes)
  }

  /**
   * 檢查是否為工作日
   */
  const isWorkingDay = (date: Date | null = null): boolean => {
    return timeCalculator.isWorkingDay(date)
  }

  /**
   * 取得今日日期資訊
   */
  const getTodayInfo = (): TodayInfo => {
    return timeCalculator.getTodayInfo()
  }

  /**
   * 格式化日期顯示
   */
  const formatDate = (date: Date): string => {
    return timeCalculator.formatDate(date)
  }

  return {
    calculateExpectedClockOut,
    calculateRemainingTime,
    analyzeClockInTime,
    getFlexTimeRules,
    parseTimeToMinutes,
    minutesToTimeString,
    formatDuration,
    isWorkingDay,
    getTodayInfo,
    formatDate
  }
}

