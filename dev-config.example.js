// 開發環境配置檔案範例
// 複製此檔案為 dev-config.js 並填入您的真實資訊

window.DEV_CONFIG = {
    // 預設登入資訊 (請填入您的真實帳號密碼)
    defaultCredentials: {
        account: 'domain\\username',        // 例如: 'gigabyte\\your.name'
        password: 'your_password_here',     // 您的密碼
        remember: true
    },

    // 模擬設定
    simulation: {
        enabled: true,
        loginDelay: 500,      // 模擬登入延遲 (毫秒)
        apiDelay: 1000,       // 模擬 API 呼叫延遲 (毫秒)
        autoLogin: true       // 是否自動登入
    },

    // API 端點 (用於開發測試)
    apiEndpoints: {
        login: 'https://geip.gigabyte.com.tw/api_geip/api/auth/login',
        attendance: 'https://geip.gigabyte.com.tw/api_geip/api/main/attendance',
        historyAttendance: 'https://eipapi.gigabyte.com.tw/GEIP_API/api/getAttendanceInfo'
    },

    // 開發工具
    debug: {
        enabled: true,
        logLevel: 'info',     // 'debug', 'info', 'warn', 'error'
        showMockData: true    // 是否在控制台顯示模擬資料
    }
};
