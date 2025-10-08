# 技嘉出勤時間追蹤器 v2.0

> TypeScript + Vue 3.0 (Composition API) 版本

一個用於追蹤技嘉員工出勤時間的 Chrome/Edge 瀏覽器擴充套件，支援彈性上班制度、自動計算預計下班時間、異常記錄查詢等功能。

## ✨ 主要功能

### 🔐 認證管理
- 使用者登入與登出
- 記住密碼功能（AES-GCM 加密）
- 自動重新登入（Token 過期前自動更新）

### 📊 出勤追蹤
- 今日出勤資訊顯示
- 預計下班時間計算（基於彈性上班制度）
- 剩餘工作時間倒數（翻頁時鐘效果）
- 異常出勤記錄查詢（可設定查詢天數）

### 🎨 主題系統
- 白色主題（預設）
- 黑夜模式（護眼深色主題）
- 莫蘭迪色系（柔和優雅）

### ⚙️ 設定選項
- 自動重新整理間隔設定
- 異常記錄查詢天數設定
- 通知開關

## 🚀 快速開始

### 環境需求

- **Node.js**: 18.x 或更新版本
- **npm**: 8.x 或更新版本
- **瀏覽器**: Chrome 或 Edge (支援 Manifest V3)

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/jakeuj/edge-extension.git
cd edge-extension
```

2. **安裝相依套件**
```bash
npm install
```

3. **建置專案**
```bash
# 開發模式（支援 HMR）
npm run dev

# 生產建置
npm run build
```

4. **載入擴充套件**
   - 開啟 Chrome/Edge 瀏覽器
   - 前往 `chrome://extensions/` 或 `edge://extensions/`
   - 啟用「開發人員模式」
   - 點擊「載入未封裝項目」
   - 選擇專案的 `dist` 資料夾

## 📁 專案結構

```
src/
├── manifest.json                    # Extension Manifest V3
├── types/                           # TypeScript 型別定義
│   ├── attendance.ts               # 出勤相關型別
│   ├── auth.ts                     # 認證相關型別
│   ├── storage.ts                  # 儲存相關型別
│   ├── theme.ts                    # 主題相關型別
│   ├── time.ts                     # 時間相關型別
│   └── index.ts                    # 統一匯出
├── utils/                           # 核心工具類別
│   ├── crypto.ts                   # 加密管理器
│   ├── storage.ts                  # 儲存管理器
│   └── timeCalculator.ts           # 時間計算器
├── composables/                     # Vue 3 Composables
│   ├── useAuth.ts                  # 認證管理
│   ├── useApi.ts                   # API 呼叫
│   ├── useStorage.ts               # 儲存操作
│   ├── useTheme.ts                 # 主題管理
│   ├── useTimeCalculator.ts        # 時間計算
│   ├── useAttendance.ts            # 出勤管理
│   └── index.ts                    # 統一匯出
├── background/                      # 背景腳本
│   └── service-worker.ts           # Service Worker
└── popup/                           # Popup UI
    ├── popup.html                  # HTML 入口
    ├── main.ts                     # Vue 應用程式入口
    ├── App.vue                     # 根元件
    ├── style.scss                  # 全域樣式
    └── components/                 # Vue 元件
        ├── common/                 # 通用元件
        │   ├── Header.vue
        │   ├── LoadingOverlay.vue
        │   └── ErrorMessage.vue
        ├── LoginForm.vue           # 登入表單
        ├── AttendanceView.vue      # 出勤檢視
        ├── TodayTab.vue            # 今日出勤
        ├── AbnormalTab.vue         # 異常記錄
        ├── FlipClock.vue           # 翻頁時鐘
        └── SettingsView.vue        # 設定頁面
```

## 🔧 技術堆疊

### 核心技術
- **Vue 3.4.21** - 使用 Composition API 與 `<script setup>` 語法
- **TypeScript 5.3.3** - 嚴格型別檢查
- **Vite 5.1.4** - 現代化建置工具
- **SCSS** - CSS 預處理器

