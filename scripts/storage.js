// 資料儲存管理模組 - 處理 Chrome Storage API 的資料儲存和管理

class StorageManager {
    constructor() {
        this.storageKeys = {
            // 認證相關
            isLoggedIn: 'isLoggedIn',
            serverKey: 'serverKey',
            lastLoginTime: 'lastLoginTime',
            savedAccount: 'savedAccount',

            // 出勤資料
            attendanceData: 'attendanceData',
            lastUpdateTime: 'lastUpdateTime',
            todayAttendance: 'todayAttendance',

            // 設定
            autoRefresh: 'autoRefresh',
            refreshInterval: 'refreshInterval',
            notifications: 'notifications',

            // 快取
            userProfile: 'userProfile',
            workingRules: 'workingRules'
        };

        this.defaultSettings = {
            autoRefresh: true,
            refreshInterval: 60000, // 1 分鐘
            notifications: true,
            abnormalSearchDays: 45 // 異常記錄搜尋天數
        };

        // 檢查 Chrome Storage API 是否可用
        this.isChromeStorageAvailable = this.checkChromeStorageAvailability();
    }

    // 檢查 Chrome Storage API 可用性
    checkChromeStorageAvailability() {
        try {
            return !!(typeof chrome !== 'undefined' &&
                     chrome.storage &&
                     chrome.storage.local);
        } catch (error) {
            console.warn('Chrome Storage API 不可用，將使用 localStorage 作為回退方案');
            return false;
        }
    }

    // 統一的儲存方法
    async setStorage(data) {
        if (this.isChromeStorageAvailable) {
            return await chrome.storage.local.set(data);
        } else {
            // 使用 localStorage 作為回退
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            return Promise.resolve();
        }
    }

