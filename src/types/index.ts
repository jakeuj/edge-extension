// ============================================
// 核心型別定義
// ============================================

// ============================================
// 認證相關型別
// ============================================

/** 登入憑證 */
export interface LoginCredentials {
  account: string
  password: string
  remember?: boolean
  encryptedPassword?: string | null
}

/** 登入回應 */
export interface LoginResponse {
  success: boolean
  serverKey?: string
  message?: string
  error?: string
}

/** 自動重新登入結果 */
export interface AutoReloginResult {
  success: boolean
  message?: string
  error?: string
}

/** 認證狀態 */
export interface AuthState {
  isLoggedIn: boolean
  serverKey: string | null
  loginTime: number | null
  savedAccount: string | null
}

// ============================================
// 出勤相關型別
// ============================================

/** 出勤記錄 */
export interface AttendanceRecord {
  date: string
  clockIn: string | null
  clockOut: string | null
  workHours: number
  status: AttendanceStatus
  isAbnormal: boolean
  abnormalReason?: string
  leaveType?: string
  leaveHours?: number
}

/** 出勤狀態 */
export type AttendanceStatus = 
  | 'normal'      // 正常
  | 'late'        // 遲到
  | 'early'       // 早退
  | 'absent'      // 缺勤
  | 'leave'       // 請假
  | 'overtime'    // 加班
  | 'holiday'     // 假日

/** 今日出勤資訊 */
export interface TodayAttendance {
  date: string
  clockIn: string | null
  clockOut: string | null
  expectedClockOut: string | null
  remainingTime: string | null
  workHours: number
  status: AttendanceStatus
  isFlexTime: boolean
  leaveStrategy?: LeaveStrategy
}

/** 請假策略 */
export interface LeaveStrategy {
  canLeaveNow: boolean
  earliestLeaveTime: string
  latestArrivalTime: string
  requiredWorkHours: number
  currentWorkHours: number
  remainingHours: number
}

/** 出勤資料回應 */
export interface AttendanceResponse {
  success: boolean
  data?: AttendanceRecord[]
  message?: string
  error?: string
}

// ============================================
// API 相關型別
// ============================================

/** API 請求參數 */
export interface ApiRequestParams {
  startDate?: string
  endDate?: string
  status?: string
  employeeId?: string
  deptId?: string
  lineType?: string
  group?: string
  includeSubDept?: boolean
}

/** 訊息傳遞 */
export interface ChromeMessage {
  type: MessageType
  data?: {
    account?: string
    password?: string
    serverKey?: string
    startDate?: string
    endDate?: string
    days?: number
  }
}

/** 訊息類型 */
export type MessageType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'GET_TODAY_ATTENDANCE'
  | 'GET_HISTORY_ATTENDANCE'
  | 'CHECK_AUTH'

/** 訊息動作類型（向下相容） */
export type MessageAction =
  | 'login'
  | 'logout'
  | 'getAttendance'
  | 'getHistoryAttendance'
  | 'checkAuth'

/** 訊息回應 */
export interface ChromeMessageResponse {
  success: boolean
  data?: any
  serverKey?: string
  message?: string
  error?: string
}

// ============================================
// 儲存相關型別
// ============================================

/** 儲存鍵值 */
export interface StorageKeys {
  // 認證相關
  isLoggedIn: string
  serverKey: string
  lastLoginTime: string
  savedAccount: string
  encryptedCredentials: string
  
  // 出勤資料
  attendanceData: string
  lastUpdateTime: string
  todayAttendance: string
  
  // 設定
  autoRefresh: string
  refreshInterval: string
  notifications: string
  abnormalSearchDays: string
  theme: string
  language: string
  
  // 快取
  userProfile: string
  workingRules: string
}

/** 使用者設定 */
export interface UserSettings {
  autoRefresh: boolean
  refreshInterval: number
  notifications: boolean
  abnormalSearchDays: number
  theme: ThemeType
  language: LanguageType
  autoLogin: boolean
}

/** 儲存回應 */
export interface StorageResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// 主題相關型別
// ============================================

/** 主題類型 */
export type ThemeType = 'light' | 'dark' | 'morandi'

/** 主題配置 */
export interface ThemeConfig {
  name: ThemeType
  displayName: string
  colors: {
    primary: string
    background: string
    text: string
    border: string
  }
}

// ============================================
// 國際化相關型別
// ============================================

/** 語言類型 */
export type LanguageType = 'zh-TW' | 'en-US'

/** 語言配置 */
export interface LanguageConfig {
  code: LanguageType
  name: string
  displayName: string
}

// ============================================
// 時間計算相關型別
// ============================================

/** 彈性上班時間規則 */
export interface FlexTimeRules {
  flexStart: string      // 彈性開始時間 (08:30)
  flexEnd: string        // 彈性結束時間 (09:30)
  standardClockOut: string  // 標準下班時間 (17:45)
  lateClockOut: string   // 遲到下班時間 (18:45)
  requiredWorkHours: number // 必須工作時數 (9.25小時)
}

/** 時間計算結果 */
export interface TimeCalculationResult {
  expectedClockOut: string
  remainingTime: string
  remainingMinutes: number
  isFlexTime: boolean
  canLeaveNow: boolean
  workHours: number
}

/** 請假時間計算 */
export interface LeaveTimeCalculation {
  earliestLeaveTime: string
  latestArrivalTime: string
  requiredWorkHours: number
  currentWorkHours: number
  remainingHours: number
  canLeaveNow: boolean
}

// ============================================
// 加密相關型別
// ============================================

/** 加密資料 */
export interface EncryptedData {
  iv: string
  salt: string
  ciphertext: string
}

/** 加密憑證 */
export interface EncryptedCredentials {
  account: string
  encryptedPassword: EncryptedData
  timestamp: number
}

// ============================================
// 使用者資訊型別
// ============================================

/** 使用者資料 */
export interface UserProfile {
  employeeId: string
  name: string
  department: string
  email?: string
  avatar?: string
}

/** 工作規則 */
export interface WorkingRules {
  flexTimeEnabled: boolean
  flexTimeRules: FlexTimeRules
  overtimeEnabled: boolean
  weekendWork: boolean
}

// ============================================
// 錯誤處理型別
// ============================================

/** 應用程式錯誤 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/** 錯誤回應 */
export interface ErrorResponse {
  success: false
  error?: string
  message?: string
  code?: string
  details?: any
}

/** 成功回應 */
export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
}

/** API 回應 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

// ============================================
// 工具型別
// ============================================

/** 可選屬性 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/** 必填屬性 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/** 深度部分 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

