#!/bin/bash

# 技嘉出勤時間追蹤器 - 發布腳本
# 使用方法: ./scripts/release.sh [版本號] [發布說明]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：顯示使用說明
show_usage() {
    echo -e "${BLUE}技嘉出勤時間追蹤器 - 發布腳本${NC}"
    echo ""
    echo "使用方法:"
    echo "  $0 <版本號> [發布說明]"
    echo ""
    echo "範例:"
    echo "  $0 1.0.1 \"修復登入問題\""
    echo "  $0 1.1.0 \"新增自動更新功能\""
    echo ""
    echo "版本號格式: x.y.z (例如: 1.0.1)"
}

# 函數：驗證版本號格式
validate_version() {
    if [[ ! $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo -e "${RED}❌ 錯誤：版本號格式不正確${NC}"
        echo "版本號必須是 x.y.z 格式 (例如: 1.0.1)"
        exit 1
    fi
}

# 函數：檢查 git 狀態
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  警告：工作目錄有未提交的變更${NC}"
        echo "請先提交或暫存所有變更後再發布新版本"
        git status --short
        exit 1
    fi
}

# 函數：檢查是否在 main 分支
check_main_branch() {
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠️  警告：目前不在 main 分支 (當前: $CURRENT_BRANCH)${NC}"
        read -p "是否要切換到 main 分支？ (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout main
            git pull origin main
        else
            echo "請手動切換到 main 分支後再執行發布"
            exit 1
        fi
    fi
}

# 函數：更新版本號
update_version() {
    local version=$1
    echo -e "${BLUE}📝 更新版本號到 $version${NC}"
    
    # 更新 manifest.json
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$version\"/" manifest.json
    rm manifest.json.bak 2>/dev/null || true
    
    echo "✅ 已更新 manifest.json"
}

# 函數：建立 git tag
create_git_tag() {
    local version=$1
    local notes=$2
    local tag="v$version"
    
    echo -e "${BLUE}🏷️  建立 Git 標籤 $tag${NC}"
    
    # 檢查標籤是否已存在
    if git tag -l | grep -q "^$tag$"; then
        echo -e "${RED}❌ 錯誤：標籤 $tag 已存在${NC}"
        exit 1
    fi
    
    # 提交版本變更
    git add manifest.json
    git commit -m "chore: bump version to $version"
    
    # 建立標籤
    if [ -n "$notes" ]; then
        git tag -a "$tag" -m "Release $tag: $notes"
    else
        git tag -a "$tag" -m "Release $tag"
    fi
    
    echo "✅ 已建立標籤 $tag"
}

# 函數：推送到遠端
push_to_remote() {
    local version=$1
    local tag="v$version"
    
    echo -e "${BLUE}🚀 推送到 GitHub${NC}"
    
    # 推送 main 分支
    git push origin main
    
    # 推送標籤
    git push origin "$tag"
    
    echo "✅ 已推送到 GitHub"
}

# 函數：顯示發布資訊
show_release_info() {
    local version=$1
    local tag="v$version"
    
    echo ""
    echo -e "${GREEN}🎉 發布流程已啟動！${NC}"
    echo ""
    echo "📦 版本：$tag"
    echo "🔗 GitHub Actions：https://github.com/jakeuj/edge-extension/actions"
    echo "📄 發布頁面：https://github.com/jakeuj/edge-extension/releases"
    echo "🌐 專案網站：https://edge.jakeuj.com"
    echo ""
    echo -e "${YELLOW}⏳ GitHub Actions 正在建立發布包，請稍候...${NC}"
    echo "您可以在上方連結查看建置進度"
}

# 主程式
main() {
    # 檢查參數
    if [ $# -lt 1 ]; then
        show_usage
        exit 1
    fi
    
    local version=$1
    local release_notes=${2:-"新版本發布"}
    
    echo -e "${BLUE}🚀 開始發布流程${NC}"
    echo "版本：$version"
    echo "說明：$release_notes"
    echo ""
    
    # 驗證版本號
    validate_version "$version"
    
    # 檢查 git 狀態
    check_git_status
    
    # 檢查分支
    check_main_branch
    
    # 確認發布
    echo -e "${YELLOW}確認要發布版本 $version 嗎？${NC}"
    read -p "請輸入 'yes' 確認: " -r
    if [ "$REPLY" != "yes" ]; then
        echo "發布已取消"
        exit 0
    fi
    
    # 更新版本號
    update_version "$version"
    
    # 建立 git tag
    create_git_tag "$version" "$release_notes"
    
    # 推送到遠端
    push_to_remote "$version"
    
    # 顯示發布資訊
    show_release_info "$version"
}

# 執行主程式
main "$@"
