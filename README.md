# 技嘉出勤時間追蹤器

[![GitHub release](https://img.shields.io/github/v/release/jakeuj/edge-extension?style=flat-square)](https://github.com/jakeuj/edge-extension/releases)
[![License](https://img.shields.io/github/license/jakeuj/edge-extension?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jakeuj/edge-extension?style=flat-square)](https://github.com/jakeuj/edge-extension/stargazers)
[![PayPal](https://img.shields.io/badge/PayPal-贊助-blue?style=flat-square&logo=paypal)](https://www.paypal.com/ncp/payment/PLYGLLUS2Z8VS)

一個專為技嘉員工設計的 Microsoft Edge 瀏覽器擴充套件，能夠自動追蹤您的上下班時間，並根據公司的彈性上班制度智能計算預計下班時間。

## 🌟 主要功能

- **🔐 安全登入**: 直接連接技嘉 EIP 系統，使用您的公司帳號安全登入
- **🔄 自動重新登入**: Token 過期時自動重新登入，無需手動操作 ✨ **NEW**
- **🔒 加密儲存**: 使用 AES-GCM 256-bit 加密安全儲存密碼 ✨ **NEW**
- **⏰ 智能計算**: 根據彈性上班制度自動計算預計下班時間
- **📊 即時顯示**: 即時顯示今日出勤狀況和剩餘工作時間
- **📈 歷史記錄**: 查看過去的出勤記錄和異常狀況
- **💾 記憶功能**: 可選擇記住登入資訊，方便日常使用
- **🔄 自動更新**: 定期自動更新出勤資料
- **🎨 多主題支援**: 支援白色主題、黑夜模式和莫蘭迪色系

## 📋 彈性上班制度規則

- **彈性上班時間**: 8:30 - 9:30
- **8:30 上班** → 17:45 下班
- **8:30-9:30 之間上班**: 固定工作 9小時15分鐘
- **9:30 上班** → 18:45 下班
- **超過 9:30 上班** → 18:45 下班

## 🚀 安裝方法

### 方法一：下載發布版本（推薦）

1. 前往 [Releases 頁面](https://github.com/jakeuj/edge-extension/releases)
2. 下載最新版本的 ZIP 檔案
3. 解壓縮到本機資料夾
4. 開啟 Microsoft Edge，前往 `edge://extensions/`
5. 開啟右上角的「開發人員模式」
6. 點擊「載入解壓縮」按鈕
7. 選擇解壓縮的資料夾
8. 擴充套件安裝完成！

### 方法二：手動安裝開發版本

1. 下載或克隆此專案到本機
2. **生成圖示檔案**（可選）：
   - 開啟 `tools/generate-icons.html` 檔案
   - 點擊「下載所有圖示」按鈕
   - 將下載的圖示檔案放到 `icons/` 資料夾中
3. 開啟 Microsoft Edge，前往 `edge://extensions/`
4. 開啟右上角的「開發人員模式」
5. 點擊「載入解壓縮」按鈕
6. 選擇專案資料夾
7. 擴充套件安裝完成！

**注意**：如果沒有生成圖示檔案，擴充套件仍可正常運作，只是會使用預設圖示。

### 方法三：從商店安裝（未來）

待擴充套件通過審核後，將可從 Microsoft Edge 附加元件商店直接安裝。

## 📖 使用說明

### 首次使用

1. 點擊瀏覽器工具列上的擴充套件圖示
2. 輸入您的技嘉帳號（格式：`gigabyte\your.username`）
3. 輸入密碼
4. 可選擇「記住登入資訊」以便下次快速登入
5. 點擊「登入」按鈕

### 日常使用

登入成功後，擴充套件會自動顯示：

- 今日日期和星期
- 上班打卡時間
- 下班打卡時間（如已打卡）
- 根據彈性制度計算的預計下班時間
- 剩餘工作時間或超時時間

## 🛠️ 技術架構

### 檔案結構

```
edge-extension/
├── manifest.json          # 擴充套件配置檔
├── popup.html             # 主要介面
├── background.js          # 背景服務工作者
├── index.html             # GitHub Pages 首頁
├── styles/
│   └── popup.css          # 樣式檔案
├── scripts/
│   ├── popup.js           # 主要邏輯
│   ├── auth.js            # 認證管理
│   ├── api.js             # API 呼叫
│   ├── timeCalculator.js  # 時間計算
│   └── storage.js         # 資料儲存
└── icons/                 # 圖示檔案
```

### 主要模組

- **AuthManager**: 處理登入、登出和認證狀態管理
- **ApiManager**: 處理與技嘉 EIP 系統的 API 通訊
- **TimeCalculator**: 實作彈性上班制度的時間計算邏輯
- **StorageManager**: 管理 Chrome Storage API 的資料儲存
- **PopupManager**: 整合所有功能並處理使用者介面

## 🔒 安全性

- 登入資訊安全儲存在本機，不會傳送到第三方伺服器
- 使用 HTTPS 加密連線與技嘉 EIP 系統通訊
- serverKey 有時效性，過期後需要重新登入
- 支援自動登出機制，確保帳號安全

## ⚠️ 注意事項

- 此擴充套件僅供技嘉員工使用
- 需要有效的技嘉 EIP 系統帳號
- 帳號格式必須包含域名：`域名\使用者名稱`
- 建議定期更新擴充套件以獲得最新功能

## 🐛 問題回報

如果您遇到任何問題或有功能建議，請：

1. 前往 [GitHub Issues](https://github.com/jakeuj/edge-extension/issues)
2. 詳細描述問題或建議
3. 提供相關的錯誤訊息或截圖

## 📄 授權條款

本專案採用 MIT 授權條款。詳細內容請參閱 [LICENSE](LICENSE) 檔案。

## � 開發貢獻者

- **Jake Chu** ([@jakeuj](https://github.com/jakeuj)) - 🚀 專案創建者 & 主要開發者
- **GigabyteMickey** ([@GigabyteMickey](https://github.com/GigabyteMickey)) - 🎨 UI/UX 改進專家
- 專案網站: [edge.jakeuj.com](https://edge.jakeuj.com)

## ☕ 支持專案開發

如果這個工具對您有幫助，歡迎請開發者喝杯咖啡！您的支持是我們持續改進的動力 💪

[![PayPal](https://img.shields.io/badge/PayPal-贊助-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/ncp/payment/PLYGLLUS2Z8VS)

**💝 任何金額都是對我們最大的鼓勵！**

您的贊助將幫助我們：
- 🔧 持續改進和修復功能
- ✨ 開發新功能和特色
- 📚 維護文檔和使用指南
- 🛡️ 確保安全性和穩定性

## 📚 文檔

### 自動重新登入功能文檔

- 📖 [總覽文件](docs/README_AUTO_RELOGIN.md) - 功能介紹與快速導覽
- 🚀 [快速開始](docs/QUICK_START_AUTO_RELOGIN.md) - 安裝與測試步驟
- 📋 [快速參考](docs/QUICK_REFERENCE.md) - 常用指令與 API
- 📘 [完整說明](docs/AUTO_RELOGIN_FEATURE.md) - 詳細設計與實作
- 📊 [實作總結](docs/IMPLEMENTATION_SUMMARY.md) - 技術規格與效能分析
- 📝 [變更日誌](docs/CHANGELOG_AUTO_RELOGIN.md) - 詳細變更記錄

### 其他文檔

- 📑 [文檔索引](docs/INDEX.md) - 完整文檔導覽
- 🛠️ [開發指南](docs/DEVELOPMENT.md) - 開發相關文檔
- 📦 [發布說明](docs/RELEASE.md) - 版本發布資訊

## 🔄 版本歷史

### v1.1.0 (2025-10-03) ✨ **NEW**
- ✅ 新增自動重新登入功能
- ✅ 使用 AES-GCM 256-bit 加密儲存密碼
- ✅ 三種自動重新登入觸發機制
- ✅ 智能 API 錯誤處理與重試
- ✅ 完整的測試工具和文檔

### v1.0.0 (2024-09-24)
- 初始版本發布
- 實作基本登入功能
- 實作彈性上班時間計算
- 實作出勤資料顯示
- 實作自動更新機制

---

**免責聲明**: 此擴充套件為非官方工具，僅供個人使用。使用前請確保符合公司相關政策。
