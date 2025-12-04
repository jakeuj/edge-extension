# 安裝依賴套件指南

## 自動安裝（推薦）

在專案根目錄執行：

```bash
npm install
```

## 手動安裝（如果自動安裝失敗）

### 核心依賴

```bash
npm install vue@^3.4.21 pinia@^2.1.7 vue-router@^4.3.0 vue-i18n@^9.10.2
```

### 開發依賴

```bash
npm install -D @types/chrome@^0.0.260 @types/node@^20.11.25 @vitejs/plugin-vue@^5.0.4 @vue/tsconfig@^0.5.1 sass@^1.71.1 typescript@^5.4.2 vite@^5.1.5 vite-plugin-web-extension@^4.1.1 vue-tsc@^2.0.6
```

## 驗證安裝

安裝完成後，執行以下命令驗證：

```bash
# 檢查 package.json
npm list --depth=0

# 執行型別檢查
npm run type-check

# 嘗試啟動開發伺服器
npm run dev
```

## 常見問題

### 問題 1: npm install 失敗

**解決方案**:
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

### 問題 2: TypeScript 編譯錯誤

**解決方案**:
```bash
# 確保 TypeScript 版本正確
npm install -D typescript@^5.4.2

# 重新執行型別檢查
npm run type-check
```

### 問題 3: Vite 啟動失敗

**解決方案**:
```bash
# 確保 Node.js 版本 >= 18
node --version

# 更新 Vite
npm install -D vite@latest
```

## 下一步

安裝完成後，請參考 `README_V2.md` 開始開發。

