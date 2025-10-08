---
type: "manual"
---

# 技嘉出勤時間追蹤器 - Copilot 開發指南

> **專案版本**: 2.0.0
> **技術堆疊**: TypeScript + Vue 3.0 (Composition API) + Vite
> **最後更新**: 2025-10-08

## 📋 開發原則與優先級

### 核心原則
1. **完成當前需求為最高原則**：專注於實現用戶明確要求的功能，避免過度工程化
2. **禁止建立測試相關檔案**：除非用戶明確要求，否則不得建立任何測試檔案、測試程式碼或測試相關的配置
3. **優先實用性**：以快速交付可用功能為目標，避免不必要的抽象化或複雜化
4. **型別安全優先**：充分利用 TypeScript 的型別系統，確保程式碼品質
5. **Vue 3 最佳實踐**：使用 Composition API 與 `<script setup>` 語法

---

## 🎯 專案概述

為技嘉員工開發的 Chrome/Edge 瀏覽器擴充套件，用於追蹤出勤時間並計算彈性工作時間完成度。

### 主要功能
- ✅ 使用者認證（登入/登出）
- ✅ 記住密碼（AES-GCM 加密）
- ✅ 今日出勤顯示
- ✅ 預計下班時間計算
- ✅ 剩餘時間倒數（翻頁時鐘）
- ✅ 異常記錄查詢
- ✅ 主題切換（白色/黑夜/莫蘭迪）
- ✅ 自動重新整理
- ✅ 自動重新登入

---

## 🛠️ 技術堆疊

### 核心技術
- **Vue 3.4.21** - 使用 Composition API 與 `<script setup>` 語法
- **TypeScript 5.3.3** - 嚴格型別檢查
- **Vite 5.1.4** - 現代化建置工具
- **SCSS** - CSS 預處理器
- **Pinia 2.1.7** - Vue 3 官方狀態管理庫（已安裝但未使用）

### 開發工具
- **vite-plugin-web-extension** - 瀏覽器擴充套件建置支援
- **@types/chrome** - Chrome Extension API 型別定義
- **PostCSS** - CSS 後處理器（Autoprefixer, CSS Nano）
- **Terser** - JavaScript 壓縮工具

### 擴充套件規範
- **Manifest V3** - Chrome Extension Manifest 第三版
- **Service Worker** - 背景腳本架構

---

## 📁 專案結構

```
edge-extension/
├── src/                              # 原始碼目錄
│   ├── manifest.json                # Extension Manifest V3
│   ├── types/                       # TypeScript 型別定義
│   │   ├── attendance.ts           # 出勤相關型別
│   │   ├── auth.ts                 # 認證相關型別
│   │   ├── storage.ts              # 儲存相關型別
│   │   ├── theme.ts                # 主題相關型別
│   │   ├── time.ts                 # 時間相關型別
│   │   └── index.ts                # 統一匯出
│   ├── utils/                       # 核心工具類別
│   │   ├── crypto.ts               # 加密管理器（AES-GCM）
│   │   ├── storage.ts              # 儲存管理器
│   │   └── timeCalculator.ts      # 時間計算器
│   ├── composables/                 # Vue 3 Composables
│   │   ├── useAuth.ts              # 認證管理
│   │   ├── useApi.ts               # API 呼叫
│   │   ├── useStorage.ts           # 儲存操作
│   │   ├── useTheme.ts             # 主題管理
│   │   ├── useTimeCalculator.ts    # 時間計算
│   │   ├── useAttendance.ts        # 出勤管理
│   │   └── index.ts                # 統一匯出
│   ├── background/                  # 背景腳本
│   │   └── service-worker.ts       # Service Worker
│   └── popup/                       # Popup UI
│       ├── popup.html              # HTML 入口
│       ├── main.ts                 # Vue 應用程式入口
│       ├── App.vue                 # 根元件
│       ├── style.scss              # 全域樣式
│       ├── styles/                 # SCSS 樣式系統
│       │   ├── variables.scss      # 全域變數
│       │   └── mixins.scss         # Mixins
│       └── components/             # Vue 元件
│           ├── common/             # 通用元件
│           │   ├── Header.vue
│           │   ├── LoadingOverlay.vue
│           │   └── ErrorMessage.vue
│           ├── LoginForm.vue       # 登入表單
│           ├── AttendanceView.vue  # 出勤檢視
│           ├── TodayTab.vue        # 今日出勤
│           ├── AbnormalTab.vue     # 異常記錄
│           ├── FlipClock.vue       # 翻頁時鐘
│           └── SettingsView.vue    # 設定頁面
├── dist/                            # 建置輸出（自動生成）
├── docs/                            # 文件目錄
│   ├── MIGRATION_COMPLETE.md       # 遷移完成報告
│   ├── VITE_CONFIGURATION.md       # Vite 配置說明
│   ├── BUILD_OPTIMIZATION_CHECKLIST.md
│   ├── VITE_QUICK_START.md         # 快速開始指南
│   └── VITE_OPTIMIZATION_SUMMARY.md
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
├── postcss.config.js                # PostCSS 配置
├── package.json                     # 專案配置
├── .env.development                 # 開發環境變數
├── .env.production                  # 生產環境變數
└── .env.example                     # 環境變數範例
```

