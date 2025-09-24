// 主要 popup 腳本 - 整合所有功能並處理使用者介面

class PopupManager {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.currentAttendanceData = null;
    }

    // 初始化 popup
    async init() {
        try {
            console.log('初始化 popup...');
            
            // 等待所有模組載入
            await this.waitForModules();
            
            // 初始化認證管理器
            const isLoggedIn = await window.authManager.init();
            
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 根據登入狀態顯示對應介面
            if (isLoggedIn) {
                await this.showAttendanceSection();
                await this.loadAttendanceData();
            } else {
                await this.showLoginSection();
            }
            
            this.isInitialized = true;
            console.log('popup 初始化完成');
            
        } catch (error) {
            console.error('初始化 popup 失敗:', error);
            this.showError('初始化失敗: ' + error.message);
        }
    }

    // 等待所有模組載入
    async waitForModules() {
        const maxWait = 5000; // 最多等待 5 秒
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.authManager && window.apiManager && window.timeCalculator) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('模組載入超時');
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 登入表單
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 重新整理按鈕
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }

        // 登出按鈕
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 帳號輸入框自動完成
        const accountInput = document.getElementById('account');
        if (accountInput) {
            accountInput.addEventListener('focus', () => this.loadSavedAccount());
        }
    }

    // 處理登入
    async handleLogin(event) {
        event.preventDefault();
        
        try {
            this.showLoading(true);
            
            const account = document.getElementById('account').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // 驗證輸入
            if (!account || !password) {
                throw new Error('請輸入帳號和密碼');
            }

            // 驗證帳號格式
            const validation = window.authManager.validateAccountFormat(account);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // 執行登入
            const result = await window.authManager.login(account, password, remember);
            
            if (result.success) {
                await this.showAttendanceSection();
                await this.loadAttendanceData();
                this.showSuccess('登入成功！');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('登入錯誤:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // 處理登出
    async handleLogout() {
        try {
            this.showLoading(true);
            
            const result = await window.authManager.logout();
            
            if (result.success) {
                this.clearRefreshInterval();
                await this.showLoginSection();
                this.showSuccess('已登出');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('登出錯誤:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // 處理重新整理
    async handleRefresh() {
        try {
            this.showLoading(true);
            await this.loadAttendanceData();
            this.showSuccess('資料已更新');
        } catch (error) {
            console.error('重新整理錯誤:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // 載入出勤資料
    async loadAttendanceData() {
        try {
            const serverKey = window.authManager.getServerKey();
            if (!serverKey) {
                throw new Error('缺少認證金鑰，請重新登入');
            }

            const result = await window.apiManager.getTodayAttendance(serverKey);
            
            if (result.success) {
                this.currentAttendanceData = result.data;
                this.updateAttendanceDisplay(result.data);
                this.updateStatusIndicator(true);
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('載入出勤資料錯誤:', error);
            this.updateStatusIndicator(false);
            
            // 如果是認證錯誤，自動登出
            if (error.message.includes('認證') || error.message.includes('401')) {
                await this.handleLogout();
            } else {
                this.showError(error.message);
            }
        }
    }

    // 更新出勤資料顯示
    updateAttendanceDisplay(attendanceData) {
        try {
            const todayInfo = window.timeCalculator.getTodayInfo();
            
            // 更新日期
            this.updateElement('todayDate', `${todayInfo.dateString} (${todayInfo.weekday})`);
            
            if (attendanceData) {
                // 更新上班時間
                const clockInTime = window.apiManager.formatTime(attendanceData.punchIn);
                this.updateElement('clockInTime', clockInTime);
                
                // 更新下班時間
                const clockOutTime = window.apiManager.formatTime(attendanceData.punchOut);
                this.updateElement('clockOutTime', clockOutTime);
                
                // 計算並更新預計下班時間
                const expectedClockOut = window.timeCalculator.calculateExpectedClockOut(clockInTime);
                this.updateElement('expectedClockOut', expectedClockOut.expectedTime);
                
                // 計算並更新剩餘時間
                const remainingTime = window.timeCalculator.calculateRemainingTime(clockInTime);
                this.updateRemainingTime(remainingTime);
                
            } else {
                // 沒有出勤資料
                this.updateElement('clockInTime', '--:--');
                this.updateElement('clockOutTime', '--:--');
                this.updateElement('expectedClockOut', '--:--');
                this.updateElement('remainingTime', '--:--');
            }
            
        } catch (error) {
            console.error('更新顯示錯誤:', error);
        }
    }

    // 更新剩餘時間顯示
    updateRemainingTime(remainingTimeInfo) {
        const element = document.getElementById('remainingTime');
        if (!element) return;

        if (remainingTimeInfo.isOvertime) {
            element.textContent = `已超時 ${remainingTimeInfo.overtimeMinutes}分鐘`;
            element.style.color = '#ff6b6b';
        } else {
            element.textContent = remainingTimeInfo.remainingTime;
            element.style.color = '#51cf66';
        }
    }

    // 更新狀態指示器
    updateStatusIndicator(isConnected) {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator?.querySelector('.status-dot');
        const text = indicator?.querySelector('.status-text');
        
        if (dot && text) {
            if (isConnected) {
                dot.classList.add('connected');
                text.textContent = '已連線';
            } else {
                dot.classList.remove('connected');
                text.textContent = '未連線';
            }
        }
    }

    // 顯示登入區域
    async showLoginSection() {
        this.hideElement('attendanceSection');
        this.showElement('loginSection');
        
        // 載入儲存的帳號
        await this.loadSavedAccount();
        
        // 清空密碼欄位
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.value = '';
        }
    }

    // 顯示出勤區域
    async showAttendanceSection() {
        this.hideElement('loginSection');
        this.showElement('attendanceSection');
        
        // 開始定期更新
        this.startRefreshInterval();
    }

    // 載入儲存的帳號
    async loadSavedAccount() {
        try {
            const savedAccount = await window.authManager.getSavedAccount();
            const accountInput = document.getElementById('account');
            
            if (accountInput && savedAccount) {
                accountInput.value = savedAccount;
            }
        } catch (error) {
            console.error('載入儲存帳號錯誤:', error);
        }
    }

    // 開始定期更新
    startRefreshInterval() {
        this.clearRefreshInterval();
        
        // 每分鐘更新一次剩餘時間
        this.refreshInterval = setInterval(() => {
            if (this.currentAttendanceData) {
                this.updateAttendanceDisplay(this.currentAttendanceData);
            }
        }, 60000); // 60 秒
    }

    // 清除定期更新
    clearRefreshInterval() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // 顯示載入中
    showLoading(show) {
        if (show) {
            this.showElement('loading');
        } else {
            this.hideElement('loading');
        }
    }

    // 顯示錯誤訊息
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = errorElement?.querySelector('.error-text');
        
        if (errorElement && errorText) {
            errorText.textContent = message;
            this.showElement('errorMessage');
            
            // 5 秒後自動隱藏
            setTimeout(() => {
                this.hideElement('errorMessage');
            }, 5000);
        }
    }

    // 顯示成功訊息
    showSuccess(message) {
        console.log('成功:', message);
        // 可以在這裡添加成功訊息的顯示邏輯
    }

    // 更新元素內容
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    // 顯示元素
    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = '';
        }
    }

    // 隱藏元素
    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }
}

// 隱藏錯誤訊息的全域函數
function hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const popupManager = new PopupManager();
        await popupManager.init();
        
        // 將 popupManager 設為全域變數以便除錯
        window.popupManager = popupManager;
        
    } catch (error) {
        console.error('初始化失敗:', error);
        
        // 顯示基本錯誤訊息
        const errorElement = document.getElementById('errorMessage');
        const errorText = errorElement?.querySelector('.error-text');
        
        if (errorElement && errorText) {
            errorText.textContent = '初始化失敗: ' + error.message;
            errorElement.style.display = '';
        }
    }
});

// 當 popup 關閉時清理資源
window.addEventListener('beforeunload', () => {
    if (window.popupManager) {
        window.popupManager.clearRefreshInterval();
    }
});
