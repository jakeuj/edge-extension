/**
 * 統一匯出所有型別定義
 */

export * from './attendance'
export * from './auth'
export * from './storage'
export * from './theme'
export * from './time'

// 通用型別
export interface Result<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Chrome Extension 訊息
export interface ExtensionMessage {
  action: string
  [key: string]: any
}

// Chrome Extension 訊息回應
export interface ExtensionMessageResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