---

## 🔑 關鍵業務邏輯：彈性工作時間制度

### 時間計算規則

```typescript
// src/utils/timeCalculator.ts 中的核心規則
private readonly FLEX_START_TIME = { hours: 8, minutes: 30 }   // 8:30 彈性開始時間
private readonly FLEX_END_TIME = { hours: 9, minutes: 30 }     // 9:30 彈性結束時間
private readonly STANDARD_WORK_HOURS = 9                        // 標準工作時數
private readonly STANDARD_WORK_MINUTES = 15                     // 標準工作分鐘
private readonly EARLY_CLOCK_OUT = { hours: 17, minutes: 45 }  // 17:45 早到下班時間
private readonly LATE_CLOCK_OUT = { hours: 18, minutes: 45 }   // 18:45 遲到下班時間
```

### 計算邏輯

| 上班時間 | 下班時間計算規則 | 說明 |
|---------|----------------|------|
| ≤ 8:30 | 固定 17:45 下班 | 早到獎勵 |
| 8:30 - 9:30 | 上班時間 + 9 小時 15 分鐘 | 彈性計算 |
| > 9:30 | 固定 18:45 下班 | 遲到懲罰 |

### 使用範例

```typescript
import { timeCalculator } from '@utils/timeCalculator'

// 計算預計下班時間
const result = timeCalculator.calculateExpectedClockOut('08:15')
// result: { hours: 17, minutes: 45, isFlexTime: false }

// 計算剩餘時間
const remaining = timeCalculator.calculateRemainingTime('08:15', '16:30')
// remaining: { hours: 1, minutes: 15, seconds: 0, totalSeconds: 4500 }
```

---

## 🚀 開發工作流程

### 環境需求

```bash
# 檢查 Node.js 版本（需要 18.x 或更新）
node --version  # 應該 >= 18.0.0

# 檢查 npm 版本
npm --version   # 應該 >= 8.0.0
```

### 開發流程

#### 1. 安裝依賴

```bash
npm install
```

#### 2. 啟動開發伺服器（支援 HMR）

```bash
npm run dev
```

開發伺服器會在 `http://localhost:5173` 啟動，支援 Hot Module Replacement。

#### 3. 建置專案

```bash
# 建置生產版本（優化、壓縮）
npm run build

# 建置開發版本（包含 source map）
npm run build:dev

# 清除並重新建置
npm run rebuild
```

#### 4. 載入擴充套件

1. 開啟 Chrome 或 Edge 瀏覽器
2. 前往 `chrome://extensions/` 或 `edge://extensions/`
3. 啟用「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案的 `dist/` 資料夾

#### 5. 除錯

- **Popup 除錯**：在 popup 視窗按 F12 開啟 DevTools
- **Background Script 除錯**：在擴充套件頁面點擊「檢查檢視」→「Service Worker」
- **查看日誌**：檢查 Console 輸出

#### 6. 熱重載

- **開發模式**：修改程式碼後，Vite HMR 會自動更新（僅限 popup）
- **擴充套件重載**：在擴充套件頁面點擊「重新載入」圖示

### 可用指令

```bash
# 開發
npm run dev              # 啟動開發伺服器
npm run build:dev        # 建置開發版本

# 生產
npm run build            # 建置生產版本
npm run clean            # 清除建置輸出
npm run rebuild          # 清除並重新建置

# 其他
npm run preview          # 預覽建置結果
npm run analyze          # 分析 bundle 大小
```

