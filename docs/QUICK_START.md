# 🚀 快速開始指南

這是技嘉出勤時間追蹤器的快速安裝和使用指南。

## ⚡ 5分鐘快速安裝

### 步驟 1：下載專案
```bash
git clone https://github.com/jakeuj/edge-extension.git
cd edge-extension
```

### 步驟 2：安裝到 Edge
1. 開啟 Microsoft Edge
2. 前往 `edge://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入解壓縮」
5. 選擇專案資料夾
6. ✅ 安裝完成！

### 步驟 3：開始使用
1. 點擊瀏覽器工具列的擴充套件圖示
2. 輸入技嘉帳號：`gigabyte\your.username`
3. 輸入密碼
4. 點擊登入
5. 🎉 開始追蹤出勤時間！

## 📋 檢查清單

安裝前請確認：
- [ ] 您有技嘉 EIP 系統帳號
- [ ] Microsoft Edge 瀏覽器（最新版本）
- [ ] 可以存取技嘉內網

安裝後請檢查：
- [ ] 擴充套件成功載入（無錯誤訊息）
- [ ] 可以開啟 popup 視窗
- [ ] 登入功能正常
- [ ] 出勤資料正確顯示

## 🔧 常見問題快速解決

### Q: 出現圖示載入錯誤？
**A:** 這是正常現象，不影響功能使用。如需解決請參考 `fix-icons.md`

### Q: 登入失敗？
**A:** 請檢查：
- 帳號格式：`gigabyte\username`（注意反斜線）
- 密碼正確性
- 網路連線

### Q: 時間計算不正確？
**A:** 請確認：
- 上班時間格式正確
- 彈性上班制度規則理解正確

## 🎯 彈性上班制度規則

- **8:30前上班** → 17:45下班
- **8:30-9:30上班** → 工作9小時15分鐘
- **9:30後上班** → 18:45下班

## 🧪 測試功能

在 popup 視窗按 F12，在控制台執行：
```javascript
testFunctions.runAllTests()
```

## 📚 更多資訊

- 詳細說明：`README.md`
- 安裝測試：`INSTALL_TEST.md`
- 開發指南：`DEVELOPMENT.md`
- 圖示修復：`fix-icons.md`

## 🆘 需要幫助？

1. 查看 [GitHub Issues](https://github.com/jakeuj/edge-extension/issues)
2. 建立新的 Issue 描述問題
3. 提供詳細的錯誤資訊

---

**🎉 恭喜！您已經成功安裝技嘉出勤時間追蹤器！**
