import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import webExtension from 'vite-plugin-web-extension'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 暫時移除 webExtension 插件，改用手動建置流程
    // webExtension({
    //   manifest: './src/manifest.json',
    //   additionalInputs: ['src/popup/index.html'],
    //   disableAutoLaunch: false,
    //   watchFilePaths: ['src/**/*'],
    //   browser: 'chrome',
    //   skipManifestValidation: true,
    //   webExtConfig: {
    //     startUrl: ['https://geip.gigabyte.com.tw'],
    //   },
    // }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@composables': resolve(__dirname, './src/composables'),
      '@stores': resolve(__dirname, './src/stores'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
      '@locales': resolve(__dirname, './src/locales'),
    },
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 不清空目錄，保留 background.js
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name]/[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 針對 Chrome Extension 優化
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        // 移除 additionalData，改為在組件中手動導入
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'], // 靜默舊 API 警告
      },
    },
  },
  
  // 開發伺服器配置
  server: {
    port: 5173,
    strictPort: true,
    open: '/src/popup/index.html', // 自動打開 Popup 頁面
    hmr: {
      port: 5173,
    },
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
  },
})

