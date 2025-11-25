// 主要 popup 腳本 - 整合所有功能並處理使用者介面

// 翻頁時鐘初始化函數
function handleFlipClockInit(tick) {
    // 儲存翻頁時鐘實例
    window.flipClockInstance = tick;

    // 初始化顯示 HH:MM:SS 格式
    tick.value = {
        hours: 0,
        minutes: 0,
        seconds: 0
    };
}

class PopupManager {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.autoRefreshInterval = null;
        this.currentAttendanceData = null;
        this.currentTab = 'today';
        this.abnormalData = [];
        this.abnormalCount = 0;
        this.isInSettingsPage = false; // 追蹤是否在設定頁面
        this.confirmCallback = null; // 確認對話框回調函數
        this.currentSettings = null; // 當前設定
    }

    // 初始化 popup
    async init() {
        try {
            // 等待所有模組載入
            await this.waitForModules();

            // 初始化主題管理器
            await window.themeManager.init();

            // 初始化認證管理器
            const isLoggedIn = await window.authManager.init();

            // 設定事件監聽器
            this.setupEventListeners();

            // 載入使用者設定
            await this.loadInitialSettings();

            // 根據登入狀態顯示對應介面
            if (isLoggedIn) {
                await this.showAttendanceSection();
                await this.loadAllData();
                this.startAutoRefresh();
            } else {
                // 初始化時載入已儲存的密碼
                await this.showLoginSection(false, true);
            }
            
            this.isInitialized = true;
            
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
            if (window.authManager && window.apiManager && window.timeCalculator &&
                window.themeManager && window.storageManager && window.cryptoManager) {
                // 初始化加密管理器
                await window.cryptoManager.init();
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



        // 登出按鈕
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // 設定按鈕 - 實現切換功能
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettingsSection());
        }

        // 返回按鈕
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleBackFromSettings());
        }

        // 確認對話框按鈕
        const confirmCancel = document.getElementById('confirmCancel');
        const confirmOk = document.getElementById('confirmOk');
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.hideConfirmDialog());
        }
        if (confirmOk) {
            confirmOk.addEventListener('click', () => this.handleConfirmOk());
        }

        // 主題選擇器
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.handleThemeChange(e.target.value);
                }
            });
        });

        // 主題選項點擊
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const themeId = option.dataset.theme;
                const radio = option.querySelector('input[type="radio"]');
                if (radio && themeId) {
                    radio.checked = true;
                    this.handleThemeChange(themeId);
                }
            });
        });

        // 其他設定項目
        const autoRefreshToggle = document.getElementById('autoRefresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.handleAutoRefreshToggle(e.target.checked);
            });
        }

        // 異常搜尋天數設定事件
        const abnormalSearchDaysInput = document.getElementById('abnormalSearchDays');
        if (abnormalSearchDaysInput) {
            abnormalSearchDaysInput.addEventListener('change', (e) => this.handleAbnormalSearchDaysChange(e));
            abnormalSearchDaysInput.addEventListener('blur', (e) => this.handleAbnormalSearchDaysChange(e));
        }



        // 帳號輸入框自動完成
        const accountInput = document.getElementById('account');
        if (accountInput) {
            accountInput.addEventListener('focus', () => this.loadSavedAccount());
        }

        // 記住登入資訊 checkbox 變更事件
        const rememberCheckbox = document.getElementById('remember');
        if (rememberCheckbox) {
            rememberCheckbox.addEventListener('change', (e) => this.handleRememberCheckboxChange(e.target.checked));
        }

        // 選項卡切換
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 確保獲取正確的 data-tab 屬性，即使點擊的是子元素（如徽章）
                const button = e.currentTarget; // 使用 currentTarget 而不是 target
                const tabName = button.dataset.tab;
                if (tabName) {
                    this.handleTabSwitch(tabName);
                }
            });
        });

        // 移除歷史記錄相關的事件監聽器，因為異常記錄會自動載入
    }

    // 處理登入
    async handleLogin(event) {
        event.preventDefault();
        
        try {
            this.showLoading(true, '正在登入...');

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
                await this.loadAllData();
                this.startAutoRefresh();
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
        // 顯示確認對話框
        this.showConfirmDialog('確認登出', '您確定要登出嗎？', async () => {
            try {
                this.showLoading(true, '正在登出...');

                // 檢查是否有勾選「記住登入資訊」
                const rememberCheckbox = document.getElementById('remember');
                const shouldClearCredentials = rememberCheckbox ? !rememberCheckbox.checked : false;

                // 登出時，如果有勾選記住登入資訊，則不清除憑證
                const result = await window.authManager.logout(shouldClearCredentials);

                if (result.success) {
                    this.clearRefreshInterval();
                    this.clearAutoRefresh();
                    // 登出時不清除密碼欄位，讓使用者可以快速重新登入
                    await this.showLoginSection(false);
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
        });
    }



    // 並行載入所有資料
    async loadAllData() {
        try {
            this.showLoading(true, '正在載入資料...');

            // 並行執行兩個 API 呼叫
            const [attendanceResult, abnormalResult] = await Promise.allSettled([
                this.loadAttendanceData(false), // 不顯示載入遮罩
                this.loadAbnormalData(false)    // 不顯示載入遮罩
            ]);

            // 處理載入結果
            if (attendanceResult.status === 'rejected') {
                console.error('今日出勤資料載入失敗:', attendanceResult.reason);
            }
            if (abnormalResult.status === 'rejected') {
                console.error('異常記錄資料載入失敗:', abnormalResult.reason);
            }

        } catch (error) {
            console.error('載入資料錯誤:', error);
            this.showError('載入資料失敗: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    // 載入出勤資料
    async loadAttendanceData(showLoading = true) {
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

            // 如果是認證錯誤，嘗試自動重新登入
            if (error.message.includes('認證') || error.message.includes('401')) {
                const reloginResult = await window.authManager.handleApiError(error);

                if (reloginResult.success && reloginResult.shouldRetry) {
                    // 自動重新登入成功，重試載入資料
                    console.log('自動重新登入成功，重試載入資料...');
                    this.showSuccess('已自動重新登入');
                    await this.loadAttendanceData(showLoading);
                } else {
                    // 自動重新登入失敗，顯示登入畫面（保留密碼）
                    await this.showLoginSection(false);
                    this.showError('登入已過期，請重新登入');
                }
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

                // 重置翻頁時鐘
                this.resetFlipClock();
            }
            
        } catch (error) {
            console.error('更新顯示錯誤:', error);
        }
    }

    // 更新剩餘時間顯示
    updateRemainingTime(remainingTimeInfo) {
        const clockElement = document.getElementById('remainingTimeClock');
        if (!clockElement) return;

        if (remainingTimeInfo.isOvertime) {
            // 超時顯示
            clockElement.style.display = 'none';
            const container = clockElement.parentElement;
            let overtimeElement = container.querySelector('.overtime-display');
            if (!overtimeElement) {
                overtimeElement = document.createElement('span');
                overtimeElement.className = 'overtime-display';
                container.appendChild(overtimeElement);
            }
            overtimeElement.textContent = `已超時 ${remainingTimeInfo.overtimeMinutes}分鐘`;
            overtimeElement.style.color = '#ff6b6b';
            overtimeElement.style.display = 'inline';
        } else {
            // 正常剩餘時間顯示
            clockElement.style.display = 'flex';
            const overtimeElement = clockElement.parentElement.querySelector('.overtime-display');
            if (overtimeElement) {
                overtimeElement.style.display = 'none';
            }

            // 更新翻頁時鐘
            this.updateFlipClock(remainingTimeInfo.remainingTime);
        }
    }

    // 更新翻頁時鐘
    updateFlipClock(timeString) {
        if (!window.flipClockInstance) return;

        // 解析時間字符串 (格式: HH:MM)
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0]) || 0;
            const minutes = parseInt(parts[1]) || 0;

            // 轉換為總秒數（假設輸入是小時:分鐘格式）
            const totalSeconds = hours * 3600 + minutes * 60;

            // 啟動秒數倒數計時器
            this.startCountdownTimer(totalSeconds);
        }
    }

    // 啟動倒數計時器
    startCountdownTimer(totalSeconds) {
        // 清除之前的計時器
        if (window.countdownTimer) {
            clearInterval(window.countdownTimer);
        }

        // 更新顯示函數
        const updateDisplay = (remainingSeconds) => {
            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                if (window.countdownTimer) {
                    clearInterval(window.countdownTimer);
                    window.countdownTimer = null;
                }
            }

            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;

            // 更新翻頁時鐘的值 - 顯示 HH:MM:SS 格式
            if (window.flipClockInstance) {
                window.flipClockInstance.value = {
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds
                };
            }
        };

        // 立即更新一次顯示
        updateDisplay(totalSeconds);

        // 如果還有剩餘時間，啟動每秒更新的計時器
        if (totalSeconds > 0) {
            let currentSeconds = totalSeconds;
            window.countdownTimer = setInterval(() => {
                currentSeconds--;
                updateDisplay(currentSeconds);

                if (currentSeconds <= 0) {
                    clearInterval(window.countdownTimer);
                    window.countdownTimer = null;
                }
            }, 1000);
        }
    }

    // 重置翻頁時鐘
    resetFlipClock() {
        // 清除計時器
        if (window.countdownTimer) {
            clearInterval(window.countdownTimer);
            window.countdownTimer = null;
        }

        // 隱藏翻頁時鐘
        const clockElement = document.getElementById('remainingTimeClock');
        if (clockElement) {
            clockElement.style.display = 'none';
        }

        // 重置翻頁時鐘值
        if (window.flipClockInstance) {
            window.flipClockInstance.value = {
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }
    }

    // 處理選項卡切換
    handleTabSwitch(tabName) {
        if (this.currentTab === tabName) return;

        this.currentTab = tabName;

        // 更新選項卡按鈕狀態
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 更新內容區域顯示
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tabName}Content`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // 如果切換到異常記錄頁面，直接顯示已快取的資料
        if (tabName === 'abnormal') {

            // 如果已有異常資料（包括空陣列），直接顯示
            if (this.abnormalData !== null && Array.isArray(this.abnormalData)) {
                this.updateAbnormalDisplay(this.abnormalData);
            } else {
                // 如果還沒有資料，可能是首次載入還在進行中
                const abnormalList = document.getElementById('abnormalList');
                if (abnormalList) {
                    abnormalList.innerHTML = '<div class="loading-message">正在載入異常記錄...</div>';
                }
                // 如果資料還沒載入，主動載入一次
                this.loadAbnormalData(true);
            }
        }
    }

    // 載入異常記錄資料
    async loadAbnormalData(showLoading = true) {
        try {
            const serverKey = window.authManager.getServerKey();
            if (!serverKey) {
                return;
            }

            // 根據參數決定是否顯示載入遮罩
            if (showLoading && this.currentTab === 'abnormal') {
                this.showLoading(true, '正在載入異常記錄...');
            }

            const result = await window.apiManager.getAbnormalAttendance(serverKey);

            if (result.success) {
                this.abnormalData = window.apiManager.parseAbnormalAttendance(result.data);
                this.abnormalCount = this.abnormalData.length;
                this.updateAbnormalBadge();

                // 如果當前在異常記錄頁面，更新顯示
                if (this.currentTab === 'abnormal') {
                    this.updateAbnormalDisplay(this.abnormalData);
                }
            } else {
                console.error('載入異常記錄失敗:', result.error);
            }

        } catch (error) {
            console.error('載入異常記錄錯誤:', error);
        } finally {
            // 根據參數決定是否隱藏載入遮罩
            if (showLoading && this.currentTab === 'abnormal') {
                this.showLoading(false);
            }
        }
    }

    // 更新異常記錄徽章
    updateAbnormalBadge() {
        const badge = document.getElementById('abnormalBadge');
        if (!badge) return;

        if (this.abnormalCount > 0) {
            // 更新數字顯示
            const badgeCount = badge.querySelector('.badge-count');
            if (badgeCount) {
                badgeCount.textContent = this.abnormalCount;
            }
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // 更新異常記錄顯示
    updateAbnormalDisplay(abnormalData) {
        const abnormalList = document.getElementById('abnormalList');
        if (!abnormalList) return;

        // 取得當前設定的天數
        const days = this.currentSettings?.abnormalSearchDays || 45;

        if (!abnormalData || abnormalData.length === 0) {
            abnormalList.innerHTML = `<div class="no-abnormal-data">🎉 恭喜！過去${days}天內沒有出勤異常記錄</div>`;
            return;
        }

        let html = '';
        abnormalData.forEach(record => {
            // 計算請假策略
            const punchIn = window.apiManager.formatTime(record.punchIn);
            const punchOut = window.apiManager.formatTime(record.punchOut);
            const leaveStrategy = window.timeCalculator.calculateLeaveStrategy(punchIn, punchOut);

            // 建立請假策略顯示區塊
            let leaveStrategyHtml = '';
            if (leaveStrategy.needLeave) {
                // 判斷效益分析提示
                let efficiencyHint = '';
                if (leaveStrategy.wastedMinutes > 10) {
                    efficiencyHint = `
                        <div class="efficiency-warning">
                            <span class="warning-icon">🩸</span>
                            <span class="warning-text">虧 ${leaveStrategy.wastedMinutes} 分鐘</span>
                        </div>
                    `;
                } else if (leaveStrategy.wastedMinutes > 0) {
                    efficiencyHint = `
                        <div class="efficiency-ok">
                            <span class="ok-icon">✅</span>
                            <span class="ok-text">合理 (僅浪費 ${leaveStrategy.wastedMinutes} 分)</span>
                        </div>
                    `;
                }

                leaveStrategyHtml = `
                    <div class="leave-strategy">
                        <div class="leave-info">
                            <span class="leave-label">💡 建議請假:</span>
                            <span class="leave-time-range">${leaveStrategy.leaveStartTime} - ${leaveStrategy.leaveEndTime}</span>
                            <span class="leave-duration">(${leaveStrategy.leaveHours} 小時)</span>
                        </div>
                        ${efficiencyHint}
                    </div>
                `;
            }

            html += `
                <div class="abnormal-item">
                    <div class="abnormal-date">
                        <span class="date">${record.date}</span>
                        <span class="status status-abnormal">${record.status}</span>
                    </div>
                    <div class="abnormal-details">
                        <div class="time-info">
                            <span class="time-label">上班:</span>
                            <span class="time-value">${punchIn}</span>
                            <span class="time-label">下班:</span>
                            <span class="time-value">${punchOut}</span>
                        </div>
                        <div class="work-hours">
                            <span class="work-hours-label">工作時間:</span>
                            <span class="work-hours-value">${record.workHours}</span>
                        </div>
                        ${leaveStrategyHtml}
                    </div>
                </div>
            `;
        });

        abnormalList.innerHTML = html;
    }

    // 格式化日期為輸入框格式 (YYYY-MM-DD)
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
    async showLoginSection(clearPassword = false, loadSavedPassword = false) {
        this.hideElement('attendanceSection');
        this.hideElement('settingsSection');
        this.showElement('loginSection');

        // 更新狀態
        this.isInSettingsPage = false;

        // 更新 header 按鈕顯示狀態
        this.updateHeaderButtonsForMain();

        // 載入儲存的帳號
        await this.loadSavedAccount();

        // 根據參數決定密碼欄位的處理方式
        if (clearPassword) {
            // 明確要求清空密碼
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.value = '';
            }
        } else if (loadSavedPassword) {
            // 明確要求載入已儲存的密碼（僅在初始化時）
            await this.loadSavedPassword();
        }
        // 否則保持密碼欄位的當前值不變
    }

    // 顯示出勤區域
    async showAttendanceSection() {
        this.hideElement('loginSection');
        this.hideElement('settingsSection');
        this.showElement('attendanceSection');

        // 更新狀態
        this.isInSettingsPage = false;

        // 更新 header 按鈕顯示狀態
        this.updateHeaderButtonsForMain();

        // 初始化選項卡（預設顯示今日出勤）
        this.handleTabSwitch('today');

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

    // 載入儲存的密碼
    async loadSavedPassword() {
        try {
            // 檢查是否有加密管理器
            if (!window.cryptoManager) {
                console.log('加密管理器未初始化，無法載入密碼');
                return;
            }

            // 讀取儲存的憑證
            const credentialsResult = await window.cryptoManager.loadCredentials();

            if (credentialsResult.success && credentialsResult.password) {
                const passwordInput = document.getElementById('password');
                const rememberCheckbox = document.getElementById('remember');

                if (passwordInput) {
                    passwordInput.value = credentialsResult.password;
                }

                // 同時勾選「記住登入資訊」選項
                if (rememberCheckbox) {
                    rememberCheckbox.checked = true;
                }

                console.log('已載入儲存的密碼');
            } else {
                console.log('無儲存的密碼可載入');
            }
        } catch (error) {
            console.error('載入儲存密碼錯誤:', error);
        }
    }

    // 處理「記住登入資訊」checkbox 變更
    async handleRememberCheckboxChange(isChecked) {
        try {
            if (!isChecked) {
                // 取消勾選時，清除已儲存的憑證
                if (window.cryptoManager) {
                    await window.cryptoManager.clearCredentials();
                    console.log('已清除儲存的憑證');

                    // 同時清空密碼輸入框
                    const passwordInput = document.getElementById('password');
                    if (passwordInput) {
                        passwordInput.value = '';
                    }
                }
            }
        } catch (error) {
            console.error('處理記住登入資訊變更錯誤:', error);
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
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    // 開始自動更新（每 5 分鐘）
    startAutoRefresh() {
        this.clearAutoRefresh();

        // 每 5 分鐘自動更新所有資料
        this.autoRefreshInterval = setInterval(async () => {
            try {
                await this.loadAllDataSilently();
            } catch (error) {
                console.error('自動更新失敗:', error);
            }
        }, 5 * 60 * 1000); // 5 分鐘
    }

    // 清除自動更新
    clearAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    // 靜默載入所有資料（不顯示載入遮罩）
    async loadAllDataSilently() {
        try {
            // 並行執行兩個 API 呼叫，不顯示載入遮罩
            const [attendanceResult, abnormalResult] = await Promise.allSettled([
                this.loadAttendanceData(false),
                this.loadAbnormalData(false)
            ]);

            // 更新當前顯示的內容
            if (this.currentTab === 'today' && attendanceResult.status === 'fulfilled') {
                // 今日出勤頁面會自動更新
            }

            if (this.currentTab === 'abnormal' && abnormalResult.status === 'fulfilled') {
                // 異常記錄頁面會自動更新
            }

        } catch (error) {
            console.error('靜默載入資料錯誤:', error);
        }
    }

    // 顯示載入遮罩
    showLoading(show, message = '載入中...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');

        if (show) {
            if (loadingText) {
                loadingText.textContent = message;
            }
            if (overlay) {
                overlay.style.display = 'flex';
            }
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
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
        // 可以在這裡添加成功訊息的顯示邏輯
    }

    // 切換設定頁面（新增的切換方法）
    async toggleSettingsSection() {
        try {
            if (this.isInSettingsPage) {
                // 如果已在設定頁面，則返回主頁面
                await this.handleBackFromSettings();
            } else {
                // 如果不在設定頁面，則進入設定頁面
                await this.showSettingsSection();
            }
        } catch (error) {
            console.error('切換設定頁面失敗:', error);
            this.showError('切換設定失敗: ' + error.message);
        }
    }

    // 顯示設定頁面
    async showSettingsSection() {
        try {
            // 隱藏其他區域
            this.hideElement('loginSection');
            this.hideElement('attendanceSection');

            // 顯示設定區域
            this.showElement('settingsSection');

            // 更新狀態
            this.isInSettingsPage = true;

            // 更新 header 按鈕顯示狀態
            this.updateHeaderButtonsForSettings();

            // 載入當前設定
            await this.loadCurrentSettings();
        } catch (error) {
            console.error('顯示設定頁面失敗:', error);
            this.showError('載入設定失敗: ' + error.message);
        }
    }

    // 從設定頁面返回
    async handleBackFromSettings() {
        try {
            // 隱藏設定區域
            this.hideElement('settingsSection');

            // 更新狀態
            this.isInSettingsPage = false;

            // 恢復 header 按鈕顯示狀態
            this.updateHeaderButtonsForMain();

            // 根據登入狀態顯示對應頁面
            const isLoggedIn = window.authManager.isLoggedIn;
            if (isLoggedIn) {
                await this.showAttendanceSection();
            } else {
                // 從設定返回時保留密碼欄位的當前值
                await this.showLoginSection(false, false);
            }
        } catch (error) {
            console.error('返回主頁面失敗:', error);
            this.showError('返回失敗: ' + error.message);
        }
    }

    // 載入當前設定
    async loadCurrentSettings() {
        try {
            // 載入主題設定
            const currentTheme = window.themeManager.getCurrentTheme();
            const themeRadio = document.querySelector(`input[name="theme"][value="${currentTheme.id}"]`);
            if (themeRadio) {
                themeRadio.checked = true;
                // 更新主題選項的選中狀態
                this.updateThemeSelection(currentTheme.id);
            }

            // 載入其他設定
            if (window.storageManager) {
                const settingsResult = await window.storageManager.getSettings();
                if (settingsResult.success) {
                    const settings = settingsResult.data;

                    // 更新自動重新整理設定
                    const autoRefreshToggle = document.getElementById('autoRefresh');
                    if (autoRefreshToggle) {
                        autoRefreshToggle.checked = settings.autoRefresh !== false;
                    }

                    // 更新異常搜尋天數設定
                    const abnormalSearchDaysInput = document.getElementById('abnormalSearchDays');
                    if (abnormalSearchDaysInput) {
                        abnormalSearchDaysInput.value = settings.abnormalSearchDays || 45;
                    }

                    // 儲存當前設定
                    this.currentSettings = settings;

                    // 更新異常記錄頁面的提示文字
                    this.updateAbnormalInfoText(settings.abnormalSearchDays || 45);
                } else {
                    console.warn('載入設定失敗，使用預設設定:', settingsResult.error);
                    // 使用預設設定
                    const autoRefreshToggle = document.getElementById('autoRefresh');
                    if (autoRefreshToggle) {
                        autoRefreshToggle.checked = true; // 預設開啟
                    }

                    const abnormalSearchDaysInput = document.getElementById('abnormalSearchDays');
                    if (abnormalSearchDaysInput) {
                        abnormalSearchDaysInput.value = 45; // 預設45天
                    }

                    // 更新異常記錄頁面的提示文字
                    this.updateAbnormalInfoText(45);
                }
            }
        } catch (error) {
            console.error('載入設定失敗:', error);
        }
    }

    // 處理主題變更
    async handleThemeChange(themeId) {
        try {
            const success = await window.themeManager.switchTheme(themeId);
            if (success) {
                this.updateThemeSelection(themeId);
                this.showSuccess(`已切換到${window.themeManager.themes[themeId].name}`);
            } else {
                this.showError('主題切換失敗');
            }
        } catch (error) {
            console.error('主題切換錯誤:', error);
            this.showError('主題切換失敗: ' + error.message);
        }
    }

    // 更新主題選擇的視覺狀態
    updateThemeSelection(selectedThemeId) {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            const themeId = option.dataset.theme;
            if (themeId === selectedThemeId) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // 更新 header 按鈕顯示狀態 - 設定頁面模式
    updateHeaderButtonsForSettings() {
        // 隱藏登出按鈕和設定按鈕
        this.hideElement('logoutBtn');
        this.hideElement('settingsBtn');

        // 顯示返回按鈕
        this.showElement('backBtn');
    }

    // 更新 header 按鈕顯示狀態 - 主頁面模式
    updateHeaderButtonsForMain() {
        // 隱藏返回按鈕
        this.hideElement('backBtn');

        // 根據登入狀態顯示對應按鈕
        const isLoggedIn = window.authManager && window.authManager.isLoggedIn;
        if (isLoggedIn) {
            // 已登入：顯示登出按鈕和設定按鈕
            this.showElement('logoutBtn');
            this.showElement('settingsBtn');
        } else {
            // 未登入：隱藏登出按鈕，顯示設定按鈕
            this.hideElement('logoutBtn');
            this.showElement('settingsBtn');
        }
    }

    // 處理自動重新整理設定
    async handleAutoRefreshToggle(enabled) {
        try {
            if (window.storageManager) {
                const result = await window.storageManager.saveSettings({
                    autoRefresh: enabled
                });

                if (result.success) {
                    if (enabled) {
                        this.startAutoRefresh();
                    } else {
                        this.clearAutoRefresh();
                    }
                    this.showSuccess(`自動重新整理已${enabled ? '開啟' : '關閉'}`);
                } else {
                    this.showError('設定儲存失敗');
                }
            }
        } catch (error) {
            console.error('自動重新整理設定錯誤:', error);
            this.showError('設定失敗: ' + error.message);
        }
    }

    // 處理異常搜尋天數設定變更
    async handleAbnormalSearchDaysChange(event) {
        try {
            const input = event.target;
            let days = parseInt(input.value);

            // 驗證輸入值
            if (isNaN(days) || days < 1) {
                days = 1;
                input.value = 1;
            } else if (days > 365) {
                days = 365;
                input.value = 365;
            }

            // 儲存設定
            const settings = await window.storageManager.getSettings();
            const updatedSettings = {
                ...settings.data,
                abnormalSearchDays: days
            };

            await window.storageManager.saveSettings(updatedSettings);
            this.currentSettings = updatedSettings;

            // 更新異常記錄頁面的提示文字
            this.updateAbnormalInfoText(days);

            // 如果當前在異常記錄頁面，重新載入資料
            if (this.currentTab === 'abnormal') {
                await this.loadAbnormalData(true);
            }

        } catch (error) {
            console.error('儲存異常搜尋天數設定失敗:', error);
        }
    }

    // 更新異常記錄頁面的提示文字
    updateAbnormalInfoText(days) {
        const abnormalInfoText = document.getElementById('abnormalInfoText');
        if (abnormalInfoText) {
            abnormalInfoText.textContent = `自動查詢過去${days}天內的出勤異常記錄`;
        }
    }

    // 載入初始設定
    async loadInitialSettings() {
        try {
            if (window.storageManager) {
                const settingsResult = await window.storageManager.getSettings();
                if (settingsResult.success) {
                    this.currentSettings = settingsResult.data;
                    // 更新異常記錄頁面的提示文字
                    this.updateAbnormalInfoText(this.currentSettings.abnormalSearchDays || 45);
                } else {
                    // 使用預設設定
                    this.currentSettings = { abnormalSearchDays: 45 };
                    this.updateAbnormalInfoText(45);
                }
            }
        } catch (error) {
            console.error('載入初始設定失敗:', error);
            // 使用預設設定
            this.currentSettings = { abnormalSearchDays: 45 };
            this.updateAbnormalInfoText(45);
        }
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

    // 顯示確認對話框
    showConfirmDialog(title, message, onConfirm) {
        this.confirmCallback = onConfirm;

        // 更新對話框內容
        const titleElement = document.querySelector('.confirm-title');
        const messageElement = document.querySelector('.confirm-message');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        // 顯示對話框
        this.showElement('confirmOverlay');
    }

    // 隱藏確認對話框
    hideConfirmDialog() {
        this.hideElement('confirmOverlay');
        this.confirmCallback = null;
    }

    // 處理確認按鈕點擊
    handleConfirmOk() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmDialog();
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

    // 清理倒數計時器
    if (window.countdownTimer) {
        clearInterval(window.countdownTimer);
        window.countdownTimer = null;
    }
});
