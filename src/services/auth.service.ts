// ============================================
// 認證服務 - 處理登入、登出和認證狀態管理
// ============================================

import type { LoginCredentials, LoginResponse, StorageResponse, ChromeMessage } from '@/types'
import { ERROR_MESSAGES, TIME_CONSTANTS } from '@/types/constants'
import { cryptoService } from './crypto.service'
import { storageService } from './storage.service'

/**
 * 認證管理服務
 * 處理使用者登入、登出、自動重新登入等認證相關功能
 */
export class AuthService {
  private serverKey: string | null = null
  private isLoggedIn: boolean = false
  private loginTime: number | null = null

  /**
   * 初始化認證管理器
   */
  async init(): Promise<boolean> {
    try {
      const loginInfo = await storageService.getLoginInfo()

      if (!loginInfo.success || !loginInfo.data) {
        return false
      }

      this.isLoggedIn = loginInfo.data.isLoggedIn
      this.serverKey = loginInfo.data.serverKey
      this.loginTime = loginInfo.data.lastLoginTime

      // 檢查登入是否過期（8小時）
      if (this.isLoggedIn && this.loginTime) {
        const timeSinceLogin = Date.now() - this.loginTime

        if (timeSinceLogin > TIME_CONSTANTS.SESSION_TIMEOUT) {
          console.log('Token 已過期，嘗試自動重新登入...')
          const reloginResult = await this.attemptAutoRelogin()

          if (!reloginResult.success) {
            await this.logout()
            return false
          }

          return true
        }
      }

      return this.isLoggedIn
    } catch (error) {
      console.error('初始化認證管理器失敗:', error)
      return false
    }
  }

  /**
   * 登入
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // 驗證輸入
      if (!credentials.account || !credentials.password) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
      }

      // 確保帳號格式正確（包含域名）
      if (!credentials.account.includes('\\')) {
        throw new Error('帳號格式錯誤，請使用 "gigabyte\\使用者名稱" 格式')
      }

      // 如果需要記住密碼，先加密並儲存
      if (credentials.remember) {
        await cryptoService.saveCredentials(credentials.account, credentials.password)
      }

      // 發送登入請求到背景腳本
      const response = await this.sendMessage<LoginResponse>({
        type: 'LOGIN',
        data: {
          account: credentials.account,
          password: credentials.password,
        },
      })

      if (response.success && response.serverKey) {
        this.isLoggedIn = true
        this.serverKey = response.serverKey
        this.loginTime = Date.now()

        // 儲存登入資訊
        await storageService.saveLoginInfo(response.serverKey, credentials.account)

        // 如果勾選記住密碼，儲存加密後的憑證
        if (credentials.remember) {
          await cryptoService.saveCredentials(credentials.account, credentials.password)
        }

        return {
          success: true,
          message: response.message || '登入成功',
          serverKey: response.serverKey,
        }
      } else {
        throw new Error(response.error || ERROR_MESSAGES.LOGIN_FAILED)
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.LOGIN_FAILED,
      }
    }
  }

  /**
   * 登出
   */
  async logout(clearCredentials: boolean = false): Promise<StorageResponse> {
    try {
      // 發送登出請求到背景腳本
      await this.sendMessage({
        type: 'LOGOUT',
      })

      this.isLoggedIn = false
      this.serverKey = null
      this.loginTime = null

      // 清除登入資訊
      await storageService.clearLoginInfo()

      // 如果指定清除憑證，則清除儲存的帳號密碼
      if (clearCredentials) {
        await cryptoService.clearCredentials()
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error('登出錯誤:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失敗',
      }
    }
  }

  /**
   * 嘗試自動重新登入
   */
  async attemptAutoRelogin(): Promise<LoginResponse> {
    try {
      // 檢查是否有儲存的憑證
      const hasCredentials = await cryptoService.hasStoredCredentials()

      if (!hasCredentials) {
        return {
          success: false,
          error: '無儲存的憑證',
        }
      }

      // 讀取並解密憑證
      const credentialsResult = await cryptoService.loadCredentials()

      if (!credentialsResult.success || !credentialsResult.data) {
        return {
          success: false,
          error: credentialsResult.error || '無法讀取憑證',
        }
      }

      // 使用儲存的憑證重新登入
      return await this.login({
        account: credentialsResult.data.account,
        password: credentialsResult.data.password,
        remember: true,
      })
    } catch (error) {
      console.error('自動重新登入失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '自動重新登入失敗',
      }
    }
  }

  /**
   * 取得儲存的帳號資訊
   */
  async getSavedAccount(): Promise<string> {
    try {
      const loginInfo = await storageService.getLoginInfo()

      if (loginInfo.success && loginInfo.data) {
        return loginInfo.data.savedAccount || ''
      }

      return ''
    } catch (error) {
      console.error('取得儲存帳號失敗:', error)
      return ''
    }
  }

  /**
   * 檢查是否已登入
   */
  isAuthenticated(): boolean {
    return this.isLoggedIn && this.serverKey !== null
  }

  /**
   * 取得 Server Key
   */
  getServerKey(): string | null {
    return this.serverKey
  }

  /**
   * 檢查登入是否即將過期（7.5小時）
   */
  isSessionExpiringSoon(): boolean {
    if (!this.loginTime) {
      return false
    }

    const timeSinceLogin = Date.now() - this.loginTime
    return timeSinceLogin > TIME_CONSTANTS.AUTO_RELOGIN_CHECK
  }

  /**
   * 發送訊息到背景腳本
   */
  private async sendMessage<T = any>(message: ChromeMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        reject(new Error('Chrome Runtime API 不可用'))
        return
      }

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response as T)
        }
      })
    })
  }
}

// 匯出單例實例
export const authService = new AuthService()
