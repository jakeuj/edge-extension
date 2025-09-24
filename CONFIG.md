# 🔧 設定說明

## API 整合設定

如果您想要整合自己的出勤系統 API，請按照以下步驟設定：

### 1. 修改 API 端點

在 `popup.js` 檔案中，找到以下位置並修改為您的 API 端點：

```javascript
// 登入 API
const response = await fetch('https://your-company-api.com/api/auth/login', {
    // ...
});

// 出勤查詢 API  
const response = await fetch('https://your-company-api.com/api/getAttendanceInfo', {
    // ...
});
```

### 2. 修改帳號前綴

在 `popup.html` 和 `popup.js` 中，將 `company\` 修改為您的公司域名：

```html
<!-- popup.html -->
<span class="username-prefix">your-company\</span>
```

```javascript
// popup.js
const account = `your-company\\${username}`;
```

### 3. 設定測試 ServerKey

在 `popup.js` 中，將測試用的 ServerKey 替換為您的有效 ServerKey：

```javascript
const testServerKey = 'YOUR_ACTUAL_SERVER_KEY_HERE';
```

### 4. API 回應格式

確保您的 API 回應格式符合以下結構：

#### 登入 API 回應
```json
{
  "result": {
    "serverKey": "your_server_key_here"
  },
  "statusCode": 200,
  "message": "登入成功"
}
```

#### 出勤查詢 API 回應
```json
{
  "result": [
    {
      "punchIn": "09:25",
      "punchOut": "18:40",  // 可選，如果有此欄位會優先使用
      "date": "2024-09-23"
    }
  ],
  "statusCode": 200,
  "message": "查詢成功"
}
```

## 彈性上班制度自訂

如果您的公司有不同的彈性上班制度，可以修改 `popup.js` 和 `web-app.js` 中的計算邏輯：

```javascript
// 在 calculateEndTime() 函數中修改
if (startMinutes <= 8 * 60 + 30) {
    // 8:30 或之前上班 → 修改這裡的下班時間
    endMinutes = 17 * 60 + 45;  // 17:45
} else if (startMinutes <= 9 * 60 + 30) {
    // 8:30-9:30 之間上班 → 修改工作時數
    workDuration = 9 * 60 + 15;  // 9小時15分鐘
    endMinutes = startMinutes + workDuration;
} else {
    // 9:30 之後上班 → 修改固定下班時間
    endMinutes = 18 * 60 + 45;  // 18:45
}
```

## 通知設定

### 修改通知時間

在 `background.js` 中修改通知提醒時間：

```javascript
// 修改提醒時間（分鐘）
const REMINDER_MINUTES = 15;  // 下班前 15 分鐘提醒
```

### 自訂通知訊息

```javascript
// 修改通知訊息
chrome.notifications.create({
    title: '下班提醒',
    message: '還有 15 分鐘就下班了！',  // 自訂訊息
    iconUrl: 'icons/icon48.png'
});
```

## 樣式自訂

### 修改主題色彩

在 `popup.css` 中修改主要色彩：

```css
:root {
    --primary-color: #4facfe;      /* 主要色彩 */
    --secondary-color: #00f2fe;    /* 次要色彩 */
    --success-color: #28a745;      /* 成功色彩 */
    --error-color: #dc3545;        /* 錯誤色彩 */
}
```

### 修改字體

```css
body {
    font-family: 'Your-Font', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## 開發模式

### 啟用除錯模式

在 `popup.js` 開頭加入：

```javascript
const DEBUG_MODE = true;

function debugLog(message) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', message);
    }
}
```

### 測試模式

設定測試模式可以跳過 API 呼叫：

```javascript
const TEST_MODE = true;

if (TEST_MODE) {
    // 使用模擬資料
    const mockData = {
        punchIn: "09:25",
        punchOut: "18:40"
    };
}
```

## 部署到 GitHub Pages

1. 確保 `index.html` 在根目錄
2. 推送到 GitHub
3. 在 Repository Settings > Pages 中啟用 GitHub Pages
4. 選擇 `main` 分支作為來源
5. 您的網站將在 `https://username.github.io/repository-name/` 上線

## 安全性注意事項

- 🚨 **絕對不要**將真實的 API 端點、ServerKey 或帳號密碼提交到公開倉庫
- ✅ 使用環境變數或設定檔案來管理敏感資訊
- ✅ 在 `.gitignore` 中排除包含敏感資訊的檔案
- ✅ 定期更換 API 金鑰和密碼

## 疑難排解

### 常見問題

1. **擴充套件無法載入**
   - 檢查 `manifest.json` 格式是否正確
   - 確認所有檔案路徑都存在

2. **API 呼叫失敗**
   - 檢查網路連線
   - 確認 API 端點是否正確
   - 檢查 CORS 設定

3. **時間計算錯誤**
   - 檢查時區設定
   - 確認計算邏輯是否符合需求

4. **通知不顯示**
   - 檢查瀏覽器通知權限
   - 確認 `background.js` 是否正確載入

需要更多幫助？請在 [GitHub Issues](https://github.com/jakeuj/edge-extension/issues) 中提出問題。
