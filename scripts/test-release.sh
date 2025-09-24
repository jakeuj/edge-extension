#!/bin/bash

# 技嘉出勤時間追蹤器 - 發布測試腳本
# 用於測試發布流程而不實際建立 release

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 測試發布流程${NC}"
echo ""

# 檢查必要檔案
echo -e "${BLUE}📋 檢查必要檔案...${NC}"

required_files=(
    "manifest.json"
    "popup.html"
    "background.js"
    "scripts/popup.js"
    "scripts/auth.js"
    "scripts/api.js"
    "scripts/timeCalculator.js"
    "scripts/storage.js"
    "styles/popup.css"
    ".github/workflows/release.yml"
    ".github/workflows/update-pages.yml"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo -e "${RED}❌ 缺少必要檔案，無法進行發布${NC}"
    exit 1
fi

echo ""

# 檢查 manifest.json 格式
echo -e "${BLUE}🔍 檢查 manifest.json 格式...${NC}"

if ! jq empty manifest.json 2>/dev/null; then
    echo -e "${RED}❌ manifest.json 格式錯誤${NC}"
    exit 1
fi

current_version=$(jq -r '.version' manifest.json)
echo "✅ 當前版本：$current_version"

# 檢查版本號格式
if [[ ! $current_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${YELLOW}⚠️  版本號格式建議使用 x.y.z 格式${NC}"
fi

echo ""

# 檢查 Git 狀態
echo -e "${BLUE}📊 檢查 Git 狀態...${NC}"

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  工作目錄有未提交的變更${NC}"
    git status --short
else
    echo "✅ 工作目錄乾淨"
fi

current_branch=$(git branch --show-current)
echo "📍 當前分支：$current_branch"

if [ "$current_branch" != "main" ]; then
    echo -e "${YELLOW}⚠️  建議在 main 分支進行發布${NC}"
fi

echo ""

# 檢查遠端連線
echo -e "${BLUE}🌐 檢查遠端連線...${NC}"

if git remote get-url origin >/dev/null 2>&1; then
    remote_url=$(git remote get-url origin)
    echo "✅ 遠端倉庫：$remote_url"
    
    if [[ $remote_url == *"jakeuj/edge-extension"* ]]; then
        echo "✅ 遠端倉庫正確"
    else
        echo -e "${YELLOW}⚠️  遠端倉庫可能不正確${NC}"
    fi
else
    echo -e "${RED}❌ 無法連接到遠端倉庫${NC}"
    exit 1
fi

echo ""

# 模擬打包流程
echo -e "${BLUE}📦 模擬打包流程...${NC}"

# 建立臨時目錄
temp_dir=$(mktemp -d)
echo "📁 建立臨時目錄：$temp_dir"

# 複製檔案
cp manifest.json "$temp_dir/"
cp popup.html "$temp_dir/"
cp background.js "$temp_dir/"
cp -r scripts "$temp_dir/"
cp -r styles "$temp_dir/"

# 檢查圖示檔案
if [ -d "icons" ] && [ "$(ls -A icons/*.png 2>/dev/null)" ]; then
    cp -r icons "$temp_dir/"
    echo "✅ 複製圖示檔案"
else
    echo "ℹ️  沒有圖示檔案（將使用預設圖示）"
fi

# 建立 ZIP 檔案
cd "$temp_dir"
zip_file="test-package.zip"
zip -r "$zip_file" . >/dev/null 2>&1

if [ -f "$zip_file" ]; then
    zip_size=$(du -h "$zip_file" | cut -f1)
    echo "✅ 成功建立測試包：$zip_size"
else
    echo -e "${RED}❌ 建立測試包失敗${NC}"
    exit 1
fi

# 清理
cd - >/dev/null
rm -rf "$temp_dir"

echo ""

# 檢查 GitHub Actions 工作流程
echo -e "${BLUE}⚙️  檢查 GitHub Actions 工作流程...${NC}"

if [ -f ".github/workflows/release.yml" ]; then
    echo "✅ 發布工作流程存在"
    
    # 檢查工作流程語法（如果有 yamllint）
    if command -v yamllint >/dev/null 2>&1; then
        if yamllint .github/workflows/release.yml >/dev/null 2>&1; then
            echo "✅ 發布工作流程語法正確"
        else
            echo -e "${YELLOW}⚠️  發布工作流程語法可能有問題${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 發布工作流程不存在${NC}"
fi

if [ -f ".github/workflows/update-pages.yml" ]; then
    echo "✅ 頁面更新工作流程存在"
    
    if command -v yamllint >/dev/null 2>&1; then
        if yamllint .github/workflows/update-pages.yml >/dev/null 2>&1; then
            echo "✅ 頁面更新工作流程語法正確"
        else
            echo -e "${YELLOW}⚠️  頁面更新工作流程語法可能有問題${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 頁面更新工作流程不存在${NC}"
fi

echo ""

# 檢查 index.html
echo -e "${BLUE}🌐 檢查 GitHub Pages 設定...${NC}"

if [ -f "index.html" ]; then
    echo "✅ index.html 存在"
    
    # 檢查下載連結
    if grep -q "releases" index.html; then
        echo "✅ 包含 releases 連結"
    else
        echo -e "${YELLOW}⚠️  沒有找到 releases 連結${NC}"
    fi
    
    # 檢查版本資訊
    if grep -q "version" index.html; then
        echo "✅ 包含版本資訊"
    else
        echo -e "${YELLOW}⚠️  沒有找到版本資訊${NC}"
    fi
else
    echo -e "${RED}❌ index.html 不存在${NC}"
fi

echo ""

# 總結
echo -e "${GREEN}🎉 測試完成！${NC}"
echo ""
echo -e "${BLUE}📋 發布準備檢查清單：${NC}"
echo "✅ 所有必要檔案存在"
echo "✅ manifest.json 格式正確"
echo "✅ 可以成功建立擴充套件包"
echo "✅ GitHub Actions 工作流程已設定"
echo ""
echo -e "${YELLOW}💡 下一步：${NC}"
echo "1. 確保所有變更已提交"
echo "2. 執行 ./scripts/release.sh <版本號> 進行發布"
echo "3. 或手動建立版本標籤觸發自動發布"
echo ""
echo -e "${BLUE}🔗 相關連結：${NC}"
echo "• GitHub Actions: https://github.com/jakeuj/edge-extension/actions"
echo "• Releases: https://github.com/jakeuj/edge-extension/releases"
echo "• 專案網站: https://edge.jakeuj.com"
