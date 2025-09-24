# 🚀 GitHub 快速設定指南

## 📋 準備工作

在開始之前，請確保您已經：
- ✅ 擁有 GitHub 帳號
- ✅ 安裝了 Git
- ✅ 已經移除所有敏感資訊

## 🔧 步驟一：創建 GitHub 倉庫

### 1. 登入 GitHub
前往 [github.com](https://github.com) 並登入您的帳號

### 2. 創建新倉庫
1. 點選右上角的 "+" 按鈕
2. 選擇 "New repository"
3. 填寫倉庫資訊：
   ```
   Repository name: edge-extension
   Description: 彈性上班下班時間計算器 - Microsoft Edge 擴充套件和網頁版
   Visibility: Public (公開)
   ```
4. **不要**勾選任何初始化選項（我們已經有檔案了）
5. 點選 "Create repository"

## 📤 步驟二：推送程式碼

在您的專案目錄中執行以下命令：

```bash
# 1. 設定遠端倉庫（替換 YOUR_USERNAME 為您的 GitHub 使用者名稱）
git remote add origin https://github.com/YOUR_USERNAME/edge-extension.git

# 2. 確認分支名稱
git branch -M main

# 3. 推送到 GitHub
git push -u origin main
```

### 如果遇到認證問題：

#### 使用 Personal Access Token（推薦）
1. 前往 GitHub Settings > Developer settings > Personal access tokens
2. 點選 "Generate new token (classic)"
3. 選擇適當的權限（至少需要 `repo` 權限）
4. 複製生成的 token
5. 在推送時使用 token 作為密碼

#### 或使用 SSH（進階）
```bash
# 設定 SSH 遠端
git remote set-url origin git@github.com:YOUR_USERNAME/edge-extension.git
```

## 🌐 步驟三：啟用 GitHub Pages

### 1. 前往倉庫設定
1. 在您的 GitHub 倉庫頁面，點選 "Settings" 標籤
2. 在左側選單中找到 "Pages"

### 2. 設定 Pages
1. 在 "Source" 部分：
   - Build and deployment: 選擇 "Deploy from a branch"
   - Branch: 選擇 "main"
   - Folder: 選擇 "/ (root)"
2. 點選 "Save"

### 3. 等待部署
- GitHub 會顯示部署進度
- 通常需要 2-5 分鐘
- 完成後會顯示您的網站 URL

## ✅ 步驟四：驗證部署

### 1. 檢查網站
您的網站將在以下 URL 上線：
```
https://YOUR_USERNAME.github.io/edge-extension/
```

### 2. 測試功能
- ✅ 首頁載入正常
- ✅ 網頁版計算器功能
- ✅ 擴充套件下載連結
- ✅ 響應式設計（手機版）

## 🔄 步驟五：後續更新

每次修改後，只需要：

```bash
# 1. 添加變更
git add .

# 2. 提交變更
git commit -m "描述您的變更"

# 3. 推送到 GitHub
git push origin main
```

GitHub Pages 會自動重新部署您的網站！

## 📊 可選：添加統計和監控

### Google Analytics（可選）
1. 創建 Google Analytics 帳號
2. 獲取追蹤代碼
3. 在 `index.html` 的 `<head>` 部分添加代碼
4. 提交並推送更新

### GitHub Insights
在您的倉庫中，可以查看：
- 訪問統計（Insights > Traffic）
- 克隆統計
- 引用來源

## 🛠️ 疑難排解

### 常見問題

**Q: 推送時要求輸入使用者名稱和密碼？**
A: GitHub 已停用密碼認證，請使用 Personal Access Token

**Q: 網站顯示 404 錯誤？**
A: 檢查 GitHub Pages 設定，確認選擇了正確的分支和資料夾

**Q: CSS 樣式沒有載入？**
A: 檢查檔案路徑，確認所有檔案都已推送到 GitHub

**Q: 功能無法正常運作？**
A: 開啟瀏覽器開發者工具檢查 JavaScript 錯誤

### 檢查命令

```bash
# 檢查 Git 狀態
git status

# 檢查遠端倉庫
git remote -v

# 檢查提交歷史
git log --oneline -5

# 檢查分支
git branch -a
```

## 🎉 完成！

恭喜！您已經成功：
- ✅ 創建了 GitHub 倉庫
- ✅ 推送了程式碼
- ✅ 啟用了 GitHub Pages
- ✅ 部署了網站

您的彈性上班下班時間計算器現在可以在網路上使用了！

### 分享您的專案
- 🌐 網頁版：`https://YOUR_USERNAME.github.io/edge-extension/`
- 📦 GitHub 倉庫：`https://github.com/YOUR_USERNAME/edge-extension`
- 📱 分享到社群媒體和開發者社群

### 下一步
- 收集使用者回饋
- 持續改進功能
- 添加新特色
- 撰寫技術文章分享開發經驗

---

**需要幫助？** 請查看 [DEPLOY.md](DEPLOY.md) 獲取更詳細的部署說明，或在 GitHub Issues 中提出問題。
