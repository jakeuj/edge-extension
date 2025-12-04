import { defineConfig } from 'vite'
import { resolve } from 'path'

// Background Service Worker 專用建置配置
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 不清空目錄，因為 popup 已經建置過了
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'background',
      formats: ['es'],
      fileName: () => 'src/background/index.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'src/background/index.js',
        inlineDynamicImports: true, // 將所有依賴打包成單一檔案
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@services': resolve(__dirname, './src/services'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
})

