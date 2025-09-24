# 🚀 部署指南

## GitHub 倉庫設定

### 1. 創建 GitHub 倉庫

1. 前往 [GitHub](https://github.com) 並登入
2. 點選右上角的 "+" → "New repository"
3. 填寫倉庫資訊：
   - Repository name: `edge-extension`
   - Description: `彈性上班下班時間計算器 - Microsoft Edge 擴充套件和網頁版`
   - 選擇 Public（公開）
   - 不要勾選 "Add a README file"（我們已經有了）

### 2. 推送程式碼到 GitHub

在專案目錄中執行：

```bash
# 設定遠端倉庫
git remote add origin https://github.com/jakeuj/edge-extension.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## GitHub Pages 設定

### 1. 啟用 GitHub Pages

1. 前往您的 GitHub 倉庫頁面
2. 點選 "Settings" 標籤
3. 在左側選單中找到 "Pages"
4. 在 "Source" 部分：
   - 選擇 "Deploy from a branch"
   - Branch: 選擇 "main"
   - Folder: 選擇 "/ (root)"
5. 點選 "Save"

### 2. 等待部署完成

- GitHub 會自動部署您的網站
- 通常需要幾分鐘時間
- 部署完成後，您會看到綠色的勾勾和網站 URL

### 3. 訪問您的網站

您的網站將在以下 URL 上線：
```
https://jakeuj.github.io/edge-extension/
```

## 自動部署

每次您推送新的 commit 到 main 分支時，GitHub Pages 會自動重新部署網站。

### 更新網站內容

```bash
# 修改檔案後
git add .
git commit -m "更新功能描述"
git push origin main
```

## 自訂域名（可選）

如果您有自己的域名，可以設定自訂域名：

1. 在 GitHub Pages 設定中，找到 "Custom domain"
2. 輸入您的域名（例如：`work-timer.example.com`）
3. 在您的 DNS 設定中，添加 CNAME 記錄指向 `jakeuj.github.io`

## 網站功能測試

部署完成後，請測試以下功能：

### 網頁版功能
- ✅ 首頁載入正常
- ✅ 時間計算功能
- ✅ 進度條顯示
- ✅ 響應式設計（手機版）

### 擴充套件下載
- ✅ 下載連結正常
- ✅ 安裝說明清楚
- ✅ 檔案完整性

## 監控和分析

### GitHub Pages 狀態

在 GitHub 倉庫的 "Actions" 標籤中可以查看部署狀態。

### 訪問統計

可以使用 Google Analytics 或其他工具來追蹤網站訪問量：

1. 在 `index.html` 的 `<head>` 部分添加追蹤代碼
2. 提交並推送更新

## 疑難排解

### 常見問題

1. **網站無法訪問**
   - 檢查 GitHub Pages 是否已啟用
   - 確認分支和資料夾設定正確
   - 等待幾分鐘讓部署完成

2. **CSS/JS 檔案無法載入**
   - 檢查檔案路徑是否正確
   - 確認檔案名稱大小寫一致

3. **功能無法正常運作**
   - 開啟瀏覽器開發者工具檢查錯誤
   - 確認所有檔案都已正確上傳

### 檢查部署狀態

```bash
# 檢查遠端倉庫狀態
git remote -v

# 檢查最新 commit
git log --oneline -5

# 檢查分支狀態
git branch -a
```

## 維護和更新

### 定期更新

1. **功能更新**：添加新功能或修復 bug
2. **文件更新**：保持 README 和說明文件最新
3. **依賴更新**：定期檢查是否有新的最佳實踐

### 版本管理

使用 Git 標籤來管理版本：

```bash
# 創建版本標籤
git tag -a v1.0.0 -m "第一個正式版本"
git push origin v1.0.0

# 查看所有標籤
git tag -l
```

### 備份

定期備份重要檔案：
- 原始碼（已在 GitHub 上）
- 設定檔案
- 使用者回饋和問題記錄

## 推廣和分享

### 社群分享

1. **README 徽章**：已添加 GitHub Pages 和授權徽章
2. **社群媒體**：分享到相關的開發者社群
3. **技術部落格**：撰寫開發心得和使用教學

### 使用者回饋

1. 啟用 GitHub Issues 收集使用者回饋
2. 定期回覆和處理問題
3. 根據回饋改進功能

---

🎉 **恭喜！** 您的彈性上班下班時間計算器現在已經成功部署到 GitHub Pages！

📱 **立即訪問**：[https://jakeuj.github.io/edge-extension/](https://jakeuj.github.io/edge-extension/)
