// 認證模組 - 處理登入、登出和認證狀態管理

class AuthManager {
    constructor() {
        this.serverKey = null;
        this.isLoggedIn = false;
        this.loginTime = null;
    }

    // 初始化認證管理器
    async init() {
        try {
            // 檢查是否在擴充套件環境中
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const data = await chrome.storage.local.get([
                    'isLoggedIn',
                    'serverKey',
                    'lastLoginTime',
                    'savedAccount'
                ]);

                this.isLoggedIn = data.isLoggedIn || false;
                this.serverKey = data.serverKey || null;
                this.loginTime = data.lastLoginTime || null;

                // 檢查登入是否過期（8小時），如果過期則嘗試自動重新登入
                if (this.isLoggedIn && this.loginTime) {
                    const hoursSinceLogin = (Date.now() - this.loginTime) / (1000 * 60 * 60);
                    if (hoursSinceLogin > 8) {
                        console.log('Token 已過期，嘗試自動重新登入...');
                        const reloginResult = await this.attemptAutoRelogin();
                        if (!reloginResult.success) {
                            await this.logout();
                            return false;
                        }
                        return true;
                    }
                }

                return this.isLoggedIn;
            } else {
                // 非擴展環境，返回未登入狀態
                this.isLoggedIn = false;
                this.serverKey = null;
                this.loginTime = null;
                return false;
            }
        } catch (error) {
            console.error('初始化認證管理器失敗:', error);
            return false;
        }
    }

    // 登入
    async login(account, password, remember = false) {
        try {
            // 驗證輸入
            if (!account || !password) {
                throw new Error('請輸入帳號和密碼');
            }

            // 確保帳號格式正確（包含域名）
            if (!account.includes('\\')) {
                throw new Error('帳號格式錯誤，請使用 "域名\\使用者名稱" 格式');
            }

            // 如果需要記住密碼，先加密
            let encryptedPassword = null;
            if (remember && window.cryptoManager) {
                encryptedPassword = await window.cryptoManager.encrypt(password);
            }

            // 發送登入請求到背景腳本
            const response = await this.sendMessage({
                action: 'login',
                credentials: {
                    account: account,
                    password: password,
                    remember: remember,
                    encryptedPassword: encryptedPassword
                }
            });

            if (response.success) {
                this.isLoggedIn = true;
                this.serverKey = response.serverKey;
                this.loginTime = Date.now();

                // 如果勾選記住密碼，儲存加密後的憑證
                if (remember && window.cryptoManager) {
                    await window.cryptoManager.saveCredentials(account, password);
                }

                return {
                    success: true,
                    message: response.message || '登入成功'
                };
            } else {
                throw new Error(response.error || '登入失敗');
            }
        } catch (error) {
            console.error('登入錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 登出
    async logout(clearCredentials = false) {
        try {
            const response = await this.sendMessage({
                action: 'logout'
            });

            this.isLoggedIn = false;
            this.serverKey = null;
            this.loginTime = null;

            // 如果指定清除憑證，則清除儲存的帳號密碼
            if (clearCredentials && window.cryptoManager) {
                await window.cryptoManager.clearCredentials();
            }

            return {
                success: true,
                message: '已登出'
            };
        } catch (error) {
            console.error('登出錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 取得儲存的帳號資訊
    async getSavedAccount() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const data = await chrome.storage.local.get(['savedAccount']);
                return data.savedAccount || '';
            } else {
                // 非擴展環境，返回空字串
                return '';
            }
        } catch (error) {
            console.error('取得儲存帳號失敗:', error);
            return '';
        }
    }

    // 檢查認證狀態
    async checkAuthStatus() {
        if (!this.isLoggedIn || !this.serverKey) {
            return false;
        }

        // 檢查是否過期
        if (this.loginTime) {
            const hoursSinceLogin = (Date.now() - this.loginTime) / (1000 * 60 * 60);
            if (hoursSinceLogin > 8) {
                await this.logout();
                return false;
            }
        }

        return true;
    }

    // 取得 serverKey
    getServerKey() {
        return this.serverKey;
    }

    // 檢查是否已登入
    isAuthenticated() {
        return this.isLoggedIn && this.serverKey;
    }

    // 發送訊息到背景腳本
    async sendMessage(message) {
        // 檢查是否在擴充套件環境中
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
        } else {
            // 非擴展環境，返回錯誤
            return Promise.reject(new Error('Chrome Extension API 不可用'));
        }
    }



    // 驗證帳號格式
    validateAccountFormat(account) {
        // 檢查是否包含反斜線
        if (!account.includes('\\')) {
            return {
                valid: false,
                error: '帳號格式錯誤，請使用 "域名\\使用者名稱" 格式（例如：gigabyte\\your.username）'
            };
        }

        const parts = account.split('\\');
        if (parts.length !== 2) {
            return {
                valid: false,
                error: '帳號格式錯誤，只能包含一個反斜線'
            };
        }

        const [domain, username] = parts;
        if (!domain || !username) {
            return {
                valid: false,
                error: '域名和使用者名稱都不能為空'
            };
        }

        return {
            valid: true,
            domain: domain,
            username: username
        };
    }

    // 格式化帳號顯示（隱藏部分資訊）
    formatAccountDisplay(account) {
        if (!account || !account.includes('\\')) {
            return account;
        }

        const parts = account.split('\\');
        const domain = parts[0];
        const username = parts[1];

        if (username.length <= 4) {
            return `${domain}\\${username}`;
        }

        const maskedUsername = username.substring(0, 2) + 
                              '*'.repeat(username.length - 4) + 
                              username.substring(username.length - 2);
        
        return `${domain}\\${maskedUsername}`;
    }

    // 取得登入時間資訊
    getLoginTimeInfo() {
        if (!this.loginTime) {
            return null;
        }

        const loginDate = new Date(this.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
        const hoursRemaining = Math.max(0, 8 - hoursSinceLogin);

        return {
            loginTime: loginDate,
            hoursSinceLogin: hoursSinceLogin,
            hoursRemaining: hoursRemaining,
            isExpired: hoursSinceLogin >= 8
        };
    }

    // 嘗試自動重新登入
    async attemptAutoRelogin() {
        try {
            console.log('嘗試自動重新登入...');

            // 檢查是否有加密管理器
            if (!window.cryptoManager) {
                console.error('加密管理器未初始化');
                return { success: false, error: '加密管理器未初始化' };
            }

            // 讀取儲存的憑證
            const credentialsResult = await window.cryptoManager.loadCredentials();

            if (!credentialsResult.success) {
                console.log('無法讀取儲存的憑證:', credentialsResult.error);
                return { success: false, error: '無儲存的憑證' };
            }

            const { account, password } = credentialsResult;

            // 使用儲存的憑證重新登入
            console.log('使用儲存的憑證重新登入...');
            const loginResult = await this.login(account, password, true);

            if (loginResult.success) {
                console.log('自動重新登入成功');
                return { success: true, message: '自動重新登入成功' };
            } else {
                console.error('自動重新登入失敗:', loginResult.error);
                return { success: false, error: loginResult.error };
            }
        } catch (error) {
            console.error('自動重新登入錯誤:', error);
            return { success: false, error: error.message };
        }
    }

    // 處理 API 錯誤並嘗試自動重新登入
    async handleApiError(error) {
        // 檢查是否為認證錯誤
        if (error.message && (error.message.includes('401') ||
            error.message.includes('認證') ||
            error.message.includes('unauthorized'))) {

            console.log('偵測到認證錯誤，嘗試自動重新登入...');

            // 嘗試自動重新登入
            const reloginResult = await this.attemptAutoRelogin();

            if (reloginResult.success) {
                return { success: true, shouldRetry: true };
            } else {
                // 自動重新登入失敗，需要使用者手動登入
                await this.logout();
                return { success: false, shouldRetry: false, error: '請重新登入' };
            }
        }

        return { success: false, shouldRetry: false, error: error.message };
    }
}

// 匯出認證管理器實例
window.authManager = new AuthManager();
