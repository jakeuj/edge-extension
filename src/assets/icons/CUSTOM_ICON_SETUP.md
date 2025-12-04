# 🎨 自定義圖標設置指南

## 📋 概述

您已經提供了一個可愛的動漫風格圓形圖標，現在需要將它轉換為擴充套件和網頁所需的不同尺寸格式。

## 🔧 已完成的配置

### ✅ Manifest.json 更新
- 已添加 `icons` 配置
- 已添加 `action.default_icon` 配置
- 支援 16x16, 32x32, 48x48, 128x128 四種尺寸

### ✅ Index.html 更新
- 已添加 favicon 連結
- 支援多種設備的圖標顯示
- 包含 Apple Touch Icon 支援

## 📁 需要的圖標文件

請將您的動漫風格圖標轉換為以下文件：

```
icons/
├── icon16.png    # 16x16 - 瀏覽器工具列
├── icon32.png    # 32x32 - 擴充套件管理頁面
├── icon48.png    # 48x48 - 擴充套件詳細頁面  
├── icon128.png   # 128x128 - Chrome 商店和高解析度
└── favicon.ico   # 32x32 - 網頁 favicon
```

## 🛠️ 圖標生成方法

### 方法一：使用線上工具（推薦）

1. **Favicon Generator**
   - 前往：https://www.favicon-generator.org/
   - 上傳您的動漫圖標
   - 下載生成的所有尺寸

2. **RealFaviconGenerator**
   - 前往：https://realfavicongenerator.net/
   - 上傳圖片並自定義設置
   - 下載完整的 favicon 套件

### 方法二：使用本地工具

1. **使用 Photoshop/GIMP**
   - 開啟您的動漫圖標
   - 調整畫布大小為各個尺寸
   - 匯出為 PNG 格式

2. **使用 ImageMagick（命令列）**
   ```bash
   # 假設您的原圖為 anime-icon.png
   convert anime-icon.png -resize 16x16 icon16.png
   convert anime-icon.png -resize 32x32 icon32.png
   convert anime-icon.png -resize 48x48 icon48.png
   convert anime-icon.png -resize 128x128 icon128.png
   convert anime-icon.png -resize 32x32 favicon.ico
   ```

### 方法三：使用專案內建工具

1. 開啟 `tools/generate-custom-icons.html`
2. 上傳您的動漫圖標
3. 下載生成的所有尺寸
4. 將文件放到 `icons/` 資料夾

## 🎯 圖標設計建議

### ✅ 您的圖標優點
- ✅ 圓形設計，適合各種尺寸
- ✅ 色彩豐富，容易識別
- ✅ 動漫風格，有個性
- ✅ 已經是圓形，不需要額外裁切

### 🔧 優化建議
- 確保在 16x16 尺寸下仍然清晰可見
- 可以考慮為小尺寸簡化細節
- 保持圓形邊框的一致性

## 📝 替換步驟

1. **準備圖標文件**
   - 使用上述任一方法生成所需尺寸
   - 確保文件名稱正確

2. **替換現有文件**
   ```bash
   # 將您的圖標文件複製到 icons/ 資料夾
   cp your-icon-16.png icons/icon16.png
   cp your-icon-32.png icons/icon32.png
   cp your-icon-48.png icons/icon48.png
   cp your-icon-128.png icons/icon128.png
   cp your-favicon.ico icons/favicon.ico
   ```

3. **測試效果**
   - 重新載入擴充套件
   - 檢查瀏覽器工具列圖標
   - 檢查擴充套件管理頁面
   - 檢查網頁 favicon

## 🚀 自動化部署

當您提交新的圖標文件後：
- GitHub Actions 會自動打包新圖標
- 下次發布版本時會包含新圖標
- 用戶更新後會看到新的圖標

## 🎨 圖標預覽

目前使用臨時的時鐘圖標作為佔位符。
替換為您的動漫圖標後，將會在以下位置顯示：

- 🔧 瀏覽器工具列
- 📋 擴充套件管理頁面  
- 🌐 專案網站 favicon
- 📱 手機書籤圖標

## ❓ 常見問題

**Q: 圖標不顯示怎麼辦？**
A: 檢查文件路徑和名稱是否正確，清除瀏覽器快取

**Q: 圖標模糊怎麼辦？**
A: 確保使用高解析度原圖，避免放大低解析度圖片

**Q: 需要透明背景嗎？**
A: 您的圓形圖標已經很完美，建議保持原樣

---

🎉 **完成後，您的可愛動漫圖標將會出現在所有地方！**
