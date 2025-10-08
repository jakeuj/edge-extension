# 建置優化檢查清單

本文件提供完整的建置優化檢查清單，確保專案達到最佳效能。

## 📋 優化檢查清單

### ✅ 已完成的優化

#### 1. Vite 配置優化
- [x] 配置程式碼分割策略
- [x] 設定資源命名規則
- [x] 配置 Terser 壓縮選項
- [x] 設定 Source Map 策略
- [x] 配置 CSS 程式碼分割
- [x] 設定資源內聯限制（4KB）
- [x] 配置路徑別名

#### 2. 開發環境優化
- [x] 配置 HMR (Hot Module Replacement)
- [x] 設定檔案監聽策略
- [x] 配置開發伺服器
- [x] 設定環境變數管理

#### 3. SCSS 優化
- [x] 建立全域變數系統
- [x] 建立可重用 Mixins
- [x] 配置自動注入
- [x] 使用現代 SCSS API

#### 4. PostCSS 優化
- [x] 配置 Autoprefixer
- [x] 配置 CSS Nano（生產環境）
- [x] 設定瀏覽器相容性

#### 5. TypeScript 優化
- [x] 嚴格模式啟用
- [x] 路徑映射配置
- [x] 型別定義完整

#### 6. Vue 3 優化
- [x] 使用 Composition API
- [x] 使用 `<script setup>` 語法
- [x] 啟用 props 解構
- [x] 啟用 defineModel

---

## 🎯 效能指標

### 建置時間目標

| 環境 | 目標時間 | 實際時間 | 狀態 |
|------|---------|---------|------|
| 開發建置 | < 5s | TBD | ⏳ |
| 生產建置 | < 30s | TBD | ⏳ |
| HMR 更新 | < 1s | TBD | ⏳ |

### 檔案大小目標

| 檔案類型 | 目標大小 | 實際大小 | 狀態 |
|---------|---------|---------|------|
| vendor-vue.js | < 150KB | TBD | ⏳ |
| vendor.js | < 100KB | TBD | ⏳ |
| popup.js | < 50KB | TBD | ⏳ |
| service-worker.js | < 30KB | TBD | ⏳ |
| CSS 總計 | < 50KB | TBD | ⏳ |

---

## 🔍 建置分析

### 執行建置分析

```bash
# 建置並分析 bundle 大小
npm run analyze
```

### 分析工具

建議使用以下工具分析建置結果：

1. **Rollup Plugin Visualizer**
   ```bash
   npm install -D rollup-plugin-visualizer
   ```

2. **Vite Bundle Analyzer**
   ```bash
   npm install -D vite-bundle-analyzer
   ```

---

## 📦 程式碼分割策略

### 當前分割方案

```
dist/
├── assets/
│   ├── vendor-vue-[hash].js      # Vue 核心（~120KB）
│   ├── vendor-pinia-[hash].js    # Pinia（~20KB）
│   ├── vendor-[hash].js          # 其他第三方庫
│   ├── composables-[hash].js     # Composables
│   ├── utils-[hash].js           # 工具函數
│   └── popup-[hash].js           # Popup 主程式
└── background/
    └── service-worker.js         # 背景腳本
```

### 優化建議

1. **延遲載入**
   - 考慮將設定頁面改為動態載入
   - 異常記錄分頁可以延遲載入

2. **Tree Shaking**
   - 確保所有 import 都是具名匯入
   - 避免使用 `import *`

3. **外部依賴**
   - 考慮將大型庫（如 Font Awesome）改為 CDN

---

## 🎨 CSS 優化

### 當前策略

- [x] CSS 程式碼分割
- [x] 移除未使用的 CSS
- [x] CSS 壓縮（生產環境）
- [x] Autoprefixer

### 進階優化

- [ ] 使用 PurgeCSS 移除未使用的樣式
- [ ] 考慮使用 CSS-in-JS（如需要）
- [ ] 優化 CSS 選擇器

---

## 🖼️ 資源優化

### 圖片優化

**建議**：
1. 使用 WebP 格式（更小的檔案大小）
2. 壓縮所有圖片（使用 TinyPNG 或類似工具）
3. 使用適當的圖片尺寸

**工具**：
```bash
# 安裝 vite-plugin-imagemin
npm install -D vite-plugin-imagemin
```

### 字型優化

**建議**：
1. 使用字型子集化（只包含需要的字符）
2. 使用 WOFF2 格式
3. 考慮使用系統字型

