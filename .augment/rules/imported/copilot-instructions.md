---
type: "manual"
---

# Edge 擴充功能專案的 Copilot 指令

## 開發原則與優先級
- **完成當前需求為最高原則**：專注於實現用戶明確要求的功能，避免過度工程化
- **禁止建立測試相關檔案**：除非用戶明確要求，否則不得建立任何測試檔案、測試程式碼或測試相關的配置
- **優先實用性**：以快速交付可用功能為目標，避免不必要的抽象化或複雜化

## 專案概述
為技嘉員工開發的生產就緒 Microsoft Edge 擴充功能，用於追蹤出勤時間並計算彈性工作時間完成度。具備完整的模組化架構，包含彈出視窗 UI、背景服務工作者、主題管理系統和加密儲存功能。

## 核心架構與模組系統
- **模組化設計**：七個核心模組，各有特定職責
  - `PopupManager` (popup.js) - 主控制器和 UI 編排
  - `AuthManager` (auth.js) - 身份驗證和會話管理
  - `ApiManager` (api.js) - EIP 系統整合和資料解析
  - `TimeCalculator` (timeCalculator.js) - 彈性工作時間計算
  - `StorageManager` (storage.js) - Chrome Storage API 抽象層
  - `ThemeManager` (themeManager.js) - 主題管理和切換（支援 light、dark、morandi 三種主題）
  - `Crypto` (crypto.js) - 密碼加密和解密功能
- **背景工作者**：使用服務工作者模式，透過訊息傳遞進行 API 呼叫
- **非同步模組載入**：模組使用 `waitForModules()` 模式等待相依性

## 關鍵業務邏輯：彈性工作時間制度
```javascript
// timeCalculator.js 中的核心時間計算規則
flexStartTime: { hours: 8, minutes: 30 },   // 8:30 彈性開始時間
flexEndTime: { hours: 9, minutes: 30 },     // 9:30 彈性結束時間
standardWorkHours: 9, standardWorkMinutes: 15,  // 9小時15分鐘工作時間
earlyClockOut: { hours: 17, minutes: 45 },  // 17:45 早到下班時間
lateClockOut: { hours: 18, minutes: 45 }    // 18:45 遲到下班時間
```
- **8:30 之前上班**：工作到 17:45
- **8:30-9:30 之間上班**：工作正好 9小時15分鐘（動態計算）
- **9:30 之後上班**：工作到 18:45

## 開發工作流程
1. **擴充功能測試**：在 `edge://extensions/` 中以開發者模式載入未封裝的擴充功能
2. **API 測試**：使用 `app.http` 搭配 REST Client 擴充功能進行端點驗證
3. **熱重載**：程式碼變更後點擊擴充功能頁面的「重新載入」
4. **除錯**：在彈出視窗按 F12 進行前端除錯，檢查背景頁面的服務工作者日誌
5. **注意**：除非用戶明確要求，否則不建立任何測試檔案或測試相關程式碼

## 身份驗證與 API 整合模式
```javascript
// 網域身份驗證格式（關鍵模式）
account: "gigabyte\\username"  // 必須使用反斜線，不是正斜線

// 背景工作者 API 呼叫的訊息模式
chrome.runtime.sendMessage({
  action: 'login|getAttendance|logout',
  credentials: { account, password, remember }
});
```

## 檔案組織與職責
- **`manifest.json`**：擴充功能設定，包含 EIP 網域權限
- **`popup.html` + `styles/popup.css`**：乾淨的 UI，具有狀態指示器和表單區塊
- **`background.js`**：處理所有網路請求
- **`scripts/`**：核心 JavaScript 模組目錄
  - `popup.js` - 主控制器
  - `auth.js` - 認證管理
  - `api.js` - API 呼叫
  - `storage.js` - 資料儲存
  - `timeCalculator.js` - 時間計算
  - `themeManager.js` - 主題管理
  - `crypto.js` - 加密功能
- **`lib/`**：第三方函式庫
  - `flip.min.js` + `flip.min.css` - 翻頁時鐘動畫效果
- **`index.html`**：GitHub Pages 登陸頁面，包含完整文件
- **`tools/`**：開發工具目錄
  - `generate-icons.html` - SVG 轉 PNG 圖示產生工具
  - `generate-custom-icons.html` - 自訂圖示產生器
  - `quick-icon-converter.html` - 快速圖示轉換工具
- **`dev-config.example.js`**：開發環境配置範例檔案

## 資料流與狀態管理
1. **登入流程**：彈出視窗 → 背景工作者 → EIP 驗證 → Chrome 儲存
2. **資料重新整理**：在 PopupManager 中使用 `refreshInterval` 進行排程更新
3. **出勤解析**：從 `parseTodayAttendance()` 的部門階層中提取今日資料
4. **儲存模式**：使用 Chrome Storage Local 搭配結構化鍵值（`isLoggedIn`、`serverKey`、`attendanceData`）

## 主題管理系統
- **支援主題**：light（淺色）、dark（深色）、morandi（莫蘭迪色系）
- **主題切換**：透過 ThemeManager 模組管理主題狀態和切換
- **持久化儲存**：主題偏好設定儲存於 Chrome Storage
- **即時套用**：主題變更即時反映於 UI，無需重新載入

## 加密與安全功能
- **密碼加密**：使用 Crypto 模組對儲存的密碼進行加密
- **記住密碼**：支援安全地儲存加密後的登入憑證
- **登入狀態持久化**：使用者登入後狀態持續保持，直到使用者主動點擊登出按鈕
- **serverKey 管理**：安全管理 EIP 系統的 session key，持久化儲存不會因時間經過而失效
- **憑證儲存**：登入憑證和 serverKey 持久化儲存於 Chrome Storage，不應因時間經過而被清除

## 品質保證
- **邊界情況處理**：處理缺少打卡時間、不同時間格式、網路故障
- **驗證機制**：帳號格式驗證、serverKey 過期、API 回應驗證
- **控制台測試**：可在瀏覽器控制台執行模組測試函數
- **注意**：除非用戶明確要求，否則不建立測試檔案或測試相關程式碼

## 部署與發佈
- **GitHub Pages**：`index.html` 作為專案首頁，位於 `edge.jakeuj.com`
- **發佈流程**：GitHub 發佈，提供可下載的擴充功能套件
- **文件**：多層級文件（`README.md`、`DEVELOPMENT.md`、`QUICK_START.md`）
- **CORS 處理**：擴充功能對 `geip.gigabyte.com.tw` 和 `eipapi.gigabyte.com.tw` 的權限

## 企業整合特定需求
- **中文本地化**：所有 UI 文字使用繁體中文，日期格式包含星期名稱
- **網域需求**：強制使用 Windows 網域身份驗證（`gigabyte\\username`）
- **時區**：全程假設為台灣標準時間（UTC+8）