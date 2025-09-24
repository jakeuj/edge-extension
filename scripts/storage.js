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
            notifications: true
        };
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

            await chrome.storage.local.set(dataToSave);
            console.log('登入資訊已儲存');
            
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
            
            const data = await chrome.storage.local.get(keys);
            
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
            
            await chrome.storage.local.remove(keysToClear);
            console.log('登入資訊已清除');
            
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

            await chrome.storage.local.set(dataToSave);
            console.log('出勤資料已儲存');
            
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
            
            const data = await chrome.storage.local.get(keys);
            
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

            await chrome.storage.local.set(dataToSave);
            console.log('今日出勤資料已儲存');
            
            return { success: true };
        } catch (error) {
            console.error('儲存今日出勤資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得今日出勤資料
    async getTodayAttendance() {
        try {
            const data = await chrome.storage.local.get([this.storageKeys.todayAttendance]);
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
            
            await chrome.storage.local.set({
                userSettings: settingsToSave
            });
            
            console.log('使用者設定已儲存');
            return { success: true };
        } catch (error) {
            console.error('儲存使用者設定失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得使用者設定
    async getSettings() {
        try {
            const data = await chrome.storage.local.get(['userSettings']);
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
            await chrome.storage.local.set({
                [this.storageKeys.userProfile]: {
                    ...profile,
                    lastUpdated: Date.now()
                }
            });
            
            console.log('使用者資料已儲存');
            return { success: true };
        } catch (error) {
            console.error('儲存使用者資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得使用者資料
    async getUserProfile() {
        try {
            const data = await chrome.storage.local.get([this.storageKeys.userProfile]);
            
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
            await chrome.storage.local.clear();
            console.log('所有資料已清除');
            
            return { success: true };
        } catch (error) {
            console.error('清除所有資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    // 取得儲存空間使用情況
    async getStorageUsage() {
        try {
            const data = await chrome.storage.local.get(null);
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
            const data = await chrome.storage.local.get(null);
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
                await chrome.storage.local.remove(keysToRemove);
                console.log(`已清理 ${keysToRemove.length} 個過期項目:`, keysToRemove);
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
            const data = await chrome.storage.local.get(null);
            
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
