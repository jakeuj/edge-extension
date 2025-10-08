/**
 * API Composable - API 呼叫管理
 */

import { ref } from 'vue'
import type {
  AttendanceData,
  TodayAttendance,
  HistoryAttendance,
  AbnormalAttendance,
  Result
} from '@/types'

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 取得出勤資訊
   */
  const getAttendanceInfo = async (
    serverKey: string,
    startDate: string | null = null,
    endDate: string | null = null
  ): Promise<Result<AttendanceData>> => {
    try {
      loading.value = true
      error.value = null

      if (!serverKey) {
        throw new Error('缺少認證金鑰，請重新登入')
      }

      // 發送請求到背景腳本
      const response = await sendMessage({
        action: 'getAttendance',
        serverKey
      })

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        }
      } else {
        throw new Error(response.error || '無法取得出勤資料')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '無法取得出勤資料'
      error.value = errorMessage
      console.error('取得出勤資訊錯誤:', err)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得異常出勤資訊
   */
  const getAbnormalAttendance = async (
    serverKey: string,
    days: number = 45
  ): Promise<Result<AbnormalAttendance[]>> => {
    try {
      loading.value = true
      error.value = null

      if (!serverKey) {
        throw new Error('缺少認證金鑰，請重新登入')
      }

      // 計算日期範圍
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)

      const startDateStr = formatDate(startDate)
      const endDateStr = formatDate(endDate)

      // 發送請求到背景腳本
      const response = await sendMessage({
        action: 'getHistoryAttendance',
        serverKey,
        startDate: startDateStr,
        endDate: endDateStr
      })

      if (response.success) {
        // 解析異常出勤資料
        const abnormalRecords = parseAbnormalAttendance(response.data)
        
        return {
          success: true,
          data: abnormalRecords,
          message: response.message
        }
      } else {
        throw new Error(response.error || '無法取得異常出勤資料')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '無法取得異常出勤資料'
      error.value = errorMessage
      console.error('取得異常出勤資訊錯誤:', err)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得今日出勤資訊
   */
  const getTodayAttendance = async (serverKey: string): Promise<Result<TodayAttendance | null>> => {
    try {
      loading.value = true
      error.value = null

      const result = await getAttendanceInfo(serverKey)
      
      if (!result.success || !result.data) {
        return result as Result<null>
      }

      // 解析今日出勤資料
      const todayData = parseTodayAttendance(result.data)
      
      return {
        success: true,
        data: todayData,
        message: '今日出勤資料取得成功'
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '無法取得今日出勤資料'
      error.value = errorMessage
      console.error('取得今日出勤資訊錯誤:', err)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 解析今日出勤資料
   */
  const parseTodayAttendance = (attendanceData: AttendanceData): TodayAttendance | null => {
    const today = new Date()
    const todayString = formatDateForComparison(today)
    
    let todayRecord: TodayAttendance | null = null

    // 在部門列表中尋找今日記錄
    if (attendanceData && attendanceData.deptItemList) {
      for (const dept of attendanceData.deptItemList) {
        if (dept.employeeItemList) {
          for (const employee of dept.employeeItemList) {
            const recordDate = parseRecordDate(employee.date)
            if (recordDate === todayString) {
              todayRecord = {
                employeeId: employee.employeeId,
                name: employee.name,
                date: employee.date,
                status: employee.status,
                punchIn: employee.punchIn,
                punchOut: employee.punchOut,
                leaveTime: employee.leaveTime,
                deptName: dept.deptName
              }
              break
            }
          }
          if (todayRecord) break
        }
      }
    }

    return todayRecord
  }

  /**
   * 解析異常出勤資料
   */
  const parseAbnormalAttendance = (attendanceData: AttendanceData): AbnormalAttendance[] => {
    const allRecords = parseHistoryAttendance(attendanceData)

    // 只保留狀態為「異常」的記錄
    return allRecords.filter(record => record.status === '異常')
  }

  /**
   * 解析歷史出勤資料
   */
  const parseHistoryAttendance = (attendanceData: AttendanceData): HistoryAttendance[] => {
    const historyRecords: HistoryAttendance[] = []

    if (attendanceData && attendanceData.deptItemList) {
      for (const dept of attendanceData.deptItemList) {
        if (dept.employeeItemList) {
          for (const employee of dept.employeeItemList) {
            const record: HistoryAttendance = {
              ...employee,
              deptName: dept.deptName,
              workHours: calculateWorkHours(employee.punchIn, employee.punchOut),
              sortDate: parseRecordDate(employee.date)
            }
            historyRecords.push(record)
          }
        }
      }
    }

    // 按日期排序（最新的在前）
    historyRecords.sort((a, b) => {
      if (a.sortDate && b.sortDate) {
        return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
      }
      return 0
    })

    return historyRecords
  }

  /**
   * 計算工作時間
   */
  const calculateWorkHours = (punchIn: string, punchOut: string): string => {
    if (!punchIn || !punchOut || punchIn === '--:--' || punchOut === '--:--') {
      return '--:--'
    }

    try {
      const inMinutes = parseTimeToMinutes(punchIn)
      const outMinutes = parseTimeToMinutes(punchOut)

      if (inMinutes !== null && outMinutes !== null && outMinutes > inMinutes) {
        const workMinutes = outMinutes - inMinutes
        const hours = Math.floor(workMinutes / 60)
        const minutes = workMinutes % 60
        return `${hours}小時${minutes}分鐘`
      }
    } catch (err) {
      console.error('計算工作時間錯誤:', err)
    }

    return '--:--'
  }

  /**
   * 解析時間字串為分鐘數
   */
  const parseTimeToMinutes = (timeString: string): number | null => {
    if (!timeString || timeString === '--:--' || timeString === '') {
      return null
    }

    try {
      const parts = timeString.split(':')
      if (parts.length === 2) {
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        return hours * 60 + minutes
      }
    } catch (err) {
      console.error('解析時間錯誤:', err)
    }

    return null
  }

  /**
   * 解析記錄日期格式
   */
  const parseRecordDate = (dateString: string): string | null => {
    if (!dateString) return null
    
    try {
      const datePart = dateString.split('(')[0]
      const parts = datePart.split('/')
      
      if (parts.length === 3) {
        const year = parts[0]
        const month = parts[1].padStart(2, '0')
        const day = parts[2].padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    } catch (err) {
      console.error('解析日期錯誤:', err)
    }
    
    return null
  }

  /**
   * 格式化日期
   */
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 格式化日期為比較用格式
   */
  const formatDateForComparison = (date: Date): string => {
    return formatDate(date)
  }

  /**
   * 發送訊息到背景腳本
   */
  const sendMessage = async (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response)
        }
      })
    })
  }

  return {
    loading,
    error,
    getAttendanceInfo,
    getAbnormalAttendance,
    getTodayAttendance
  }
}

