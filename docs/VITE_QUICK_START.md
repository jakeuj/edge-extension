# Vite 建置工具快速開始指南

本指南將協助您快速上手專案的 Vite 建置配置。

## 🚀 快速開始

### 1. 環境需求

確認您的環境符合以下需求：

```bash
# 檢查 Node.js 版本（需要 18.x 或更新）
node --version

# 檢查 npm 版本
npm --version
```

**最低需求**：
- Node.js: 18.0.0 或更新
- npm: 8.0.0 或更新

### 2. 安裝依賴

```bash
# 安裝所有依賴
npm install
```

### 3. 開發模式

```bash
# 啟動開發伺服器（支援 HMR）
npm run dev
```

開發伺服器會在 `http://localhost:5173` 啟動。

### 4. 建置專案

```bash
# 建置生產版本
npm run build

# 建置開發版本（包含 source map）
npm run build:dev
```

建置結果會輸出到 `dist/` 目錄。

### 5. 載入擴充套件

1. 開啟 Chrome 或 Edge 瀏覽器
2. 前往 `chrome://extensions/` 或 `edge://extensions/`
3. 啟用「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案的 `dist/` 資料夾

---

## 📁 專案結構

```
edge-extension/
├── src/                          # 原始碼
│   ├── manifest.json            # Extension Manifest
│   ├── types/                   # TypeScript 型別定義
│   ├── utils/                   # 工具函數
│   ├── composables/             # Vue Composables
│   ├── background/              # 背景腳本
│   └── popup/                   # Popup UI
│       ├── popup.html
│       ├── main.ts
│       ├── App.vue
│       ├── style.scss
│       ├── styles/              # SCSS 樣式
│       │   ├── variables.scss
│       │   └── mixins.scss
│       └── components/          # Vue 元件
├── dist/                         # 建置輸出（自動生成）
├── docs/                         # 文件
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 專案配置
├── .env.development             # 開發環境變數
├── .env.production              # 生產環境變數
└── .env.example                 # 環境變數範例
```

---

## 🛠️ 可用指令

### 開發指令

```bash
# 啟動開發伺服器
npm run dev

# 建置開發版本
npm run build:dev
```

### 生產指令

```bash
# 建置生產版本
npm run build

# 清除建置輸出
npm run clean

# 清除並重新建置
npm run rebuild
```

### 其他指令

```bash
# 預覽建置結果
npm run preview

# 型別檢查（目前跳過）
npm run type-check

# 程式碼檢查（目前跳過）
npm run lint

# 分析 bundle 大小
npm run analyze
```

---

## 🎯 開發工作流程

### 標準開發流程

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **修改程式碼**
   - 編輯 `.vue` 檔案
   - 修改 `.ts` 檔案
   - 調整 `.scss` 樣式

3. **即時預覽**
   - HMR 會自動重新載入變更
   - 檢查瀏覽器控制台是否有錯誤

4. **建置測試**
   ```bash
   npm run build:dev
   ```

5. **載入擴充套件**
   - 在瀏覽器中載入 `dist/` 目錄
   - 測試所有功能

6. **生產建置**
   ```bash
   npm run build
   ```

### 快速迭代流程

```bash
# 1. 修改程式碼
# 2. 儲存檔案（HMR 自動更新）
# 3. 在瀏覽器中測試
# 4. 重複步驟 1-3
```

---

## 🔧 配置說明

### Vite 配置重點

**vite.config.ts** 包含以下主要配置：

1. **插件配置**
   - Vue 3 支援
   - Web Extension 建置

2. **路徑別名**
   - `@` → `src/`
   - `@components` → `src/popup/components/`
   - `@composables` → `src/composables/`
   - `@utils` → `src/utils/`
   - `@types` → `src/types/`

3. **開發伺服器**
   - Port: 5173
   - HMR 支援

4. **建置優化**
   - 程式碼分割
   - 資源壓縮
   - Source map 配置

### 環境變數

**開發環境** (`.env.development`):
```bash
VITE_BROWSER=chrome
VITE_DEV_MODE=true
VITE_ENABLE_LOGS=true
```

**生產環境** (`.env.production`):
```bash
VITE_BROWSER=chrome
VITE_DEV_MODE=false
VITE_ENABLE_LOGS=false
```

### 在程式碼中使用環境變數

```typescript
// 環境模式
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// 自訂變數
const browser = import.meta.env.VITE_BROWSER
const enableLogs = import.meta.env.VITE_ENABLE_LOGS === 'true'

// 全域定義
console.log(__DEV__)      // 開發模式
console.log(__PROD__)     // 生產模式
console.log(__VERSION__)  // 版本號
```

---

## 🎨 SCSS 使用指南

