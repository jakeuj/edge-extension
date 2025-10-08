/**
 * 背景服務工作者 - 處理擴充套件的背景任務
 */

// 安裝時的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('擴充套件已安裝')
  
  // 設定預設值
  chrome.storage.local.set({
    isLoggedIn: false,
    serverKey: null,
    lastLoginTime: null,
    attendanceData: null
  })
})

// 處理來自 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'login':
      handleLogin(request.credentials)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true // 保持訊息通道開啟以進行異步回應
      
    case 'getAttendance':
      handleGetAttendance(request.serverKey)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    case 'getHistoryAttendance':
      handleGetHistoryAttendance(request.serverKey, request.startDate, request.endDate)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true

    case 'logout':
      handleLogout()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
  }
})

/**
 * 處理登入
 */
async function handleLogin(credentials: {
  account: string
  password: string
  remember: boolean
  encryptedPassword?: string
}) {
  try {
    const response = await fetch('https://geip.gigabyte.com.tw/api_geip/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        account: credentials.account,
        password: credentials.password,
        remember: credentials.remember,
        type: 1
      })
    })

    const data = await response.json()
    
    if (data.statusCode === 200 && data.result && data.result.serverKey) {
      // 儲存登入資訊
      const loginData: Record<string, any> = {
        isLoggedIn: true,
        serverKey: data.result.serverKey,
        lastLoginTime: Date.now()
      }
      
      if (credentials.remember) {
        loginData.savedAccount = credentials.account
        loginData.savedPassword = credentials.encryptedPassword // 儲存加密後的密碼
        loginData.hasCredentials = true
      }

      await chrome.storage.local.set(loginData)
      
      return { 
        success: true, 
        serverKey: data.result.serverKey,
        message: '登入成功'
      }
    } else {
      return { 
        success: false, 
        error: data.message || '登入失敗，請檢查帳號密碼'
      }
    }
  } catch (error) {
    console.error('登入錯誤:', error)
    return { 
      success: false, 
      error: '網路連線錯誤，請稍後再試'
    }
  }
}

/**
 * 處理取得出勤資訊
 */
async function handleGetAttendance(serverKey: string) {
  try {
    const today = new Date()
    const startDate = formatDate(today)
    const endDate = formatDate(today)
    
    const response = await fetch('https://eipapi.gigabyte.com.tw/GEIP_API/api/getAttendanceInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'serverkey': serverKey
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        status: "ALL",
        employeeId: "",
        deptId: "",
        lineType: "",
        group: "",
        includeSubDept: false
      })
    })

    const data = await response.json()
    
    if (data.statusCode === 200 && data.result) {
      // 儲存出勤資料
      await chrome.storage.local.set({
        attendanceData: data.result,
        lastUpdateTime: Date.now()
      })
      
      return { 
        success: true, 
        data: data.result,
        message: '出勤資料更新成功'
      }
    } else {
      return { 
        success: false, 
        error: data.message || '無法取得出勤資料'
      }
    }
  } catch (error) {
    console.error('取得出勤資料錯誤:', error)
    return { 
      success: false, 
      error: '網路連線錯誤，請稍後再試'
    }
  }
}

/**
 * 處理取得歷史出勤資訊
 */
async function handleGetHistoryAttendance(
  serverKey: string,
  startDate: string,
  endDate: string
) {
  try {
    if (!startDate || !endDate) {
      return {
        success: false,
        error: '請指定查詢日期範圍'
      }
    }

    const response = await fetch('https://eipapi.gigabyte.com.tw/GEIP_API/api/getAttendanceInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'serverkey': serverKey
      },
      body: JSON.stringify({
        startDate: startDate,
        endDate: endDate,
        status: "ALL",
        employeeId: "",
        deptId: "",
        lineType: "",
        group: "",
        includeSubDept: false
      })
    })

    const data = await response.json()

    if (data.statusCode === 200 && data.result) {
      return {
        success: true,
        data: data.result,
        message: '歷史出勤資料取得成功'
      }
    } else {
      return {
        success: false,
        error: data.message || '無法取得歷史出勤資料'
      }
    }
  } catch (error) {
    console.error('取得歷史出勤資料錯誤:', error)
    return {
      success: false,
      error: '網路連線錯誤，請稍後再試'
    }
  }
}

/**
 * 處理登出
 */
async function handleLogout() {
  try {
    // 清除登入狀態，但保留儲存的憑證以便自動重新登入
    await chrome.storage.local.set({
      isLoggedIn: false,
      serverKey: null,
      attendanceData: null,
      lastUpdateTime: null
    })

    // 注意：不清除 savedAccount, savedPassword, hasCredentials
    // 這樣可以在 token 過期時自動重新登入

    return {
      success: true,
      message: '已登出'
    }
  } catch (error) {
    console.error('登出錯誤:', error)
    return {
      success: false,
      error: '登出時發生錯誤'
    }
  }
}

/**
 * 格式化日期為 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 自動重新登入機制 - 當 token 過期時自動使用儲存的憑證重新登入
 */
async function attemptAutoRelogin() {
  try {
    const data = await chrome.storage.local.get([
      'hasCredentials',
      'savedAccount',
      'savedPassword'
    ])

    if (!data.hasCredentials || !data.savedAccount || !data.savedPassword) {
      console.log('無儲存的憑證，無法自動重新登入')
      return { success: false, error: '無儲存的憑證' }
    }

    console.log('嘗試自動重新登入...')

    // 使用儲存的憑證重新登入
    const result = await handleLogin({
      account: data.savedAccount,
      password: data.savedPassword, // 這是加密後的密碼，需要在前端解密
      remember: true
    })

    if (result.success) {
      console.log('自動重新登入成功')
    } else {
      console.error('自動重新登入失敗:', result.error)
    }

    return result
  } catch (error) {
    console.error('自動重新登入錯誤:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '自動重新登入失敗' 
    }
  }
}

/**
 * 定期檢查 token 是否過期並自動重新登入（每小時檢查一次）
 */
setInterval(async () => {
  const data = await chrome.storage.local.get(['isLoggedIn', 'lastLoginTime', 'hasCredentials'])

  if (data.isLoggedIn && data.lastLoginTime) {
    const hoursSinceLogin = (Date.now() - data.lastLoginTime) / (1000 * 60 * 60)

    // 如果超過 7.5 小時，嘗試自動重新登入（在 8 小時過期前）
    if (hoursSinceLogin > 7.5 && data.hasCredentials) {
      console.log('Token 即將過期，嘗試自動重新登入...')
      await attemptAutoRelogin()
    }
  }
}, 60 * 60 * 1000) // 每小時檢查一次

// 匯出函數供測試使用
export { attemptAutoRelogin }

