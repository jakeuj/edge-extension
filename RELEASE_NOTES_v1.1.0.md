# 技嘉出勤時間追蹤器 v1.1.0

## 🎉 版本資訊

**版本號**：v1.1.0  
**發布日期**：2025-10-03  
**類型**：功能更新  
**重要性**：⭐⭐⭐⭐ 重要更新

---

## ✨ 主要新功能

### 🔄 自動重新登入功能

取消原本的 8 小時自動登出機制，改為 **Token 過期時自動重新登入**。

#### 核心特點

✅ **無縫體驗** - 使用者不會因為 token 過期而被強制登出  
✅ **自動恢復** - API 錯誤時自動嘗試重新登入並重試操作  
✅ **安全儲存** - 使用 AES-GCM 256-bit 加密儲存密碼  
✅ **預防性更新** - 在 token 過期前自動更新（7.5 小時）  
✅ **三重保護** - 三種自動重新登入觸發機制  

#### 工作原理

```
使用者登入（勾選記住）
    ↓
密碼加密並儲存
    ↓
Token 即將過期（7.5 小時）
    ↓
自動重新登入
    ↓
更新 Token
    ↓
繼續正常使用
```

---

## 🔒 安全性增強

### 加密規格

| 項目 | 規格 |
|------|------|
| 加密演算法 | AES-GCM |
| 金鑰長度 | 256-bit |
| 金鑰派生 | PBKDF2 |
| 迭代次數 | 100,000 |
| 隨機化 | 每次加密使用不同的 salt 和 IV |

### 安全特性

✅ 密碼使用業界標準加密演算法  
✅ 儲存在 Chrome Storage Local，外部無法存取  
✅ 加密金鑰基於瀏覽器環境，無法跨裝置使用  
✅ 密碼不以明文記錄在任何地方  

---

## 📝 詳細變更內容

### 新增功能

- ✅ 自動重新登入機制（三種觸發方式）
- ✅ 密碼加密儲存功能
- ✅ API 錯誤自動重試
- ✅ 背景定期檢查（每小時）

### 新增檔案

- `scripts/crypto.js` - 加密工具模組
- `test-crypto.html` - 加密功能測試頁面
- `docs/README_AUTO_RELOGIN.md` - 總覽文件
- `docs/QUICK_START_AUTO_RELOGIN.md` - 快速開始指南
- `docs/QUICK_REFERENCE.md` - 快速參考卡
- `docs/AUTO_RELOGIN_FEATURE.md` - 完整功能說明
- `docs/IMPLEMENTATION_SUMMARY.md` - 實作總結
- `docs/CHANGELOG_AUTO_RELOGIN.md` - 變更日誌
- `docs/INDEX.md` - 文檔索引

### 修改檔案

- `manifest.json` - 版本號更新為 1.1.0
- `README.md` - 加入新功能說明和文檔連結
- `background.js` - 移除自動登出，新增自動重新登入
- `scripts/auth.js` - 新增自動重新登入方法
- `scripts/popup.js` - 改善錯誤處理
- `popup.html` - 引用加密模組

### 改進項目

- ✅ 改善使用者體驗（不會被強制登出）
- ✅ 改善錯誤處理（自動重試）
- ✅ 提升安全性（加密儲存）
- ✅ 完善文檔（8 個詳細文檔）

---

## 📦 安裝與升級

### 新安裝

1. 下載 `edge-extension-v1.1.0.zip`
2. 解壓縮到本機資料夾
3. 開啟 Edge，前往 `edge://extensions/`
4. 開啟「開發人員模式」
5. 點擊「載入解壓縮」
6. 選擇解壓縮的資料夾
7. 完成安裝！

### 從舊版本升級

#### 方法 1：重新安裝（推薦）

1. 備份您的設定（如果需要）
2. 移除舊版本
3. 按照新安裝步驟安裝 v1.1.0
4. 重新登入並勾選「記住登入資訊」

#### 方法 2：覆蓋更新

1. 下載 `edge-extension-v1.1.0.zip`
2. 解壓縮並覆蓋原有檔案
3. 前往 `edge://extensions/`
4. 點擊擴充套件的「重新載入」按鈕
5. 重新登入並勾選「記住登入資訊」

