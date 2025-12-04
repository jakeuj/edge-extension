// ============================================
// i18n 配置
// ============================================

import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'
import zhTW from './zh-TW'
import enUS from './en-US'

// 語言檔案
const messages = {
  'zh-TW': zhTW,
  'en-US': enUS,
}

// i18n 配置選項
const options: I18nOptions = {
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-TW', // 預設語言
  fallbackLocale: 'zh-TW', // 回退語言
  messages,
  globalInjection: true, // 全域注入 $t
  missingWarn: false, // 關閉缺少翻譯的警告（開發時可開啟）
  fallbackWarn: false, // 關閉回退警告
}

// 建立 i18n 實例
export const i18n: I18n = createI18n(options)

// 匯出預設實例
export default i18n

// 匯出語言檔案型別（用於型別推斷）
export type MessageSchema = typeof zhTW

