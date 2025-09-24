#!/bin/bash

# 生成不同尺寸的 PNG 圖示
# 需要安裝 ImageMagick 或 Inkscape

echo "正在生成擴充套件圖示..."

# 檢查是否有 convert 命令 (ImageMagick)
if command -v convert &> /dev/null; then
    echo "使用 ImageMagick 轉換圖示..."
    
    # 從 SVG 生成不同尺寸的 PNG
    convert icons/icon.svg -resize 16x16 icons/icon16.png
    convert icons/icon.svg -resize 32x32 icons/icon32.png
    convert icons/icon.svg -resize 48x48 icons/icon48.png
    convert icons/icon.svg -resize 128x128 icons/icon128.png
    
    echo "圖示生成完成！"
    
elif command -v inkscape &> /dev/null; then
    echo "使用 Inkscape 轉換圖示..."
    
    # 從 SVG 生成不同尺寸的 PNG
    inkscape icons/icon.svg --export-png=icons/icon16.png --export-width=16 --export-height=16
    inkscape icons/icon.svg --export-png=icons/icon32.png --export-width=32 --export-height=32
    inkscape icons/icon.svg --export-png=icons/icon48.png --export-width=48 --export-height=48
    inkscape icons/icon.svg --export-png=icons/icon128.png --export-width=128 --export-height=128
    
    echo "圖示生成完成！"
    
else
    echo "錯誤：需要安裝 ImageMagick 或 Inkscape 來轉換 SVG 圖示"
    echo ""
    echo "安裝方式："
    echo "macOS: brew install imagemagick"
    echo "Ubuntu: sudo apt-get install imagemagick"
    echo "Windows: 下載並安裝 ImageMagick"
    echo ""
    echo "或者手動將 icons/icon.svg 轉換為以下尺寸的 PNG 檔案："
    echo "- icon16.png (16x16)"
    echo "- icon32.png (32x32)"
    echo "- icon48.png (48x48)"
    echo "- icon128.png (128x128)"
    exit 1
fi

# 檢查生成的檔案
echo ""
echo "生成的圖示檔案："
ls -la icons/*.png 2>/dev/null || echo "沒有找到 PNG 檔案"

echo ""
echo "擴充套件準備完成！"
echo "請按照 README.md 中的說明安裝擴充套件。"
