// 主要 popup 腳本 - 整合所有功能並處理使用者介面

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
    }

    // 初始化 popup
    async init() {
        try {
            console.log('初始化 popup...');
            
            // 等待所有模組載入
            await this.waitForModules();

            // 初始化主題管理器
            await window.themeManager.init();

            // 初始化認證管理器
            const isLoggedIn = await window.authManager.init();

            // 設定事件監聽器
            this.setupEventListeners();
            
            // 根據登入狀態顯示對應介面
            if (isLoggedIn) {
                await this.showAttendanceSection();
                await this.loadAllData();
                this.startAutoRefresh();
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
            if (window.authManager && window.apiManager && window.timeCalculator &&
                window.themeManager && window.storageManager) {
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

        const notificationsToggle = document.getElementById('notifications');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.handleNotificationsToggle(e.target.checked);
            });
        }

        // 帳號輸入框自動完成
        const accountInput = document.getElementById('account');
        if (accountInput) {
            accountInput.addEventListener('focus', () => this.loadSavedAccount());
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

                const result = await window.authManager.logout();

                if (result.success) {
                    this.clearRefreshInterval();
                    this.clearAutoRefresh();
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

            // 處理今日出勤資料結果
            if (attendanceResult.status === 'fulfilled') {
                console.log('今日出勤資料載入成功');
            } else {
                console.error('今日出勤資料載入失敗:', attendanceResult.reason);
            }

            // 處理異常記錄資料結果
            if (abnormalResult.status === 'fulfilled') {
                console.log('異常記錄資料載入成功');
            } else {
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
            console.log('切換到異常記錄頁面，異常資料:', this.abnormalData);
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
                console.warn('缺少認證金鑰，無法載入異常記錄');
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

        if (!abnormalData || abnormalData.length === 0) {
            abnormalList.innerHTML = '<div class="no-abnormal-data">🎉 恭喜！過去45天內沒有出勤異常記錄</div>';
            return;
        }

        let html = '';
        abnormalData.forEach(record => {
            html += `
                <div class="abnormal-item">
                    <div class="abnormal-date">
                        <span class="date">${record.date}</span>
                        <span class="status status-abnormal">${record.status}</span>
                    </div>
                    <div class="abnormal-details">
                        <div class="time-info">
                            <span class="time-label">上班:</span>
                            <span class="time-value">${window.apiManager.formatTime(record.punchIn)}</span>
                            <span class="time-label">下班:</span>
                            <span class="time-value">${window.apiManager.formatTime(record.punchOut)}</span>
                        </div>
                        <div class="work-hours">
                            <span class="work-hours-label">工作時間:</span>
                            <span class="work-hours-value">${record.workHours}</span>
                        </div>
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
    async showLoginSection() {
        this.hideElement('attendanceSection');
        this.hideElement('settingsSection');
        this.showElement('loginSection');

        // 更新狀態
        this.isInSettingsPage = false;

        // 更新 header 按鈕顯示狀態
        this.updateHeaderButtonsForMain();

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
                console.log('自動更新資料...');
                await this.loadAllDataSilently();
                console.log('自動更新完成');
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
        console.log('成功:', message);
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

            console.log('已切換到設定頁面');
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
                await this.showLoginSection();
            }

            console.log('已返回主頁面');
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

                    // 更新通知設定
                    const notificationsToggle = document.getElementById('notifications');
                    if (notificationsToggle) {
                        notificationsToggle.checked = settings.notifications !== false;
                    }
                }
            }
        } catch (error) {
            console.error('載入設定失敗:', error);
        }
    }

    // 處理主題變更
    async handleThemeChange(themeId) {
        try {
            console.log('切換主題:', themeId);

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
            console.log('自動重新整理設定:', enabled);

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

    // 處理通知設定
    async handleNotificationsToggle(enabled) {
        try {
            console.log('通知設定:', enabled);

            if (window.storageManager) {
                const result = await window.storageManager.saveSettings({
                    notifications: enabled
                });

                if (result.success) {
                    this.showSuccess(`通知提醒已${enabled ? '開啟' : '關閉'}`);
                } else {
                    this.showError('設定儲存失敗');
                }
            }
        } catch (error) {
            console.error('通知設定錯誤:', error);
            this.showError('設定失敗: ' + error.message);
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
});
