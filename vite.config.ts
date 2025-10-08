import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import webExtension from 'vite-plugin-web-extension'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  return {
    // ==================== 插件配置 ====================
    plugins: [
      // Vue 3 插件
      vue({
        // Vue 編譯選項
        template: {
          compilerOptions: {
            // 自訂元素處理
            isCustomElement: (tag) => tag.startsWith('chrome-'),
          },
        },
        // 啟用 script setup 的 ref 語法糖
        script: {
          defineModel: true,
          propsDestructure: true,
        },
      }),

      // Web Extension 插件
      webExtension({
        manifest: './src/manifest.json',
        disableAutoLaunch: true,
        // 開發模式下啟用 HMR
        watchFilePaths: isDev ? ['src/**/*'] : [],
        // 瀏覽器選擇
        browser: env.VITE_BROWSER || 'chrome',
      }),

      // 複製圖示檔案插件
      {
        name: 'copy-icons',
        closeBundle() {
          const iconsDir = resolve(__dirname, 'dist/icons')
          const sourceDir = resolve(__dirname, 'icons')

          // 建立 icons 目錄
          if (!existsSync(iconsDir)) {
            mkdirSync(iconsDir, { recursive: true })
          }

          // 複製圖示檔案
          const icons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png']
          icons.forEach(icon => {
            const source = resolve(sourceDir, icon)
            const dest = resolve(iconsDir, icon)
            if (existsSync(source)) {
              copyFileSync(source, dest)
              console.log(`✓ Copied ${icon}`)
            }
          })
        },
      },
    ],

    // ==================== 路徑解析 ====================
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/popup/components'),
        '@composables': resolve(__dirname, './src/composables'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
      },
      // 擴展名解析順序
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
    },

    // ==================== 開發伺服器配置 ====================
    server: {
      port: 5173,
      strictPort: false,
      // HMR 配置
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
      // 監聽檔案變更
      watch: {
        usePolling: false,
        interval: 100,
      },
    },

    // ==================== 建置配置 ====================
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Source map 配置
      sourcemap: isDev ? 'inline' : false,
      // 最小化配置
      minify: isProd ? 'terser' : false,
      // Terser 選項
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
        format: {
          comments: false,
        },
      } : undefined,
      // 目標環境
      target: 'esnext',
      // Chunk 大小警告限制
      chunkSizeWarningLimit: 1000,
      // Rollup 選項
      rollupOptions: {
        // 外部依賴（不打包進 bundle）
        external: [],
      },
      // 資源內聯限制（小於此大小的資源會被內聯為 base64）
      assetsInlineLimit: 4096,
      // CSS 程式碼分割
      cssCodeSplit: true,
      // 報告壓縮後的大小
      reportCompressedSize: isProd,
    },

    // ==================== CSS 配置 ====================
    css: {
      // CSS 預處理器選項
      preprocessorOptions: {
        scss: {
          // 全域 SCSS 變數和 mixins（暫時註解，因為檔案可能不存在）
          // additionalData: `
          //   @use "@/popup/styles/variables.scss" as *;
          //   @use "@/popup/styles/mixins.scss" as *;
          // `,
        },
      },
      // PostCSS 配置
      postcss: {
        plugins: [],
      },
      // 開發模式下的 source map
      devSourcemap: isDev,
    },

    // ==================== 優化配置 ====================
    optimizeDeps: {
      // 預構建的依賴
      include: [
        'vue',
        'pinia',
      ],
      // 排除預構建
      exclude: [],
      // 強制預構建
      force: false,
    },

    // ==================== 環境變數配置 ====================
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
      __VERSION__: JSON.stringify(env.npm_package_version || '2.0.0'),
    },

    // ==================== 日誌級別 ====================
    logLevel: isDev ? 'info' : 'warn',

    // ==================== 清除控制台 ====================
    clearScreen: false,
  }
})

