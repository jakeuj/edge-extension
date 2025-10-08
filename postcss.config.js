/**
 * PostCSS 配置
 * 用於處理 CSS 的後處理器
 */

export default {
  plugins: {
    // Autoprefixer - 自動添加瀏覽器前綴
    autoprefixer: {
      overrideBrowserslist: [
        'Chrome >= 88',
        'Edge >= 88',
        'Firefox >= 78',
        'Safari >= 14',
      ],
    },
    
    // CSS Nano - 生產環境下壓縮 CSS（Vite 已內建，這裡僅作配置）
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
        }],
      },
    } : {}),
  },
}