### 開發工具
- **vite-plugin-web-extension** - 瀏覽器擴充套件建置支援
- **@types/chrome** - Chrome Extension API 型別定義

### 狀態管理
- **Pinia 2.1.7** - Vue 3 官方狀態管理庫

## 📖 使用說明

### 登入
1. 點擊瀏覽器工具列的擴充套件圖示
2. 輸入帳號（格式：`域名\使用者名稱`，例如：`gigabyte\your.username`）
3. 輸入密碼
4. 勾選「記住登入資訊」（可選，會加密儲存憑證）
5. 點擊「登入」按鈕

### 查看出勤資訊
- **今日出勤**: 顯示今日上班時間、預計下班時間、剩餘工作時間
- **出勤異常**: 顯示過去指定天數內的異常出勤記錄

### 切換主題
1. 點擊右上角的設定圖示
2. 在「主題設定」區塊選擇喜歡的主題
3. 主題會立即套用並自動儲存

### 調整設定
1. 點擊右上角的設定圖示
2. 調整以下選項：
   - 自動重新整理間隔（秒）
   - 異常記錄查詢天數
   - 通知開關
3. 點擊「儲存設定」按鈕

## 🎯 彈性上班制度規則

專案實作了技嘉的彈性上班制度：

| 上班時間 | 下班時間計算規則 |
|---------|----------------|
| ≤ 8:30 | 固定 17:45 下班 |
| 8:30 - 9:30 | 上班時間 + 9 小時 15 分鐘 |
| > 9:30 | 固定 18:45 下班 |

## 🔒 安全性

### 加密機制
- **演算法**: AES-GCM (256-bit)
- **金鑰衍生**: PBKDF2 (100,000 次迭代)
- **鹽值**: 瀏覽器指紋（基於 User Agent 和其他瀏覽器特徵）

### 資料儲存
- 使用 Chrome Storage API 儲存加密後的憑證
- 不會將密碼以明文形式儲存
- 支援清除所有儲存資料

## 🛠️ 開發指南

### 可用指令

```bash
# 開發模式（支援 HMR）
npm run dev

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview

# 型別檢查（需要 Node.js 18+）
npm run type-check
```

### 新增功能

1. **新增 Composable**
   - 在 `src/composables/` 建立新檔案
   - 使用 `export function useSomething()` 格式
   - 在 `src/composables/index.ts` 匯出

2. **新增元件**
   - 在 `src/popup/components/` 建立 `.vue` 檔案
   - 使用 `<script setup lang="ts">` 語法
   - 使用 `<style scoped lang="scss">` 定義樣式

3. **新增型別**
   - 在 `src/types/` 建立或修改型別檔案
   - 在 `src/types/index.ts` 匯出新型別

## ⚠️ 重要提醒

### Node.js 版本需求
此專案需要 **Node.js 18.x 或更新版本** 才能正常建置。如果您使用的是較舊版本的 Node.js，請先升級：

```bash
# 使用 nvm (Node Version Manager)
nvm install 18
nvm use 18

# 重新安裝相依套件
npm install

# 建置專案
npm run build
```

## 📝 版本歷史

### v2.0.0 (2025-10-08)
- 🎉 完整遷移至 TypeScript + Vue 3.0
- ✨ 使用 Composition API 重構所有元件
- 🎨 實作主題系統（3 種主題）
- 🔒 改進加密機制
- 📦 使用 Vite 作為建置工具
- 🧩 模組化程式碼結構

### v1.0.0
- 初始版本（JavaScript + Vanilla JS）

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 作者

- **Jake Chu** - 原始專案
- **Augment Agent** - TypeScript + Vue 3 遷移

## 🙏 致謝

感謝所有為這個專案做出貢獻的人！

---

**注意**: 此專案僅供技嘉員工內部使用，請勿用於其他用途。

## 📚 更多資訊

詳細的遷移報告請參閱 [docs/MIGRATION_COMPLETE.md](docs/MIGRATION_COMPLETE.md)

