// 開發環境配置檔案
// 此檔案包含開發時使用的預設值和模擬資料

window.DEV_CONFIG = {
    // 預設登入資訊 (請在本地設定真實帳號密碼)
    defaultCredentials: {
        account: 'domain\\username',
        password: 'your_password_here',
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

// 開發環境檢測
window.isDevelopment = function() {
    return typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage;
};

// 開發環境日誌
window.devLog = function(level, message, data = null) {
    if (!window.DEV_CONFIG.debug.enabled) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(window.DEV_CONFIG.debug.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [DEV-${level.toUpperCase()}]`;
        
        if (data) {
            console[level](prefix, message, data);
        } else {
            console[level](prefix, message);
        }
    }
};

// 自動填入預設值的輔助函數
window.fillDefaultCredentials = function() {
    if (!window.isDevelopment()) return;
    
    const accountInput = document.getElementById('account');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    
    if (accountInput && !accountInput.value) {
        accountInput.value = window.DEV_CONFIG.defaultCredentials.account;
        window.devLog('info', '已填入預設帳號');
    }
    
    if (passwordInput && !passwordInput.value) {
        passwordInput.value = window.DEV_CONFIG.defaultCredentials.password;
        window.devLog('info', '已填入預設密碼');
    }
    
    if (rememberCheckbox) {
        rememberCheckbox.checked = window.DEV_CONFIG.defaultCredentials.remember;
    }
};

// 自動登入功能
window.autoLogin = async function() {
    if (!window.isDevelopment() || !window.DEV_CONFIG.simulation.autoLogin) return;
    
    // 等待頁面完全載入
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const loginForm = document.getElementById('loginForm');
    const loginSection = document.getElementById('loginSection');
    
    // 檢查是否在登入頁面
    if (loginForm && loginSection && loginSection.style.display !== 'none') {
        window.devLog('info', '開始自動登入流程');
        
        // 填入預設值
        window.fillDefaultCredentials();
        
        // 等待一下再提交
        setTimeout(() => {
            const event = new Event('submit', { bubbles: true, cancelable: true });
            loginForm.dispatchEvent(event);
            window.devLog('info', '自動登入已觸發');
        }, 500);
    }
};

// 開發環境初始化
window.initDevelopmentMode = function() {
    if (!window.isDevelopment()) return;
    
    window.devLog('info', '開發模式已啟用');
    window.devLog('info', '預設帳號:', window.DEV_CONFIG.defaultCredentials.account);
    
    // 監聽帳號輸入框的焦點事件，自動填入預設值
    document.addEventListener('DOMContentLoaded', () => {
        const accountInput = document.getElementById('account');
        if (accountInput) {
            accountInput.addEventListener('focus', window.fillDefaultCredentials);
        }
        
        // 如果啟用自動登入，則執行自動登入
        if (window.DEV_CONFIG.simulation.autoLogin) {
            window.autoLogin();
        }
    });
    
    // 添加開發工具到全域
    window.devTools = {
        fillCredentials: window.fillDefaultCredentials,
        autoLogin: window.autoLogin,
        config: window.DEV_CONFIG,
        log: window.devLog
    };
    
    window.devLog('info', '開發工具已載入，可使用 window.devTools 存取');
};

// 立即初始化開發模式
window.initDevelopmentMode();
