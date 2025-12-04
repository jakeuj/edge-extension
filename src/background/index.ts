// ============================================
// Background Service Worker
// ============================================

import type { ChromeMessage, ApiResponse, TodayAttendance, AttendanceRecord } from '@/types'

// EIP API 端點
const EIP_BASE_URL = 'https://eipapi.gigabyte.com.tw'
const EIP_LOGIN_URL = `${EIP_BASE_URL}/api/Account/Login`
const EIP_TODAY_ATTENDANCE_URL = `${EIP_BASE_URL}/api/Attendance/GetTodayAttendance`
const EIP_HISTORY_ATTENDANCE_URL = `${EIP_BASE_URL}/api/Attendance/GetHistoryAttendance`

/**
 * 處理登入請求
 */
async function handleLogin(account: string, password: string): Promise<ApiResponse<string>> {
  try {
    const response = await fetch(EIP_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account, password }),
    })

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.success && data.data) {
      return {
        success: true,
        data: data.data, // Server Key
        message: '登入成功',
      }
    } else {
      return {
        success: false,
        message: data.message || '登入失敗',
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '網路錯誤',
    }
  }
}

/**
 * 處理取得今日出勤資料請求
 */
async function handleGetTodayAttendance(serverKey: string): Promise<ApiResponse<TodayAttendance>> {
  try {
    const response = await fetch(EIP_TODAY_ATTENDANCE_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serverKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.success && data.data) {
      return {
        success: true,
        data: data.data,
        message: '取得出勤資料成功',
      }
    } else {
      return {
        success: false,
        message: data.message || '取得出勤資料失敗',
      }
    }
  } catch (error) {
    console.error('Get today attendance error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '網路錯誤',
    }
  }
}

/**
 * 處理取得歷史出勤資料請求
 */
async function handleGetHistoryAttendance(
  serverKey: string,
  days: number
): Promise<ApiResponse<AttendanceRecord[]>> {
  try {
    const response = await fetch(`${EIP_HISTORY_ATTENDANCE_URL}?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serverKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.success && data.data) {
      return {
        success: true,
        data: data.data,
        message: '取得歷史出勤資料成功',
      }
    } else {
      return {
        success: false,
        message: data.message || '取得歷史出勤資料失敗',
      }
    }
  } catch (error) {
    console.error('Get history attendance error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '網路錯誤',
    }
  }
}

/**
 * 訊息監聽器
 */
chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
  console.log('Background received message:', message)

  // 處理不同類型的訊息
  switch (message.type) {
    case 'LOGIN':
      if (message.data?.account && message.data?.password) {
        handleLogin(message.data.account, message.data.password)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              success: false,
              message: error.message || '登入失敗',
            })
          })
        return true // 保持訊息通道開啟
      }
      break

    case 'GET_TODAY_ATTENDANCE':
      if (message.data?.serverKey) {
        handleGetTodayAttendance(message.data.serverKey)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              success: false,
              message: error.message || '取得出勤資料失敗',
            })
          })
        return true
      }
      break

    case 'GET_HISTORY_ATTENDANCE':
      if (message.data?.serverKey && message.data?.days) {
        handleGetHistoryAttendance(message.data.serverKey, message.data.days)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              success: false,
              message: error.message || '取得歷史出勤資料失敗',
            })
          })
        return true
      }
      break

    default:
      sendResponse({
        success: false,
        message: '未知的訊息類型',
      })
  }

  return false
})

// Service Worker 安裝事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason)
  
  if (details.reason === 'install') {
    console.log('First time installation')
  } else if (details.reason === 'update') {
    console.log('Extension updated')
  }
})

console.log('🚀 Background Service Worker Started')