---

## 🚀 載入效能優化

### 關鍵渲染路徑

1. **預載入關鍵資源**
   ```html
   <link rel="preload" href="/assets/vendor-vue.js" as="script">
   ```

2. **延遲載入非關鍵資源**
   ```typescript
   // 動態載入
   const SettingsView = defineAsyncComponent(() => 
     import('./components/SettingsView.vue')
   )
   ```

3. **資源提示**
   ```html
   <link rel="dns-prefetch" href="https://eipapi.gigabyte.com.tw">
   <link rel="preconnect" href="https://geip.gigabyte.com.tw">
   ```

---

## 🔧 執行時期優化

### Vue 3 效能優化

1. **使用 v-memo**
   ```vue
   <div v-memo="[item.id]">
     <!-- 只在 item.id 改變時重新渲染 -->
   </div>
   ```

2. **使用 v-once**
   ```vue
   <div v-once>
     <!-- 只渲染一次 -->
   </div>
   ```

3. **使用 shallowRef**
   ```typescript
   import { shallowRef } from 'vue'
   const data = shallowRef(largeObject)
   ```

### 計算屬性優化

```typescript
// ✅ 好的做法
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ 避免
const filteredList = () => {
  return list.value.filter(item => item.active)
}
```

---

## 📊 監控與測試

### 效能監控

1. **Chrome DevTools**
   - Performance 面板
   - Network 面板
   - Coverage 面板

2. **Lighthouse**
   ```bash
   # 安裝 Lighthouse
   npm install -g lighthouse
   
   # 執行測試
   lighthouse http://localhost:5173
   ```

### 建置大小監控

在 CI/CD 中加入建置大小檢查：

```bash
# 檢查建置大小
du -sh dist/
du -sh dist/assets/*.js
```

---

## 🎯 優化目標

### 短期目標（1-2 週）

- [ ] 完成首次建置並測試
- [ ] 測量實際建置時間和檔案大小
- [ ] 識別效能瓶頸
- [ ] 實作基本優化

### 中期目標（1 個月）

- [ ] 實作延遲載入
- [ ] 優化圖片資源
- [ ] 實作 Service Worker 快取
- [ ] 達到目標檔案大小

### 長期目標（3 個月）

- [ ] 實作漸進式 Web App (PWA) 功能
- [ ] 優化首次載入時間
- [ ] 實作離線支援
- [ ] 達到 Lighthouse 90+ 分數

---

## 📝 最佳實踐

### 程式碼層面

1. **避免不必要的重新渲染**
   - 使用 `v-memo` 和 `v-once`
   - 合理使用 `computed` vs `watch`

2. **優化事件處理**
   - 使用事件委派
   - 適當使用 `debounce` 和 `throttle`

3. **減少 DOM 操作**
   - 批次更新
   - 使用虛擬滾動（如需要）

### 建置層面

1. **保持依賴更新**
   ```bash
   npm outdated
   npm update
   ```

2. **定期清理**
   ```bash
   npm run clean
   npm run rebuild
   ```

3. **監控 bundle 大小**
   - 設定大小警告限制
   - 定期檢查依賴大小

---

## 🔗 參考資源

### 官方文件
- [Vite 效能優化](https://vitejs.dev/guide/performance.html)
- [Vue 3 效能優化](https://vuejs.org/guide/best-practices/performance.html)
- [Chrome Extension 效能](https://developer.chrome.com/docs/extensions/mv3/performance/)

### 工具
- [Bundle Phobia](https://bundlephobia.com/) - 檢查套件大小
- [Can I Use](https://caniuse.com/) - 瀏覽器相容性
- [WebPageTest](https://www.webpagetest.org/) - 效能測試

---

## ✅ 檢查清單總結

在發布前，請確認以下項目：

- [ ] 執行生產建置無錯誤
- [ ] 檢查 bundle 大小在目標範圍內
- [ ] 測試所有功能正常運作
- [ ] 檢查 console 無錯誤或警告
- [ ] 測試 HMR 正常運作
- [ ] 驗證環境變數正確設定
- [ ] 檢查 Source Map 配置正確
- [ ] 測試在目標瀏覽器中運作
- [ ] 驗證資源正確載入
- [ ] 檢查 CSS 樣式正確套用

---

**維護者**: Augment Agent  
**最後更新**: 2025-10-08  
**版本**: 2.0.0

