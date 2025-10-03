# 🚀 自動重新登入功能 - 快速開始

## 📦 安裝與測試

### 步驟 1：載入擴充套件

1. 開啟 Edge 瀏覽器
2. 前往 `edge://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入解壓縮」
5. 選擇專案資料夾

### 步驟 2：測試加密功能（可選）

1. 在瀏覽器中開啟 `test-crypto.html`
2. 執行所有測試項目
3. 確認所有測試通過

### 步驟 3：測試自動重新登入

#### 方法 A：快速測試（推薦）

1. **登入並勾選「記住登入資訊」**
   ```
   帳號：gigabyte\your.name
   密碼：your_password
   ☑ 記住登入資訊
   ```

2. **開啟 DevTools**
   - 按 `F12` 或右鍵 → 檢查

3. **修改登入時間**
   ```javascript
   // 在 Console 中執行
   chrome.storage.local.get(['lastLoginTime'], (data) => {
       const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
       chrome.storage.local.set({ lastLoginTime: eightHoursAgo }, () => {
           console.log('已將登入時間設為 8 小時前');
       });
   });
   ```

4. **重新開啟 Popup**
   - 關閉 Popup
   - 再次點擊擴充套件圖示

5. **預期結果**
   - Console 顯示：`嘗試自動重新登入...`
   - Console 顯示：`自動重新登入成功`
   - 自動顯示出勤資料（不需要手動登入）

#### 方法 B：完整測試

1. **登入並勾選「記住登入資訊」**

2. **檢查儲存的資料**
   ```javascript
   // 在 Console 中執行
   chrome.storage.local.get(null, (data) => {
       console.log('儲存的資料:', data);
       console.log('是否有憑證:', data.hasCredentials);
       console.log('加密密碼長度:', data.savedPassword?.length);
   });
   ```

3. **測試 API 錯誤觸發**
   ```javascript
   // 清除 serverKey 模擬 token 過期
   chrome.storage.local.set({ serverKey: null }, () => {
       console.log('已清除 serverKey');
   });
   ```

4. **點擊「重新整理」按鈕**
   - 應該自動重新登入
   - 然後重新載入資料

---

## 🔍 驗證功能

### 檢查點 1：密碼已加密儲存

```javascript
chrome.storage.local.get(['savedPassword'], (data) => {
    if (data.savedPassword) {
        console.log('✓ 密碼已加密儲存');
        console.log('加密後長度:', data.savedPassword.length);
        console.log('前 50 字元:', data.savedPassword.substring(0, 50));
    } else {
        console.log('✗ 未儲存密碼');
    }
});
```

### 檢查點 2：自動重新登入功能

```javascript
// 測試自動重新登入
window.authManager.attemptAutoRelogin().then(result => {
    console.log('自動重新登入結果:', result);
});
```

### 檢查點 3：背景腳本運作

```javascript
// 檢查背景腳本
chrome.runtime.getBackgroundPage((bg) => {
    console.log('背景腳本:', bg);
});
```

---

## 📊 監控與除錯

### Console 訊息

正常運作時應該看到：

```
✓ 加密管理器初始化成功
✓ 認證管理器初始化完成
嘗試自動重新登入...
使用儲存的憑證重新登入...
✓ 自動重新登入成功
```

錯誤時會看到：

```
✗ 無法讀取儲存的憑證: 無儲存的憑證
✗ 自動重新登入失敗: 登入失敗
```

### 檢查儲存空間

```javascript
chrome.storage.local.getBytesInUse(null, (bytes) => {
    console.log('使用空間:', bytes, 'bytes');
    console.log('約', (bytes / 1024).toFixed(2), 'KB');
});
```

### 檢查所有儲存的資料

```javascript
chrome.storage.local.get(null, (data) => {
    console.table({
        '是否登入': data.isLoggedIn,
        '有 ServerKey': !!data.serverKey,
        '有憑證': data.hasCredentials,
        '儲存帳號': data.savedAccount,
        '密碼長度': data.savedPassword?.length,
        '登入時間': new Date(data.lastLoginTime).toLocaleString()
    });
});
```

---

## 🐛 常見問題

### Q1: 自動重新登入沒有觸發

**檢查：**
```javascript
chrome.storage.local.get(['hasCredentials', 'savedAccount', 'savedPassword'], (data) => {
    console.log('hasCredentials:', data.hasCredentials);
    console.log('savedAccount:', data.savedAccount);
    console.log('savedPassword 長度:', data.savedPassword?.length);
});
```

**解決方法：**
- 確認登入時有勾選「記住登入資訊」
- 確認 `hasCredentials` 為 `true`
- 確認 `savedPassword` 有值

### Q2: 解密失敗

**錯誤訊息：**
```
✗ 解密失敗: OperationError
```

**可能原因：**
- 重新安裝了擴充套件（加密金鑰改變）
- 瀏覽器環境改變

**解決方法：**
```javascript
// 清除舊憑證並重新登入
chrome.storage.local.remove(['savedPassword', 'hasCredentials'], () => {
    console.log('已清除舊憑證，請重新登入');
});
```

### Q3: 無限重新登入迴圈

**檢查：**
```javascript
// 檢查登入時間更新
chrome.storage.local.get(['lastLoginTime'], (data) => {
    const hoursSince = (Date.now() - data.lastLoginTime) / (1000 * 60 * 60);
    console.log('距離上次登入:', hoursSince.toFixed(2), '小時');
});
```

**解決方法：**
- 確認登入成功後 `lastLoginTime` 有更新
- 檢查 API 是否正常回應

### Q4: 密碼明文出現在 Console

**檢查：**
```javascript
// 搜尋 Console 歷史記錄
// 不應該看到明文密碼
```

**如果發現：**
- 立即回報安全問題
- 檢查程式碼中的 `console.log`

---

## 🧹 清理與重置

### 清除所有儲存的資料

```javascript
chrome.storage.local.clear(() => {
    console.log('✓ 所有資料已清除');
});
```

### 只清除憑證

```javascript
chrome.storage.local.remove(['savedAccount', 'savedPassword', 'hasCredentials'], () => {
    console.log('✓ 憑證已清除');
});
```

### 重置登入狀態

```javascript
chrome.storage.local.set({
    isLoggedIn: false,
    serverKey: null,
    lastLoginTime: null
}, () => {
    console.log('✓ 登入狀態已重置');
});
```

---

## 📈 效能測試

### 測試加密速度

```javascript
async function testEncryptionSpeed() {
    const start = performance.now();
    const password = 'test_password_123';
    
    for (let i = 0; i < 100; i++) {
        const encrypted = await window.cryptoManager.encrypt(password);
        const decrypted = await window.cryptoManager.decrypt(encrypted);
    }
    
    const end = performance.now();
    console.log('100 次加密/解密耗時:', (end - start).toFixed(2), 'ms');
    console.log('平均:', ((end - start) / 100).toFixed(2), 'ms/次');
}