    // 統一的讀取方法
    async getStorage(keys) {
        if (this.isChromeStorageAvailable) {
            return await chrome.storage.local.get(keys);
        } else {
            // 使用 localStorage 作為回退
            const result = {};
            const keyArray = Array.isArray(keys) ? keys : [keys];
            keyArray.forEach(key => {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    try {
                        result[key] = JSON.parse(value);
                    } catch (error) {
                        result[key] = value;
                    }
                }
            });
            return Promise.resolve(result);
        }
    }

    // 統一的清除方法
    async removeStorage(keys) {
        if (this.isChromeStorageAvailable) {
            return await chrome.storage.local.remove(keys);
        } else {
            // 使用 localStorage 作為回退
            const keyArray = Array.isArray(keys) ? keys : [keys];
            keyArray.forEach(key => {
                localStorage.removeItem(key);
            });
            return Promise.resolve();
        }
    }

    // 統一的清除所有資料方法
    async clearAllStorage() {
        if (this.isChromeStorageAvailable) {
            return await chrome.storage.local.clear();
        } else {
            // 使用 localStorage 作為回退
            localStorage.clear();
            return Promise.resolve();
        }
    }

    // 統一的取得所有資料方法
    async getAllStorage() {
        if (this.isChromeStorageAvailable) {
            return await chrome.storage.local.get(null);
        } else {
            // 使用 localStorage 作為回退
            const result = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                try {
                    result[key] = JSON.parse(value);
                } catch (error) {
                    result[key] = value;
                }
            }
            return Promise.resolve(result);
        }
    }

    // 儲存登入資訊
    async saveLoginInfo(loginData) {
        try {
            const dataToSave = {
                [this.storageKeys.isLoggedIn]: true,
                [this.storageKeys.serverKey]: loginData.serverKey,
                [this.storageKeys.lastLoginTime]: Date.now()
            };

            // 如果選擇記住帳號，則儲存帳號資訊
            if (loginData.remember && loginData.account) {
                dataToSave[this.storageKeys.savedAccount] = loginData.account;
            }

            await this.setStorage(dataToSave);
            
            return { success: true };
        } catch (error) {
            console.error('儲存登入資訊失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得登入資訊
    async getLoginInfo() {
        try {
            const keys = [
                this.storageKeys.isLoggedIn,
                this.storageKeys.serverKey,
                this.storageKeys.lastLoginTime,
                this.storageKeys.savedAccount
            ];
            
            const data = await this.getStorage(keys);
            
            return {
                success: true,
                data: {
                    isLoggedIn: data[this.storageKeys.isLoggedIn] || false,
                    serverKey: data[this.storageKeys.serverKey] || null,
                    lastLoginTime: data[this.storageKeys.lastLoginTime] || null,
                    savedAccount: data[this.storageKeys.savedAccount] || null
                }
            };
        } catch (error) {
            console.error('取得登入資訊失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 清除登入資訊
    async clearLoginInfo() {
        try {
            const keysToClear = [
                this.storageKeys.isLoggedIn,
                this.storageKeys.serverKey,
                this.storageKeys.lastLoginTime
                // 保留 savedAccount 除非用戶明確要求清除
            ];
            
            await this.removeStorage(keysToClear);
            
            return { success: true };
        } catch (error) {
            console.error('清除登入資訊失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 儲存出勤資料
    async saveAttendanceData(attendanceData) {
        try {
            const dataToSave = {
                [this.storageKeys.attendanceData]: attendanceData,
                [this.storageKeys.lastUpdateTime]: Date.now()
            };

            await this.setStorage(dataToSave);
            
            return { success: true };
        } catch (error) {
            console.error('儲存出勤資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得出勤資料
    async getAttendanceData() {
        try {
            const keys = [
                this.storageKeys.attendanceData,
                this.storageKeys.lastUpdateTime
            ];
            
            const data = await this.getStorage(keys);
            
            return {
                success: true,
                data: {
                    attendanceData: data[this.storageKeys.attendanceData] || null,
                    lastUpdateTime: data[this.storageKeys.lastUpdateTime] || null
                }
            };
        } catch (error) {
            console.error('取得出勤資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 儲存今日出勤資料
    async saveTodayAttendance(todayData) {
        try {
            const dataToSave = {
                [this.storageKeys.todayAttendance]: {
                    ...todayData,
                    date: new Date().toDateString(),
                    timestamp: Date.now()
                }
            };

            await this.setStorage(dataToSave);
            
            return { success: true };
        } catch (error) {
            console.error('儲存今日出勤資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得今日出勤資料
    async getTodayAttendance() {
        try {
            const data = await this.getStorage([this.storageKeys.todayAttendance]);
            const todayData = data[this.storageKeys.todayAttendance];
            
            // 檢查是否為今日資料
            if (todayData && todayData.date === new Date().toDateString()) {
                return {
                    success: true,
                    data: todayData
                };
            } else {
                return {
                    success: true,
                    data: null
                };
            }
        } catch (error) {
            console.error('取得今日出勤資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 儲存使用者設定
    async saveSettings(settings) {
        try {
            const settingsToSave = { ...this.defaultSettings, ...settings };
            
            await this.setStorage({
                userSettings: settingsToSave
            });
            return { success: true };
        } catch (error) {
            console.error('儲存使用者設定失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得使用者設定
    async getSettings() {
        try {
            const data = await this.getStorage(['userSettings']);
            const settings = data.userSettings || this.defaultSettings;
            
            return {
                success: true,
                data: settings
            };
        } catch (error) {
            console.error('取得使用者設定失敗:', error);
            return { 
                success: false, 
                error: error.message,
                data: this.defaultSettings 
            };
        }
    }

    // 儲存使用者資料
    async saveUserProfile(profile) {
        try {
            await this.setStorage({
                [this.storageKeys.userProfile]: {
                    ...profile,
                    lastUpdated: Date.now()
                }
            });
            return { success: true };
        } catch (error) {
            console.error('儲存使用者資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得使用者資料
    async getUserProfile() {
        try {
            const data = await this.getStorage([this.storageKeys.userProfile]);
            
            return {
                success: true,
                data: data[this.storageKeys.userProfile] || null
            };
        } catch (error) {
            console.error('取得使用者資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 清除所有資料
    async clearAllData() {
        try {
            await this.clearAllStorage();
            
            return { success: true };
        } catch (error) {
            console.error('清除所有資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得儲存空間使用情況
    async getStorageUsage() {
        try {
            const data = await this.getAllStorage();
            const usage = {
                totalItems: Object.keys(data).length,
                totalSize: JSON.stringify(data).length,
                items: {}
            };

            // 計算各項目大小
            for (const [key, value] of Object.entries(data)) {
                usage.items[key] = {
                    size: JSON.stringify(value).length,
                    type: typeof value,
                    lastModified: value.timestamp || value.lastUpdated || null
                };
            }

            return {
                success: true,
                data: usage
            };
        } catch (error) {
            console.error('取得儲存空間使用情況失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 檢查資料是否過期
    isDataExpired(timestamp, maxAgeHours = 24) {
        if (!timestamp) return true;
        
        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000; // 轉換為毫秒
        
        return (now - timestamp) > maxAge;
    }

    // 清理過期資料
    async cleanupExpiredData() {
        try {
            const data = await this.getAllStorage();
            const keysToRemove = [];
            
            for (const [key, value] of Object.entries(data)) {
                // 檢查是否有時間戳記且已過期
                if (value && typeof value === 'object') {
                    const timestamp = value.timestamp || value.lastUpdated || value.lastLoginTime;
                    
                    if (timestamp && this.isDataExpired(timestamp, 168)) { // 7 天
                        keysToRemove.push(key);
                    }
                }
            }
            
            if (keysToRemove.length > 0) {
                await this.removeStorage(keysToRemove);
            }
            
            return {
                success: true,
                removedItems: keysToRemove.length
            };
        } catch (error) {
            console.error('清理過期資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 匯出資料
    async exportData() {
        try {
            const data = await this.getAllStorage();
            
            // 移除敏感資訊
            const exportData = { ...data };
            delete exportData[this.storageKeys.serverKey];
            delete exportData[this.storageKeys.savedAccount];
            
            return {
                success: true,
                data: exportData,
                exportTime: new Date().toISOString()
            };
        } catch (error) {
            console.error('匯出資料失敗:', error);
            return { success: false, error: error.message };
        }
    }
}

// 匯出儲存管理器實例
window.storageManager = new StorageManager();
