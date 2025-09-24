# 🔧 圖示問題快速修復指南

如果您遇到 "Couldn't load icon" 錯誤，請按照以下步驟解決：

## 🚀 方法一：快速修復（推薦）

擴充套件已經修改為不依賴圖示檔案，可以直接使用：

1. 確認您使用的是最新版本的 `manifest.json`
2. 重新載入擴充套件：
   - 前往 `edge://extensions/`
   - 找到「技嘉出勤時間追蹤器」
   - 點擊「重新載入」按鈕
3. 擴充套件應該可以正常運作（使用預設圖示）

## 🎨 方法二：生成自訂圖示

如果您想要自訂圖示，請按照以下步驟：

### 步驟 1：生成圖示檔案

1. 開啟專案中的 `tools/generate-icons.html` 檔案
2. 在瀏覽器中開啟此檔案
3. 點擊「生成圖示」按鈕查看預覽
4. 點擊「下載所有圖示」按鈕
5. 將下載的檔案重新命名並放到正確位置：
   - `icon16.png` → `icons/icon16.png`
   - `icon32.png` → `icons/icon32.png`
   - `icon48.png` → `icons/icon48.png`
   - `icon128.png` → `icons/icon128.png`

### 步驟 2：更新 manifest.json

在 `manifest.json` 檔案中的 `"action"` 區塊後面加入圖示設定：

```json
{
  "manifest_version": 3,
  "name": "技嘉出勤時間追蹤器",
  "version": "1.0.0",
  "description": "追蹤技嘉員工的上下班時間，根據彈性上班制度計算預計下班時間",
  "author": "Jake Chu",
  
  "permissions": [
    "storage",
    "activeTab",
    "https://geip.gigabyte.com.tw/*",
    "https://eipapi.gigabyte.com.tw/*"
  ],
  
  "host_permissions": [
    "https://geip.gigabyte.com.tw/*",
    "https://eipapi.gigabyte.com.tw/*"
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_title": "技嘉出勤時間追蹤器",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  "background": {
    "service_worker": "background.js"
  },
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 步驟 3：重新載入擴充套件

1. 前往 `edge://extensions/`
2. 找到「技嘉出勤時間追蹤器」
3. 點擊「重新載入」按鈕
4. 確認圖示正確顯示

## 🛠️ 方法三：使用現有圖示檔案

如果您有自己的圖示檔案，請確保：

1. **檔案格式**：PNG 格式
2. **檔案尺寸**：
   - icon16.png: 16x16 像素
   - icon32.png: 32x32 像素
   - icon48.png: 48x48 像素
   - icon128.png: 128x128 像素
3. **檔案位置**：放在 `icons/` 資料夾中
4. **檔案名稱**：必須完全符合上述名稱

## ✅ 驗證修復結果

修復完成後，請檢查：

- [ ] 擴充套件可以正常載入（沒有錯誤訊息）
- [ ] 瀏覽器工具列顯示擴充套件圖示
- [ ] 點擊圖示可以正常開啟 popup 視窗
- [ ] 所有功能正常運作

## 🆘 仍然有問題？

如果按照上述步驟仍然無法解決問題：

1. **檢查檔案路徑**：確認所有檔案都在正確的位置
2. **檢查檔案權限**：確認檔案可以被讀取
3. **清除快取**：
   - 完全關閉 Edge 瀏覽器
   - 重新開啟並載入擴充套件
4. **查看錯誤訊息**：
   - 前往 `edge://extensions/`
   - 點擊擴充套件的「詳細資料」
   - 查看是否有具體的錯誤訊息

## 📞 技術支援

如果問題持續存在，請：

1. 前往 [GitHub Issues](https://github.com/jakeuj/edge-extension/issues)
2. 建立新的 Issue
3. 提供以下資訊：
   - Edge 瀏覽器版本
   - 作業系統版本
   - 完整的錯誤訊息
   - 已嘗試的解決步驟

---

**提示**：圖示檔案是可選的，即使沒有圖示檔案，擴充套件的所有核心功能都可以正常運作。
