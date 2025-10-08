# Vite 建置配置說明

本文件詳細說明專案的 Vite 建置配置，包括開發環境優化、建置優化、以及瀏覽器擴充套件特定配置。

## 📋 目錄

- [配置概覽](#配置概覽)
- [開發環境優化](#開發環境優化)
- [建置優化](#建置優化)
- [瀏覽器擴充套件配置](#瀏覽器擴充套件配置)
- [環境變數](#環境變數)
- [SCSS 配置](#scss-配置)
- [常見問題](#常見問題)

---

## 配置概覽

### 核心插件

1. **@vitejs/plugin-vue** - Vue 3 支援
2. **vite-plugin-web-extension** - 瀏覽器擴充套件建置支援

### 主要功能

- ✅ HMR (Hot Module Replacement) 支援
- ✅ TypeScript 完整支援
- ✅ SCSS 預處理器
- ✅ 程式碼分割 (Code Splitting)
- ✅ 資源優化與壓縮
- ✅ Source Map 配置
- ✅ 環境變數管理

---

## 開發環境優化

### HMR 配置

```typescript
server: {
  port: 5173,
  strictPort: false,
  hmr: {
    protocol: 'ws',
    host: 'localhost',
    port: 5173,
  },
}
```

**特點**：
- WebSocket 協議實現即時更新
- 自動偵測檔案變更
- 支援 Vue 元件熱重載

### 檔案監聽

```typescript
watch: {
  usePolling: false,
  interval: 100,
}
```

**說明**：
- `usePolling: false` - 使用原生檔案系統事件（更高效）
- `interval: 100` - 輪詢間隔（僅在 polling 模式下使用）

### 開發指令

```bash
# 啟動開發伺服器
npm run dev

# 建置開發版本（包含 source map）
npm run build:dev
```

---

## 建置優化

### 程式碼分割策略

專案採用智能程式碼分割，將程式碼分為以下 chunks：

1. **vendor-vue** - Vue 核心庫
2. **vendor-pinia** - Pinia 狀態管理
3. **vendor** - 其他第三方庫
4. **composables** - Vue Composables
5. **utils** - 工具函數

```typescript
manualChunks: (id) => {
  if (id.includes('node_modules/vue')) {
    return 'vendor-vue'
  }
  if (id.includes('node_modules/pinia')) {
    return 'vendor-pinia'
  }
  if (id.includes('node_modules')) {
    return 'vendor'
  }
  if (id.includes('/composables/')) {
    return 'composables'
  }
  if (id.includes('/utils/')) {
    return 'utils'
  }
}
```

**優點**：
- 減少主 bundle 大小
- 提升快取效率
- 加快初始載入速度

### 資源優化

#### 檔案命名規則

```typescript
entryFileNames: 'assets/[name]-[hash].js'
chunkFileNames: 'assets/[name]-[hash].js'
assetFileNames: (assetInfo) => {
  // CSS 檔案
  if (name.endsWith('.css')) {
    return 'assets/css/[name]-[hash][extname]'
  }
  // 圖片檔案
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
    return 'assets/images/[name]-[hash][extname]'
  }
  // 字型檔案
  if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
    return 'assets/fonts/[name]-[hash][extname]'
  }
  return 'assets/[name]-[hash][extname]'
}
```

**結構**：
```
dist/
├── assets/
│   ├── css/          # CSS 檔案
│   ├── images/       # 圖片資源
│   ├── fonts/        # 字型檔案
│   └── *.js          # JavaScript 檔案
├── background/
│   └── service-worker.js
└── popup/
    └── popup.html
```

#### 資源內聯

```typescript
assetsInlineLimit: 4096  // 4KB
```

小於 4KB 的資源會被內聯為 base64，減少 HTTP 請求。

### 程式碼壓縮

#### Terser 配置（生產環境）

```typescript
terserOptions: {
  compress: {
    drop_console: true,      // 移除 console.log
    drop_debugger: true,     // 移除 debugger
    pure_funcs: ['console.log', 'console.info'],
  },
  format: {
    comments: false,         // 移除註解
  },
}
```

**效果**：
- 移除所有 console 輸出
- 移除 debugger 語句
- 移除程式碼註解
- 減少檔案大小約 20-30%

### Source Map 配置

```typescript
sourcemap: isDev ? 'inline' : false
```

- **開發環境**：inline source map（方便除錯）
- **生產環境**：不生成 source map（減少檔案大小）

### CSS 優化

```typescript
css: {
  cssCodeSplit: true,           // CSS 程式碼分割
  devSourcemap: isDev,          // 開發環境 source map
}
```

---

## 瀏覽器擴充套件配置

### Web Extension 插件設定

```typescript
webExtension({
  manifest: './src/manifest.json',
  additionalInputs: ['src/popup/popup.html'],
  disableAutoLaunch: true,
  watchFilePaths: isDev ? ['src/**/*'] : [],
  browser: env.VITE_BROWSER || 'chrome',
})
```

**參數說明**：
- `manifest` - manifest.json 路徑
- `additionalInputs` - 額外的入口檔案
- `disableAutoLaunch` - 停用自動啟動瀏覽器
- `watchFilePaths` - 監聽檔案變更（開發模式）
- `browser` - 目標瀏覽器

### Background Script 處理

Background script 會被特殊處理，輸出到 `background/service-worker.js`：

```typescript
entryFileNames: (chunkInfo) => {
  if (chunkInfo.name === 'background') {
    return 'background/service-worker.js'
  }
  return 'assets/[name]-[hash].js'
}
```

### Manifest V3 相容性

專案完全支援 Chrome Extension Manifest V3：
- Service Worker 作為背景腳本
- 正確的權限配置
- CSP (Content Security Policy) 設定

---

## 環境變數

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
// 環境變數（自動注入）
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// 自訂變數
const apiUrl = import.meta.env.VITE_API_BASE_URL

// 全域定義
console.log(__DEV__)      // 開發模式
console.log(__PROD__)     // 生產模式
console.log(__VERSION__)  // 版本號
```

---

## SCSS 配置

### 全域變數與 Mixins

所有 SCSS 檔案都會自動注入全域變數和 mixins：

```scss
@use "@/popup/styles/variables.scss" as *;
@use "@/popup/styles/mixins.scss" as *;
```

### 使用範例

```scss
.my-component {
  // 使用變數
  padding: $spacing-md;
  border-radius: $border-radius-lg;
  
  // 使用 mixin
  @include flex-center;
  @include card;
  
  // 響應式
  @include respond-to('md') {
    padding: $spacing-lg;
  }
}
```

### 可用變數

詳見 `src/popup/styles/variables.scss`：
- 顏色變數
- 間距變數
- 字體變數
- 動畫變數
- Z-index 層級

### 可用 Mixins

詳見 `src/popup/styles/mixins.scss`：
- Flexbox mixins
- 按鈕 mixins
- 卡片 mixins
- 輸入框 mixins
- 動畫 mixins
- 響應式 mixins

---

## 路徑別名

專案配置了以下路徑別名：

```typescript
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
// 使用別名
import { useAuth } from '@composables'
import { cryptoManager } from '@utils/crypto'
import type { LoginCredentials } from '@types'
import Header from '@components/common/Header.vue'

// 等同於
import { useAuth } from '../../composables'
import { cryptoManager } from '../../utils/crypto'
import type { LoginCredentials } from '../../types'
import Header from '../components/common/Header.vue'
```

---

## 建置指令

### 開發

```bash
# 啟動開發伺服器（HMR）
npm run dev

# 建置開發版本（包含 source map）
npm run build:dev
```

### 生產

```bash
# 建置生產版本（優化、壓縮）
npm run build

# 清除並重新建置
npm run rebuild

# 分析 bundle 大小
npm run analyze
```

### 預覽

```bash
# 預覽建置結果
npm run preview
```

---

## 效能優化建議

### 1. 程式碼分割

- ✅ 已實作自動程式碼分割
- ✅ 第三方庫獨立打包
- ✅ 按需載入元件

### 2. 資源優化

- ✅ 圖片壓縮（建議使用 WebP 格式）
- ✅ 字型子集化
- ✅ CSS 壓縮與去重

### 3. 快取策略

- ✅ 檔案名稱包含 hash（利用瀏覽器快取）
- ✅ Vendor chunks 分離（減少重複下載）

### 4. 建置時間優化

- ✅ 使用 esbuild 進行依賴預構建
- ✅ 平行處理
- ✅ 增量建置

---

## 常見問題

### Q1: 為什麼開發模式下檔案很大？

**A**: 開發模式包含 inline source map 和完整的除錯資訊。生產建置會大幅減小檔案大小。

### Q2: 如何停用 console.log 移除？

**A**: 修改 `vite.config.ts` 中的 terser 配置：

```typescript
terserOptions: {
  compress: {
    drop_console: false,  // 改為 false
  },
}
```

### Q3: 如何更改輸出目錄？

**A**: 修改 `build.outDir` 配置：

```typescript
build: {
  outDir: 'build',  // 改為其他目錄名稱
}
```

### Q4: 如何新增環境變數？

**A**: 
1. 在 `.env.development` 或 `.env.production` 新增變數（必須以 `VITE_` 開頭）
2. 在程式碼中使用 `import.meta.env.VITE_YOUR_VAR`

### Q5: 為什麼 HMR 不工作？

**A**: 檢查以下項目：
1. 確認開發伺服器正在運行
2. 檢查瀏覽器控制台是否有錯誤
3. 確認檔案在 `watchFilePaths` 範圍內
4. 嘗試重新啟動開發伺服器

---

## 更新日誌

### v2.0.0 (2025-10-08)
- ✅ 完整的 Vite 配置
- ✅ 程式碼分割策略
- ✅ SCSS 全域變數與 mixins
- ✅ 環境變數管理
- ✅ 建置優化與壓縮
- ✅ HMR 支援

---

## 參考資源

- [Vite 官方文件](https://vitejs.dev/)
- [vite-plugin-web-extension](https://github.com/aklinker1/vite-plugin-web-extension)
- [Chrome Extensions 文件](https://developer.chrome.com/docs/extensions/)
- [Vue 3 文件](https://vuejs.org/)

---

**維護者**: Augment Agent  
**最後更新**: 2025-10-08

