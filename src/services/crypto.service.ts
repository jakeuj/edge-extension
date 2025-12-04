// ============================================
// 加密服務 - 用於安全儲存敏感資訊
// ============================================

import type { StorageResponse } from '@/types'
import { ERROR_MESSAGES } from '@/types/constants'

/**
 * 加密管理服務
 * 使用 AES-GCM 加密演算法和 PBKDF2 金鑰派生
 */
export class CryptoService {
  private keyMaterial: CryptoKey | null = null
  private readonly PBKDF2_ITERATIONS = 100000
  private readonly AES_KEY_LENGTH = 256
  private readonly SALT_LENGTH = 16
  private readonly IV_LENGTH = 12

  /**
   * 初始化加密金鑰
   */
  async init(): Promise<boolean> {
    try {
      const fingerprint = await this.generateFingerprint()
      const encoder = new TextEncoder()
      const keyData = encoder.encode(fingerprint)

      this.keyMaterial = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )

      return true
    } catch (error) {
      console.error('初始化加密金鑰失敗:', error)
      return false
    }
  }

  /**
   * 生成瀏覽器指紋
   * 用於建立唯一的加密金鑰材料
   */
  private async generateFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      `${screen.width}x${screen.height}`,
      'edge-extension-v2', // 版本標識
    ]

    return components.join('|')
  }

  /**
   * 從金鑰材料派生加密金鑰
   */
  private async deriveKey(salt: Uint8Array): Promise<CryptoKey> {
    if (!this.keyMaterial) {
      await this.init()
    }

    if (!this.keyMaterial) {
      throw new Error('金鑰材料未初始化')
    }

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      this.keyMaterial,
      { name: 'AES-GCM', length: this.AES_KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * 加密文字
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      if (!plaintext) {
        throw new Error('無加密內容')
      }

      // 生成隨機鹽值和 IV
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH))
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

      // 派生金鑰
      const key = await this.deriveKey(salt)

      // 加密
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        data
      )

      // 組合 salt + iv + encrypted data
      const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      result.set(salt, 0)
      result.set(iv, salt.length)
      result.set(new Uint8Array(encrypted), salt.length + iv.length)

      // 轉換為 Base64
      return this.arrayBufferToBase64(result)
    } catch (error) {
      console.error('加密失敗:', error)
      throw new Error(ERROR_MESSAGES.ENCRYPTION_FAILED)
    }
  }

  /**
   * 解密文字
   */
  async decrypt(encryptedBase64: string): Promise<string> {
    try {
      if (!encryptedBase64) {
        throw new Error('無解密內容')
      }

      // 從 Base64 轉換
      const encryptedData = this.base64ToArrayBuffer(encryptedBase64)

      // 提取 salt, iv 和加密資料
      const salt = encryptedData.slice(0, this.SALT_LENGTH)
      const iv = encryptedData.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH)
      const data = encryptedData.slice(this.SALT_LENGTH + this.IV_LENGTH)

      // 派生金鑰
      const key = await this.deriveKey(salt)

      // 解密
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        data
      )

      // 轉換為文字
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('解密失敗:', error)
      throw new Error(ERROR_MESSAGES.DECRYPTION_FAILED)
    }
  }

  /**
   * ArrayBuffer 轉 Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = ''
    const len = buffer.byteLength

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]!)
    }

    return btoa(binary)
  }

  /**
   * Base64 轉 ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    return bytes
  }

  /**
   * 加密並儲存憑證
   */
  async saveCredentials(account: string, password: string): Promise<StorageResponse> {
    try {
      const encryptedPassword = await this.encrypt(password)

      await chrome.storage.local.set({
        savedAccount: account,
        savedPassword: encryptedPassword,
        hasCredentials: true,
      })

      return { success: true }
    } catch (error) {
      console.error('儲存憑證失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '儲存憑證失敗',
      }
    }
  }

  /**
   * 讀取並解密憑證
   */
  async loadCredentials(): Promise<StorageResponse<{ account: string; password: string }>> {
    try {
      const data = await chrome.storage.local.get([
        'savedAccount',
        'savedPassword',
        'hasCredentials',
      ])

      if (!data['hasCredentials'] || !data['savedAccount'] || !data['savedPassword']) {
        return { success: false, error: '無儲存的憑證' }
      }

      const password = await this.decrypt(data['savedPassword'] as string)

      return {
        success: true,
        data: {
          account: data['savedAccount'] as string,
          password,
        },
      }
    } catch (error) {
      console.error('讀取憑證失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '讀取憑證失敗',
      }
    }
  }

  /**
   * 清除儲存的憑證
   */
  async clearCredentials(): Promise<StorageResponse> {
    try {
      await chrome.storage.local.remove(['savedAccount', 'savedPassword', 'hasCredentials'])

      return { success: true }
    } catch (error) {
      console.error('清除憑證失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '清除憑證失敗',
      }
    }
  }

  /**
   * 檢查是否有儲存的憑證
   */
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const data = await chrome.storage.local.get(['hasCredentials'])
      return data['hasCredentials'] === true
    } catch (error) {
      console.error('檢查憑證失敗:', error)
      return false
    }
  }
}

// 匯出單例實例
export const cryptoService = new CryptoService()
