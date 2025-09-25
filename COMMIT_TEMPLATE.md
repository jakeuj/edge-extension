# Git 提交模板

## 主要提交訊息
```
feat: 新增莫蘭迪色系主題與 UI/UX 優化

- 新增莫蘭迪色系主題選項，提供柔和優雅的視覺體驗
- 優化設定頁面導航，新增返回按鈕和智能按鈕管理
- 新增登出確認對話框，防止意外登出操作
- 重設計今日出勤資訊佈局，採用卡片化設計
- 優化出勤異常區域顯示，移除背景色提升可讀性
- 擴展主題系統，支援第三個主題選項
- 改善整體 UI/UX 體驗，提升使用者滿意度

修改文件:
- popup.html: 新增 UI 元素和主題選項
- styles/popup.css: 新增主題樣式和 UI 優化  
- scripts/popup.js: 新增功能邏輯和事件處理
- scripts/themeManager.js: 擴展主題定義

測試: 所有功能測試通過，相容性驗證完成
```

## 分步提交建議 (如果需要分開提交)

### 1. 莫蘭迪主題
```
feat(theme): 新增莫蘭迪色系主題

- 新增第三個主題選項「莫蘭迪色系」
- 採用低飽和度、柔和的色彩設計
- 完整的 CSS 變數定義和主題預覽
- 更新 themeManager.js 主題配置

Files: popup.html, styles/popup.css, scripts/themeManager.js
```

### 2. 設定頁面導航
```
feat(navigation): 優化設定頁面導航體驗

- 新增返回按鈕，改善導航流程
- 智能按鈕顯示/隱藏邏輯
- 平滑的頁面切換動畫

Files: popup.html, styles/popup.css, scripts/popup.js
```

### 3. 登出確認機制
```
feat(security): 新增登出確認對話框

- 防止意外登出操作
- 自定義對話框設計，保持風格一致
- 支援主題系統和響應式設計

Files: popup.html, styles/popup.css, scripts/popup.js
```

### 4. UI 佈局優化
```
feat(ui): 重設計今日出勤資訊佈局

- 分離基本資訊和預計時間資訊
- 卡片化設計提升視覺層次
- 優化間距和互動效果
- 修復 highlight 樣式問題

Files: popup.html, styles/popup.css
```

### 5. 異常區域優化
```
feat(ui): 優化出勤異常區域顯示

- 移除背景色，提升可讀性
- 優化間距設計
- 確保主題相容性

Files: styles/popup.css
```

## PR 標籤建議
- `enhancement` - 功能增強
- `ui/ux` - 使用者介面/體驗改進
- `theme` - 主題相關
- `design` - 設計改進

## 審核者建議
- @project-maintainer - 專案維護者
- @ui-designer - UI 設計師 (如果有)
- @frontend-lead - 前端負責人 (如果有)

## 里程碑
- v2.1.0 - UI/UX 改進版本

## 相關 Issue
如果有相關的 GitHub Issues，請在這裡引用：
- Closes #XX - 新增主題選項需求
- Fixes #XX - 設定頁面導航問題
- Resolves #XX - 登出確認功能請求
