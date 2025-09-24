# 開發指南

本文件提供技嘉出勤時間追蹤器擴充套件的開發指南。

## 🛠️ 開發環境設定

### 必要工具

- Microsoft Edge 瀏覽器（最新版本）
- 文字編輯器（推薦 VS Code）
- Git（版本控制）

### 開發模式安裝

1. 克隆專案到本機：
   ```bash
   git clone https://github.com/jakeuj/edge-extension.git
   cd edge-extension
   ```

2. 在 Edge 中載入擴充套件：
   - 開啟 `edge://extensions/`
   - 開啟「開發人員模式」
   - 點擊「載入解壓縮」
   - 選擇專案資料夾

3. 開始開發！

## 📁 專案結構

```
edge-extension/
├── manifest.json          # 擴充套件配置
├── popup.html             # 主要 UI
├── background.js          # 背景服務
├── index.html             # GitHub Pages 首頁
├── styles/
│   └── popup.css          # 樣式檔案
├── scripts/
│   ├── popup.js           # 主要邏輯
│   ├── auth.js            # 認證管理
│   ├── api.js             # API 呼叫
│   ├── timeCalculator.js  # 時間計算
│   └── storage.js         # 資料儲存
├── icons/                 # 圖示檔案
├── test/
│   └── test-data.js       # 測試資料
└── docs/                  # 文件
```

## 🧩 核心模組

### AuthManager (auth.js)
負責處理使用者認證：
- 登入/登出功能
- serverKey 管理
- 認證狀態檢查
- 帳號格式驗證

### ApiManager (api.js)
處理與技嘉 EIP 系統的通訊：
- API 呼叫封裝
- 錯誤處理
- 資料格式化
- 回應驗證

### TimeCalculator (timeCalculator.js)
實作彈性上班制度邏輯：
- 預計下班時間計算
- 剩餘時間計算
- 上班時間分析
- 工作時間規則

### StorageManager (storage.js)
管理本機資料儲存：
- Chrome Storage API 封裝
- 資料快取
- 設定管理
- 資料清理

### PopupManager (popup.js)
整合所有功能的主控制器：
- UI 狀態管理
- 事件處理
- 模組協調
- 錯誤顯示

## 🔧 開發工作流程

### 1. 修改程式碼
- 編輯相關檔案
- 遵循現有的程式碼風格

### 2. 測試變更
- 在 `edge://extensions/` 中點擊「重新載入」
- 開啟擴充套件測試功能
- 檢查瀏覽器控制台是否有錯誤

### 3. 除錯
- 使用 `console.log()` 進行除錯
- 在 popup 中按 F12 開啟開發者工具
- 檢查背景腳本的錯誤：`edge://extensions/` → 詳細資料 → 檢查檢視

### 4. 測試
- 使用 `test/test-data.js` 中的測試函數
- 在控制台執行 `testFunctions.runAllTests()`

## 🧪 測試指南

### 手動測試

1. **登入功能測試**：
   - 測試正確帳號密碼
   - 測試錯誤帳號密碼
   - 測試帳號格式驗證
   - 測試記住登入功能

2. **時間計算測試**：
   - 測試不同上班時間的計算結果
   - 驗證彈性上班制度規則
   - 檢查剩餘時間顯示

3. **API 測試**：
   - 測試 API 呼叫
   - 檢查錯誤處理
   - 驗證資料解析

### 自動化測試

在瀏覽器控制台中執行：

```javascript
// 執行所有測試
testFunctions.runAllTests();

// 個別測試
testFunctions.testTimeCalculation();
testFunctions.testApiParsing();
testFunctions.testAuth();
testFunctions.testStorage();
```

## 🐛 常見問題

### 1. 擴充套件無法載入
- 檢查 `manifest.json` 語法
- 確認所有必要檔案存在
- 查看 Edge 擴充套件頁面的錯誤訊息

### 2. API 呼叫失敗
- 檢查網路連線
- 確認 API 端點正確
- 檢查 CORS 設定

### 3. 時間計算錯誤
- 檢查時間格式解析
- 驗證計算邏輯
- 測試邊界條件

### 4. 儲存功能異常
- 檢查 Chrome Storage API 權限
- 確認資料格式正確
- 檢查儲存空間限制

## 📝 程式碼規範

### JavaScript
- 使用 ES6+ 語法
- 採用 camelCase 命名
- 適當的錯誤處理
- 清楚的註解

### CSS
- 使用 BEM 命名規範
- 響應式設計
- 適當的註解

### HTML
- 語義化標籤
- 無障礙設計
- 適當的 meta 標籤

## 🚀 部署流程

### 1. 準備發布
- 更新版本號（`manifest.json`）
- 更新 CHANGELOG
- 執行完整測試

### 2. 建立發布包
- 移除開發檔案
- 壓縮為 ZIP 檔案
- 驗證檔案完整性

### 3. 發布到商店
- 上傳到 Microsoft Edge 附加元件商店
- 填寫商店資訊
- 等待審核

## 🔄 版本控制

### Git 工作流程
- `main` 分支：穩定版本
- `develop` 分支：開發版本
- `feature/*` 分支：新功能開發
- `hotfix/*` 分支：緊急修復

### 提交訊息格式
```
type(scope): description

feat(auth): 新增記住登入功能
fix(api): 修復 API 呼叫錯誤
docs(readme): 更新安裝說明
```

## 📚 參考資源

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Microsoft Edge Extensions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 建立 Pull Request
5. 等待審核

歡迎提交 Issue 和 Pull Request！
