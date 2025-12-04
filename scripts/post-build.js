import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 讀取 manifest.json
const manifestPath = path.join(rootDir, 'src', 'manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

// 修改 background service_worker 路徑
if (manifest.background && manifest.background.service_worker) {
  manifest.background.service_worker = manifest.background.service_worker.replace('.ts', '.js')
}

// 寫入 dist 目錄
const distManifestPath = path.join(rootDir, 'dist', 'manifest.json')
fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2))

console.log('✓ manifest.json copied and updated')

// 複製 icons 目錄
const iconsSourceDir = path.join(rootDir, 'icons')
const iconsDistDir = path.join(rootDir, 'dist', 'icons')

if (fs.existsSync(iconsSourceDir)) {
  // 創建 dist/icons 目錄
  if (!fs.existsSync(iconsDistDir)) {
    fs.mkdirSync(iconsDistDir, { recursive: true })
  }

  // 複製所有 icon 檔案
  const iconFiles = fs.readdirSync(iconsSourceDir)
  iconFiles.forEach(file => {
    const sourcePath = path.join(iconsSourceDir, file)
    const destPath = path.join(iconsDistDir, file)
    fs.copyFileSync(sourcePath, destPath)
  })

  console.log(`✓ ${iconFiles.length} icon files copied`)
} else {
  console.log('⚠ icons directory not found, skipping...')
}