### 全域變數

所有 SCSS 檔案都可以使用全域變數（需要手動引入）：

```scss
// 在元件中引入
@use "@/popup/styles/variables.scss" as *;
@use "@/popup/styles/mixins.scss" as *;

.my-component {
  // 使用變數
  padding: $spacing-md;
  color: $text-primary;
  
  // 使用 mixin
  @include flex-center;
}
```

### 可用變數

詳見 `src/popup/styles/variables.scss`：

```scss
// 間距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 圓角
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;

// 字體大小
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 18px;

// 過渡時間
$transition-fast: 0.15s;
$transition-base: 0.3s;
$transition-slow: 0.5s;
```

### 可用 Mixins

詳見 `src/popup/styles/mixins.scss`：

```scss
// Flexbox
@include flex-center;
@include flex-between;
@include flex-column;

// 按鈕
@include button-primary;
@include button-secondary;

// 卡片
@include card;
@include card-hover;

// 輸入框
@include input-base;

// 滾動條
@include scrollbar;

// 響應式
@include respond-to('md') {
  // 中等螢幕以上的樣式
}
```

---

## 🐛 常見問題排除

### 問題 1: npm install 失敗

**錯誤訊息**：
```
ERESOLVE could not resolve
```

**解決方案**：
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

### 問題 2: 建置失敗（Node.js 版本）

**錯誤訊息**：
```
SyntaxError: Unexpected token '??='
```

**解決方案**：
```bash
# 升級 Node.js 到 18.x 或更新
nvm install 18
nvm use 18

# 重新安裝依賴
npm install
```

### 問題 3: HMR 不工作

**症狀**：修改程式碼後沒有自動更新

**解決方案**：
1. 檢查開發伺服器是否正在運行
2. 檢查瀏覽器控制台是否有錯誤
3. 重新啟動開發伺服器：
   ```bash
   # Ctrl+C 停止伺服器
   npm run dev
   ```

### 問題 4: 擴充套件無法載入

**症狀**：在瀏覽器中載入 dist/ 目錄時出錯

**解決方案**：
1. 確認已執行建置：
   ```bash
   npm run build
   ```

2. 檢查 `dist/` 目錄是否存在且包含以下檔案：
   - `manifest.json`
   - `popup/popup.html`
   - `background/service-worker.js`

3. 檢查瀏覽器控制台的錯誤訊息

### 問題 5: TypeScript 錯誤

**症狀**：IDE 顯示型別錯誤

**解決方案**：
1. 確認 TypeScript 版本正確：
   ```bash
   npm list typescript
   ```

2. 重新啟動 IDE 的 TypeScript 伺服器

3. 檢查 `tsconfig.json` 配置

---

## 📚 進階主題

### 自訂建置配置

編輯 `vite.config.ts` 以自訂建置行為：

```typescript
export default defineConfig(({ mode }) => {
  return {
    // 您的自訂配置
    build: {
      // 修改輸出目錄
      outDir: 'build',
      
      // 修改 chunk 大小警告限制
      chunkSizeWarningLimit: 2000,
    },
  }
})
```

### 新增環境變數

1. 在 `.env.development` 或 `.env.production` 新增變數：
   ```bash
   VITE_MY_VARIABLE=my_value
   ```

2. 在程式碼中使用：
   ```typescript
   const myVar = import.meta.env.VITE_MY_VARIABLE
   ```

### 新增 PostCSS 插件

編輯 `postcss.config.js`：

```javascript
export default {
  plugins: {
    autoprefixer: {},
    // 新增其他插件
    'postcss-nested': {},
  },
}
```

---

## 🔗 相關文件

- [VITE_CONFIGURATION.md](./VITE_CONFIGURATION.md) - 詳細配置說明
- [BUILD_OPTIMIZATION_CHECKLIST.md](./BUILD_OPTIMIZATION_CHECKLIST.md) - 優化檢查清單
- [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) - 遷移完成報告

---

## 💡 提示與技巧

### 1. 使用路徑別名

```typescript
// ✅ 好的做法
import { useAuth } from '@composables'
import Header from '@components/common/Header.vue'

// ❌ 避免
import { useAuth } from '../../composables'
import Header from '../components/common/Header.vue'
```

### 2. 利用 HMR

修改 Vue 元件時，HMR 會保留元件狀態，加快開發速度。

### 3. 使用開發建置測試

在提交前，使用開發建置測試：

```bash
npm run build:dev
```

這會包含 source map，方便除錯。

### 4. 定期清理建置

```bash
npm run clean
```

避免舊檔案干擾。

---

**維護者**: Augment Agent  
**最後更新**: 2025-10-08  
**版本**: 2.0.0