---

## 🚀 使用方式

### 啟用自動重新登入

1. 開啟擴充套件
2. 輸入帳號密碼
3. **勾選「記住登入資訊」** ← 重要！
4. 點擊登入

✅ 完成！之後 Token 過期時會自動重新登入。

### 停用自動重新登入

**方法 1**：登入時不勾選「記住登入資訊」

**方法 2**：清除憑證
```javascript
// 在 DevTools Console 中執行
chrome.storage.local.remove(['savedAccount', 'savedPassword', 'hasCredentials']);
```

---

## 🧪 測試建議

### 快速測試

1. 登入並勾選「記住登入資訊」
2. 開啟 DevTools (F12)
3. 在 Console 中執行：
   ```javascript
   chrome.storage.local.get(['lastLoginTime'], (data) => {
       const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
       chrome.storage.local.set({ lastLoginTime: eightHoursAgo }, () => {
           console.log('已將登入時間設為 8 小時前');
       });
   });
   ```
4. 重新開啟 Popup
5. 應該自動重新登入並顯示出勤資料

### 加密功能測試

開啟 `test-crypto.html` 執行所有測試項目。

---

## 📚 文檔

### 完整文檔

- 📖 [總覽文件](docs/README_AUTO_RELOGIN.md) - 功能介紹與快速導覽
- 🚀 [快速開始](docs/QUICK_START_AUTO_RELOGIN.md) - 安裝與測試步驟
- 📋 [快速參考](docs/QUICK_REFERENCE.md) - 常用指令與 API
- 📘 [完整說明](docs/AUTO_RELOGIN_FEATURE.md) - 詳細設計與實作
- 📊 [實作總結](docs/IMPLEMENTATION_SUMMARY.md) - 技術規格與效能分析
- 📝 [變更日誌](docs/CHANGELOG_AUTO_RELOGIN.md) - 詳細變更記錄
- 📑 [文檔索引](docs/INDEX.md) - 完整文檔導覽

---

## ⚠️ 重要注意事項

### 使用者須知

⚠️ **共用電腦**：不建議在共用電腦上使用「記住登入資訊」功能  
⚠️ **重新安裝**：重新安裝擴充套件後需要重新登入  
⚠️ **跨裝置**：加密密碼無法跨裝置同步  

### 安全性說明

✅ 密碼使用 AES-GCM 256-bit 加密  
✅ 儲存在 Chrome Storage Local，外部無法存取  
✅ 加密金鑰基於瀏覽器環境  

---

## 🐛 已知問題

目前沒有已知的重大問題。

如發現問題，請回報至 [GitHub Issues](https://github.com/jakeuj/edge-extension/issues)。

---

## 🔄 相容性

- **Edge 版本**：支援 Manifest V3 的所有版本
- **作業系統**：Windows, macOS, Linux
- **向下相容**：完全相容舊版本的所有功能

---

## 📊 效能影響

| 項目 | 影響 |
|------|------|
| 初始化時間 | +50-100 ms（極小） |
| 記憶體使用 | +1 MB（可忽略） |
| 儲存空間 | +250 bytes（可忽略） |
| CPU 使用 | 可忽略不計 |

---

## 🎯 未來計劃

### v1.2.0（短期）
- 加入使用者設定選項
- 提供手動清除憑證按鈕
- 改善錯誤訊息

### v1.3.0（中期）
- 縮短背景檢查間隔
- 加入憑證過期時間設定
- 顯示上次自動重新登入時間

---

## 💬 回饋與支援

### 回報問題
[GitHub Issues](https://github.com/jakeuj/edge-extension/issues)

### 功能建議
歡迎在 GitHub Issues 提出建議

### 文檔
完整文檔請參考 `docs/` 資料夾

---

## 🙏 致謝

感謝所有使用者的回饋和支援！

---

## 📄 授權

本專案遵循原專案的授權條款。

---

**開發團隊**  
**發布日期**：2025-10-03  
**版本**：v1.1.0

