/**
 * 出勤相關型別定義
 */

// 出勤狀態
export type AttendanceStatus = '正常' | '異常' | '請假' | '出差' | '未打卡'

// 員工出勤記錄
export interface EmployeeAttendance {
  employeeId: string
  name: string
  date: string
  status: AttendanceStatus
  punchIn: string
  punchOut: string
  leaveTime: string
  holidayPunchIn?: string
  holidayPunchOut?: string
  deptName: string
}

// 部門出勤資料
export interface DepartmentAttendance {
  deptId: string
  deptName: string
  employeeItemList: EmployeeAttendance[]
}

// API 回應的出勤資料結構
export interface AttendanceData {
  deptItemList: DepartmentAttendance[]
}

// 今日出勤資訊
export interface TodayAttendance {
  employeeId: string
  name: string
  date: string
  status: AttendanceStatus
  punchIn: string
  punchOut: string
  leaveTime: string
  deptName: string
  expectedClockOut?: string
  remainingTime?: string
}

// 歷史出勤記錄
export interface HistoryAttendance extends EmployeeAttendance {
  workHours: string
  sortDate: string | null
}

// 異常出勤記錄
export type AbnormalAttendance = HistoryAttendance

// 出勤查詢參數
export interface AttendanceQueryParams {
  startDate: string
  endDate: string
  status: 'ALL' | AttendanceStatus
  employeeId: string
  deptId: string
  lineType: string
  group: string
  includeSubDept: boolean
}

// API 回應基礎結構
export interface ApiResponse<T> {
  statusCode: number
  message: string
  result: T
}

// 出勤 API 回應
export type AttendanceApiResponse = ApiResponse<AttendanceData>