---

## 🔐 身份驗證與 API 整合

### 網域身份驗證格式

```typescript
// 帳號格式（關鍵）
const account = "gigabyte\\username"  // 必須使用反斜線 \\，不是正斜線 /
```

### API 端點

```typescript
// src/background/service-worker.ts
const LOGIN_URL = 'https://geip.gigabyte.com.tw/api_geip/api/Login/Login'
const ATTENDANCE_URL = 'https://eipapi.gigabyte.com.tw/GEIP_API/api/Attendance'
```

### 訊息傳遞模式

```typescript
// Popup → Background Script
chrome.runtime.sendMessage({
  action: 'login' | 'logout' | 'getAttendance' | 'getHistoryAttendance',
  credentials?: { account: string, password: string, remember: boolean },
  serverKey?: string,
  days?: number
})

// Background Script → Popup
{
  success: boolean,
  data?: any,
  error?: string
}
```

### 使用 Composables

```typescript
// 在 Vue 元件中使用
import { useAuth } from '@composables'

const { login, logout, isAuthenticated } = useAuth()

// 登入
await login('gigabyte\\username', 'password', true)

// 登出
await logout()
```

---

## 🎨 路徑別名配置

專案配置了以下路徑別名，簡化 import 路徑：

```typescript
// vite.config.ts
alias: {
  '@': resolve(__dirname, './src'),
  '@components': resolve(__dirname, './src/popup/components'),
  '@composables': resolve(__dirname, './src/composables'),
  '@utils': resolve(__dirname, './src/utils'),
  '@types': resolve(__dirname, './src/types'),
}
```

### 使用範例

```typescript
// ✅ 使用別名（推薦）
import { useAuth } from '@composables'
import { cryptoManager } from '@utils/crypto'
import type { LoginCredentials } from '@types'
import Header from '@components/common/Header.vue'

// ❌ 避免使用相對路徑
import { useAuth } from '../../composables'
import { cryptoManager } from '../../utils/crypto'
```

---

## 🎨 SCSS 使用指南

### 全域變數

專案提供完整的 SCSS 變數系統（`src/popup/styles/variables.scss`）：

```scss
// 在元件中引入
@use "@/popup/styles/variables.scss" as *;

.my-component {
  // 使用變數
  padding: $spacing-md;           // 16px
  border-radius: $border-radius-lg; // 12px
  color: $text-primary;           // #333333
  transition: all $transition-base; // 0.3s
}
```

### 可用變數類別

- **間距**: `$spacing-xs` (4px) ~ `$spacing-xl` (32px)
- **圓角**: `$border-radius-sm` (4px) ~ `$border-radius-xl` (16px)
- **字體大小**: `$font-size-xs` (12px) ~ `$font-size-xl` (20px)
- **字重**: `$font-weight-normal` ~ `$font-weight-bold`
- **過渡時間**: `$transition-fast` (0.15s) ~ `$transition-slow` (0.5s)
- **顏色**: `$primary-color`, `$text-primary`, `$background-color` 等

### Mixins

專案提供豐富的 Mixins（`src/popup/styles/mixins.scss`）：

```scss
@use "@/popup/styles/mixins.scss" as *;

.my-component {
  // Flexbox
  @include flex-center;           // 水平垂直置中
  @include flex-between;          // 兩端對齊

  // 按鈕
  @include button-primary;        // 主要按鈕樣式

  // 卡片
  @include card;                  // 卡片樣式

  // 響應式
  @include respond-to('md') {
    padding: $spacing-lg;
  }

  // 滾動條
  @include scrollbar(8px);
}
```

### CSS 變數（主題系統）

```scss
.my-component {
  // 使用 CSS 變數（支援主題切換）
  background: var(--theme-background);
  color: var(--theme-textPrimary);
  border: 1px solid var(--theme-border);
}
```

---

## 🌍 環境變數

### 環境檔案

- `.env.development` - 開發環境變數
- `.env.production` - 生產環境變數
- `.env.example` - 環境變數範例

### 可用變數

