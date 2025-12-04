# 技嘉出勤時間追蹤器 v2.0 - Vue 3 + TypeScript 重構版

## 🎉 版本說明

這是技嘉出勤時間追蹤器的全新 2.0 版本，採用現代化技術棧完全重構：

- ✅ **Vue 3** - 使用 Composition API 和 `<script setup>` 語法
- ✅ **TypeScript** - 完整型別安全，啟用嚴格模式
- ✅ **Pinia** - 現代化狀態管理
- ✅ **Vue Router 4** - 路由管理
- ✅ **SCSS** - 強大的樣式系統
- ✅ **vue-i18n** - 國際化支援（繁體中文/英文）
- ✅ **Vite** - 極速開發體驗
- ✅ **Manifest V3** - 完全相容最新擴充套件規範

## 📦 安裝與開發

### 前置需求

- Node.js 18+ 
- npm 或 yarn
- Microsoft Edge 或 Google Chrome 瀏覽器

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

這將啟動 Vite 開發伺服器，並自動在瀏覽器中載入擴充套件。

### 建置生產版本

```bash
npm run build
```

建置產物將輸出到 `dist/` 目錄。

### 型別檢查

```bash
npm run type-check
```

## 🏗️ 專案結構

```
src/
├── popup/                 # Popup 應用
│   ├── App.vue           # 主應用組件
│   ├── main.ts           # 入口檔案
│   ├── index.html        # HTML 模板
│   └── views/            # 頁面組件
│       ├── LoginView.vue
│       ├── AttendanceView.vue
│       └── SettingsView.vue
├── background/            # Background Service Worker
│   └── index.ts
├── components/            # 共用組件
├── composables/           # Composition API 邏輯
├── stores/                # Pinia Stores
├── services/              # API 服務層
├── utils/                 # 工具函數
├── types/                 # TypeScript 型別定義
├── locales/               # i18n 語言檔
├── styles/                # SCSS 樣式
│   ├── variables.scss    # 變數定義
│   ├── mixins.scss       # Mixins
│   ├── themes.scss       # 主題系統
│   └── global.scss       # 全域樣式
└── assets/                # 靜態資源
```

## 🎨 主題系統

支援三種主題：

1. **Light** - 明亮清爽的白色主題
2. **Dark** - 護眼的深色主題
3. **Morandi** - 柔和優雅的莫蘭迪色系

主題可在設定頁面切換，並會自動儲存偏好設定。

## 🌍 國際化

支援語言：

- 繁體中文 (zh-TW) - 預設
- English (en-US)

## 🔧 技術細節

### 狀態管理

使用 Pinia 管理應用狀態：

- `authStore` - 認證狀態
- `attendanceStore` - 出勤資料
- `settingsStore` - 使用者設定
- `themeStore` - 主題管理

### 路由配置

- `/login` - 登入頁面
- `/attendance` - 出勤資訊（需認證）
- `/settings` - 設定頁面（需認證）

### API 服務

所有 API 呼叫都透過 Background Service Worker 處理，確保安全性和效能。

## 📝 開發指南

### 新增組件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>{{ count }}</div>
</template>

<style scoped lang="scss">
// 樣式
</style>
```

### 使用 Store

```typescript
import { useAuthStore } from '@stores/auth'

const authStore = useAuthStore()
await authStore.login(account, password)
```

### 使用 Composable

```typescript
import { useTimeCalculator } from '@composables/useTimeCalculator'

const { calculateExpectedClockOut } = useTimeCalculator()
const result = calculateExpectedClockOut('09:00')
```

## 🚀 部署

建置完成後，將 `dist/` 目錄打包為 ZIP 檔案，即可上傳到 Chrome Web Store 或 Edge Add-ons。

## 📄 授權

MIT License

## 👥 貢獻者

- Jake Chu - 原作者
- GigabyteMickey - UI/UX 改進

---

**注意**: 此為 v2.0 重構版本，與 v1.x 版本不相容。如需使用舊版，請切換到 `v1.x` 分支。

