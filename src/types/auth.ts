/**
 * 認證相關型別定義
 */

// 登入憑證
export interface LoginCredentials {
  account: string
  password: string
  remember: boolean
  encryptedPassword?: string
}

// 登入結果
export interface LoginResult {
  success: boolean
  serverKey?: string
  message?: string
  error?: string
}

// 登入 API 請求
export interface LoginRequest {
  account: string
  password: string
  remember: boolean
  type: number
}

// 登入 API 回應
export interface LoginApiResponse {
  statusCode: number
  message: string
  result: {
    serverKey: string
    [key: string]: any
  }
}

// 認證狀態
export interface AuthState {
  isLoggedIn: boolean
  serverKey: string | null
  loginTime: number | null
  savedAccount: string | null
}

// 登入時間資訊
export interface LoginTimeInfo {
  loginTime: Date
  hoursSinceLogin: number
  hoursRemaining: number
  isExpired: boolean
}

// 帳號驗證結果
export interface AccountValidation {
  valid: boolean
  error?: string
  domain?: string
  username?: string
}