```bash
# 瀏覽器選擇
VITE_BROWSER=chrome

# API 端點
VITE_API_BASE_URL=https://eipapi.gigabyte.com.tw/GEIP_API/api
VITE_AUTH_BASE_URL=https://geip.gigabyte.com.tw/api_geip/api

# 開發模式
VITE_DEV_MODE=true

# 日誌
VITE_ENABLE_LOGS=true
```

### 在程式碼中使用

```typescript
// 環境模式
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// 自訂變數
const apiUrl = import.meta.env.VITE_API_BASE_URL
const enableLogs = import.meta.env.VITE_ENABLE_LOGS === 'true'

// 全域定義（在 vite.config.ts 中定義）
console.log(__DEV__)      // 開發模式
console.log(__PROD__)     // 生產模式
console.log(__VERSION__)  // 版本號
```

---

## 📝 TypeScript 編碼規範

### 型別定義

```typescript
// ✅ 使用明確的型別定義
interface LoginCredentials {
  account: string
  password: string
  remember: boolean
}

// ✅ 使用型別匯入
import type { LoginCredentials } from '@types'

// ❌ 避免使用 any
const data: any = {}  // 不好

// ✅ 使用具體型別或 unknown
const data: LoginCredentials = {}  // 好
```

### 函數定義

```typescript
// ✅ 明確的參數和返回值型別
function calculateTime(clockIn: string): ExpectedClockOut {
  // ...
}

// ✅ 使用泛型
function createResult<T>(data: T): Result<T> {
  return { success: true, data }
}
```

### Composables 模式

```typescript
// ✅ 標準 Composable 結構
export function useAuth() {
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)

  const login = async (account: string, password: string) => {
    // ...
  }

  const logout = async () => {
    // ...
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    login,
    logout,
  }
}
```

---

## 🎯 Vue 3 Composition API 編碼規範

### 元件結構

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LoginCredentials } from '@types'
import { useAuth } from '@composables'

// Props
interface Props {
  title?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: '預設標題'
})

// Emits
interface Emits {
  (e: 'submit', data: LoginCredentials): void
}
const emit = defineEmits<Emits>()

// Composables
const { login, isAuthenticated } = useAuth()

// State
const account = ref('')
const password = ref('')

// Computed
const isValid = computed(() => {
  return account.value && password.value
})