testEncryptionSpeed();
```

### 測試自動重新登入速度

```javascript
async function testReloginSpeed() {
    const start = performance.now();
    const result = await window.authManager.attemptAutoRelogin();
    const end = performance.now();
    
    console.log('自動重新登入耗時:', (end - start).toFixed(2), 'ms');
    console.log('結果:', result);
}

testReloginSpeed();
```

---

## 🎯 測試檢查清單

完成以下測試項目：

- [ ] 加密功能測試（test-crypto.html）
  - [ ] 基本加密/解密
  - [ ] 憑證儲存/讀取
  - [ ] 隨機性測試
  - [ ] 效能測試

- [ ] 自動重新登入測試
  - [ ] 初始化時觸發（8 小時後）
  - [ ] API 錯誤觸發（401）
  - [ ] 背景檢查觸發（7.5 小時後）

- [ ] 邊界情況測試
  - [ ] 無憑證時的行為
  - [ ] 錯誤憑證時的行為
  - [ ] 網路錯誤時的行為

- [ ] 安全性測試
  - [ ] 密碼不以明文顯示
  - [ ] 加密結果每次不同
  - [ ] 無法跨裝置解密

- [ ] 使用者體驗測試
  - [ ] 自動重新登入時有提示
  - [ ] 失敗時有錯誤訊息
  - [ ] 不影響正常使用流程

---

## 📞 需要協助？

### 查看詳細文件

- `AUTO_RELOGIN_FEATURE.md` - 完整功能說明
- `CHANGELOG_AUTO_RELOGIN.md` - 變更日誌

### 除錯技巧

1. **開啟 Verbose 日誌**
   ```javascript
   localStorage.setItem('debug', 'true');
   ```

2. **監控 Storage 變化**
   ```javascript
   chrome.storage.onChanged.addListener((changes, area) => {
       console.log('Storage 變化:', changes);
   });
   ```

3. **檢查背景腳本**
   - 前往 `edge://extensions/`
   - 找到擴充套件
   - 點擊「背景頁面」或「Service Worker」

---

## ✅ 完成！

如果所有測試都通過，恭喜！自動重新登入功能已成功實現。

**下一步：**
- 在實際環境中測試
- 收集使用者回饋
- 根據需求調整參數

---

**最後更新**：2025-10-03  
**版本**：1.1.0

