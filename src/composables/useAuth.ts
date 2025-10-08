/**
 * Auth Composable - 認證管理
 */

import { ref, computed } from 'vue'
import { cryptoManager } from '@/utils/crypto'
import { useStorage } from './useStorage'
import type { LoginCredentials, LoginResult, AccountValidation } from '@/types'

export function useAuth() {
  const { saveLoginInfo, getLoginInfo, clearLoginInfo } = useStorage()

  const isLoggedIn = ref(false)
  const serverKey = ref<string | null>(null)
  const loginTime = ref<number | null>(null)
  const savedAccount = ref<string | null>(null)

  /**
   * 初始化認證狀態
   */
  const init = async (): Promise<boolean> => {
    try {
      const result = await getLoginInfo()
      
      if (result.success && result.data) {
        isLoggedIn.value = result.data.isLoggedIn
        serverKey.value = result.data.serverKey
        loginTime.value = result.data.lastLoginTime
        savedAccount.value = result.data.savedAccount

        // 檢查登入是否過期（8小時）
        if (isLoggedIn.value && loginTime.value) {
          const hoursSinceLogin = (Date.now() - loginTime.value) / (1000 * 60 * 60)
          if (hoursSinceLogin > 8) {
            console.log('Token 已過期，嘗試自動重新登入...')
            const reloginResult = await attemptAutoRelogin()
            if (!reloginResult.success) {
              await logout()
              return false
            }
            return true
          }
        }

        return isLoggedIn.value
      }
      
      return false
    } catch (error) {
      console.error('初始化認證管理器失敗:', error)
      return false
    }
  }

  /**
   * 登入
   */
  const login = async (
    account: string,
    password: string,
    remember: boolean = false
  ): Promise<LoginResult> => {
    try {
      // 驗證輸入
      if (!account || !password) {
        throw new Error('請輸入帳號和密碼')
      }

      // 確保帳號格式正確（包含域名）
      if (!account.includes('\\')) {
        throw new Error('帳號格式錯誤，請使用 "域名\\使用者名稱" 格式')
      }

      // 如果需要記住密碼，先加密
      let encryptedPassword: string | undefined
      if (remember) {
        encryptedPassword = await cryptoManager.encrypt(password)
      }

      // 發送登入請求到背景腳本
      const response = await sendMessage({
        action: 'login',
        credentials: {
          account,
          password,
          remember,
          encryptedPassword
        }
      })

      if (response.success) {
        isLoggedIn.value = true
        serverKey.value = response.serverKey
        loginTime.value = Date.now()

        // 如果勾選記住密碼，儲存加密後的憑證
        if (remember) {
          await cryptoManager.saveCredentials(account, password)
        }

        return {
          success: true,
          message: response.message || '登入成功'
        }
      } else {
        throw new Error(response.error || '登入失敗')
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登入失敗'
      }
    }
  }

  /**
   * 登出
   */
  const logout = async (clearCredentials: boolean = false): Promise<LoginResult> => {
    try {
      const response = await sendMessage({
        action: 'logout'
      })

      isLoggedIn.value = false
      serverKey.value = null
      loginTime.value = null

      // 如果指定清除憑證，則清除儲存的帳號密碼
      if (clearCredentials) {
        await cryptoManager.clearCredentials()
      }

      return {
        success: true,
        message: '已登出'
      }
    } catch (error) {
      console.error('登出錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失敗'
      }
    }
  }

  /**
   * 嘗試自動重新登入
   */
  const attemptAutoRelogin = async (): Promise<LoginResult> => {
    try {
      console.log('嘗試自動重新登入...')

      // 讀取儲存的憑證
      const credentialsResult = await cryptoManager.loadCredentials()

      if (!credentialsResult.success || !credentialsResult.data) {
        console.log('無法讀取儲存的憑證:', credentialsResult.error)
        return { success: false, error: '無儲存的憑證' }
      }

      const { account, password } = credentialsResult.data

      // 使用儲存的憑證重新登入
      console.log('使用儲存的憑證重新登入...')
      const loginResult = await login(account, password, true)

      if (loginResult.success) {
        console.log('自動重新登入成功')
        return { success: true, message: '自動重新登入成功' }
      } else {
        console.error('自動重新登入失敗:', loginResult.error)
        return { success: false, error: loginResult.error }
      }
    } catch (error) {
      console.error('自動重新登入錯誤:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '自動重新登入失敗' 
      }
    }
  }

  /**
   * 驗證帳號格式
   */
  const validateAccountFormat = (account: string): AccountValidation => {
    // 檢查是否包含反斜線
    if (!account.includes('\\')) {
      return {
        valid: false,
        error: '帳號格式錯誤，請使用 "域名\\使用者名稱" 格式（例如：gigabyte\\your.username）'
      }
    }

    const parts = account.split('\\')
    if (parts.length !== 2) {
      return {
        valid: false,
        error: '帳號格式錯誤，只能包含一個反斜線'
      }
    }

    const [domain, username] = parts
    if (!domain || !username) {
      return {
        valid: false,
        error: '域名和使用者名稱都不能為空'
      }
    }

    return {
      valid: true,
      domain,
      username
    }
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

  /**
   * 檢查是否已登入
   */
  const isAuthenticated = computed(() => {
    return isLoggedIn.value && serverKey.value !== null
  })

  /**
   * 取得 serverKey
   */
  const getServerKey = computed(() => serverKey.value)

  return {
    // 狀態
    isLoggedIn,
    serverKey,
    loginTime,
    savedAccount,
    isAuthenticated,
    getServerKey,

    // 方法
    init,
    login,
    logout,
    attemptAutoRelogin,
    validateAccountFormat
  }
}