// Methods
const handleSubmit = async () => {
  if (!isValid.value) return

  await login(account.value, password.value)
  emit('submit', { account: account.value, password: password.value, remember: false })
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div class="login-form">
    <h2>{{ props.title }}</h2>
    <input v-model="account" type="text" placeholder="帳號">
    <input v-model="password" type="password" placeholder="密碼">
    <button @click="handleSubmit" :disabled="!isValid">
      登入
    </button>
  </div>
</template>

<style scoped lang="scss">
@use "@/popup/styles/variables.scss" as *;
@use "@/popup/styles/mixins.scss" as *;

.login-form {
  @include flex-column;
  gap: $spacing-md;
  padding: $spacing-lg;

  button {
    @include button-primary;
  }
}
</style>
```

### 最佳實踐

1. **使用 `<script setup>`**：更簡潔的語法
2. **型別安全的 Props 和 Emits**：使用 TypeScript 介面
3. **Composables 優先**：將可重用邏輯提取到 composables
4. **Scoped Styles**：使用 `<style scoped>` 避免樣式污染
5. **使用 SCSS**：利用變數和 mixins

---

## 🔒 安全性

### 加密機制

```typescript
// src/utils/crypto.ts
// AES-GCM 加密（256-bit）
// PBKDF2 金鑰衍生（100,000 次迭代）
// 瀏覽器指紋作為鹽值

import { cryptoManager } from '@utils/crypto'

// 初始化
await cryptoManager.init()

// 加密
const encrypted = await cryptoManager.encrypt('sensitive data')

// 解密
const decrypted = await cryptoManager.decrypt(encrypted)

// 儲存憑證
await cryptoManager.saveCredentials('account', 'password')

// 載入憑證
const credentials = await cryptoManager.loadCredentials()
```

### 自動重新登入

```typescript
// src/background/service-worker.ts
// 每小時檢查一次
// 在 7.5 小時時自動重新登入
// 避免 8 小時 token 過期
```

---

## 📊 資料流與狀態管理

### 登入流程

```
User Input (LoginForm.vue)
  ↓
useAuth Composable
  ↓
Background Script (service-worker.ts)
  ↓
EIP API (geip.gigabyte.com.tw)
  ↓
Chrome Storage (encrypted)
  ↓
UI Update (reactive)
```

### 出勤資料流程

```
User Action (refresh button)
  ↓
useAttendance Composable
  ↓
Background Script
  ↓
EIP API (eipapi.gigabyte.com.tw)
  ↓
Data Parsing
  ↓
Chrome Storage
  ↓
UI Update (TodayTab.vue / AbnormalTab.vue)
```

### 儲存鍵值

```typescript
// src/types/storage.ts
export enum StorageKeys {
  IS_LOGGED_IN = 'isLoggedIn',
  SERVER_KEY = 'serverKey',
  LOGIN_INFO = 'loginInfo',
  ATTENDANCE_DATA = 'attendanceData',
  USER_SETTINGS = 'userSettings',
  ENCRYPTED_CREDENTIALS = 'encryptedCredentials',
}
```

---

## 🎨 主題系統

### 可用主題

```typescript
// src/types/theme.ts
export type ThemeId = 'light' | 'dark' | 'morandi'
```

### 使用主題

```typescript
import { useTheme } from '@composables'

const { currentTheme, switchTheme, getAllThemes } = useTheme()

// 切換主題
await switchTheme('dark')

// 取得所有主題
const themes = getAllThemes()
```

### CSS 變數

每個主題定義以下 CSS 變數：

```css
--theme-primary
--theme-primaryGradient
--theme-background
--theme-backgroundSecondary
--theme-backgroundCard
--theme-textPrimary
--theme-textSecondary
--theme-textMuted
--theme-textInverse
--theme-border
--theme-shadow
--theme-shadowHover
--theme-hover
--theme-active
```

---

## 📚 文件資源

### 核心文件

- **README.md** - 專案說明與使用指南
- **docs/MIGRATION_COMPLETE.md** - 遷移完成報告
- **docs/VITE_CONFIGURATION.md** - Vite 配置詳細說明
- **docs/VITE_QUICK_START.md** - 快速開始指南
- **docs/BUILD_OPTIMIZATION_CHECKLIST.md** - 建置優化檢查清單
- **docs/VITE_OPTIMIZATION_SUMMARY.md** - 優化總結報告

### 參考資源

- [Vite 官方文件](https://vitejs.dev/)
- [Vue 3 官方文件](https://vuejs.org/)
- [TypeScript 官方文件](https://www.typescriptlang.org/)
- [Chrome Extensions 文件](https://developer.chrome.com/docs/extensions/)

---

## 🌐 企業整合特定需求

### 中文本地化
- 所有 UI 文字使用繁體中文
- 日期格式包含星期名稱
- 時間格式使用 24 小時制

### 網域需求
- 強制使用 Windows 網域身份驗證（`gigabyte\\username`）
- 帳號格式驗證

### 時區
- 全程假設為台灣標準時間（UTC+8）
- 不處理時區轉換

### 會話管理
- 為符合安全規範，實作自動重新登入機制
- 在 7.5 小時時自動重新登入，避免 8 小時 token 過期

### CORS 處理
- 擴充功能對以下網域有權限：
  - `https://geip.gigabyte.com.tw/*`
  - `https://eipapi.gigabyte.com.tw/*`

---

## ⚠️ 重要提醒

### 開發注意事項

1. **Node.js 版本**：需要 18.x 或更新版本
2. **測試檔案**：除非用戶明確要求，否則不建立測試檔案
3. **型別安全**：充分利用 TypeScript，避免使用 `any`
4. **Composition API**：使用 `<script setup>` 語法
5. **路徑別名**：使用 `@` 開頭的別名，避免相對路徑
6. **SCSS**：使用全域變數和 mixins，保持樣式一致性
7. **環境變數**：敏感資訊使用環境變數，不要硬編碼

### 常見問題

1. **HMR 不工作**：重新啟動開發伺服器
2. **建置失敗**：檢查 Node.js 版本，確保 >= 18.0.0
3. **擴充套件無法載入**：確認已執行 `npm run build`
4. **型別錯誤**：重新啟動 IDE 的 TypeScript 伺服器

---

**維護者**: Augment Agent
**最後更新**: 2025-10-08
**版本**: 2.0.0