# 🚀 發布指南

本文件說明如何發布技嘉出勤時間追蹤器的新版本。

## 📋 發布流程概覽

我們使用 GitHub Actions 自動化發布流程，包含以下步驟：

1. **版本標籤觸發** → GitHub Actions 自動建置
2. **自動打包** → 建立擴充套件 ZIP 檔案
3. **建立 Release** → 在 GitHub 上發布新版本
4. **更新網站** → 自動更新 GitHub Pages 下載連結

## 🛠️ 發布方法

### 方法一：使用發布腳本（推薦）

```bash
# 發布新版本
./scripts/release.sh 1.0.1 "修復登入問題"

# 或者只指定版本號
./scripts/release.sh 1.0.1
```

腳本會自動：
- ✅ 檢查 git 狀態和分支
- ✅ 更新 `manifest.json` 版本號
- ✅ 建立 git commit 和 tag
- ✅ 推送到 GitHub 觸發自動發布

### 方法二：手動建立標籤

```bash
# 1. 更新版本號
vim manifest.json  # 修改 "version" 欄位

# 2. 提交變更
git add manifest.json
git commit -m "chore: bump version to 1.0.1"

# 3. 建立標籤
git tag -a v1.0.1 -m "Release v1.0.1: 修復登入問題"

# 4. 推送到 GitHub
git push origin main
git push origin v1.0.1
```

### 方法三：GitHub 網頁手動觸發

1. 前往 [GitHub Actions](https://github.com/jakeuj/edge-extension/actions)
2. 選擇 "Release Edge Extension" 工作流程
3. 點擊 "Run workflow"
4. 輸入版本號和發布說明
5. 點擊 "Run workflow" 執行

## 📦 自動化流程詳細說明

### Release Workflow (`.github/workflows/release.yml`)

**觸發條件：**
- 推送版本標籤 (例如 `v1.0.1`)
- 手動觸發

**執行步驟：**
1. 📥 檢出程式碼
2. 🔢 解析版本號
3. 📝 更新 `manifest.json` 版本
4. 🎨 生成圖示檔案（如需要）
5. 📦 建立擴充套件 ZIP 包
6. 📋 生成發布說明
7. 🚀 建立 GitHub Release
8. 🔗 更新 `index.html` 下載連結
9. 💾 提交變更到 main 分支

### Pages Update Workflow (`.github/workflows/update-pages.yml`)

**觸發條件：**
- 新 Release 發布時
- 手動觸發

**執行步驟：**
1. 📥 獲取最新 Release 資訊
2. 🔗 更新 `index.html` 下載連結
3. ⏰ 添加更新時間戳
4. 🌐 部署到 GitHub Pages

## 📋 版本號規範

使用 [語義化版本](https://semver.org/lang/zh-TW/) 格式：`主版本.次版本.修訂版本`

- **主版本**：不相容的 API 修改
- **次版本**：向下相容的功能性新增
- **修訂版本**：向下相容的問題修正

**範例：**
- `1.0.0` → 初始版本
- `1.0.1` → 修復 bug
- `1.1.0` → 新增功能
- `2.0.0` → 重大變更

## 📝 發布說明撰寫指南

好的發布說明應該包含：

```markdown
### 🆕 新功能
- 新增自動更新檢查功能
- 支援深色模式

### 🐛 問題修復
- 修復登入時的帳號格式驗證問題
- 解決時間計算在跨日時的錯誤

### 🔧 改進
- 優化 UI 響應速度
- 改善錯誤訊息顯示

### ⚠️ 重要變更
- 需要重新登入以套用新的安全性設定
```

## 🔍 發布前檢查清單

### 程式碼品質
- [ ] 所有測試通過
- [ ] 程式碼已經過 review
- [ ] 沒有 console.log 或除錯程式碼
- [ ] 更新相關文件

### 功能測試
- [ ] 登入/登出功能正常
- [ ] 時間計算正確
- [ ] API 呼叫成功
- [ ] UI 顯示正常
- [ ] 在不同瀏覽器版本測試

### 版本管理
- [ ] 版本號符合語義化版本規範
- [ ] 更新 `manifest.json` 版本號
- [ ] 撰寫清楚的發布說明
- [ ] 檢查相依性版本

## 🚨 緊急修復發布

如需緊急修復：

```bash
# 1. 從 main 分支建立 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. 進行修復
# ... 修復程式碼 ...

# 3. 測試修復
# ... 執行測試 ...

# 4. 合併回 main
git checkout main
git merge hotfix/critical-fix

# 5. 發布修復版本
./scripts/release.sh 1.0.2 "緊急修復：解決登入問題"

# 6. 清理分支
git branch -d hotfix/critical-fix
```

## 📊 發布後檢查

發布完成後請確認：

- [ ] GitHub Release 頁面正確顯示
- [ ] ZIP 檔案可以正常下載
- [ ] GitHub Pages 網站已更新
- [ ] 下載連結指向正確版本
- [ ] 擴充套件可以正常安裝和使用

## 🔗 相關連結

- [GitHub Releases](https://github.com/jakeuj/edge-extension/releases)
- [GitHub Actions](https://github.com/jakeuj/edge-extension/actions)
- [專案網站](https://edge.jakeuj.com)
- [問題回報](https://github.com/jakeuj/edge-extension/issues)

## 🤝 貢獻者注意事項

如果您是專案貢獻者：

1. **不要直接推送到 main 分支**
2. **使用 Pull Request 流程**
3. **確保 PR 通過所有檢查**
4. **只有維護者可以建立 Release**

---

有任何問題請建立 [Issue](https://github.com/jakeuj/edge-extension/issues) 討論。
