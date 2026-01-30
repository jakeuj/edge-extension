// 背景服務工作者 - 處理擴充套件的背景任務

// Service Worker 初始化保護旗標
let isInitialized = false;

// 安裝時的初始化
chrome.runtime.onInstalled.addListener(async (details) => {
    // 防止重複初始化
    if (isInitialized && details.reason !== 'install') {
        console.log('Service Worker 已初始化，跳過重複初始化');
        return;
    }

    console.log('擴充套件安裝/更新事件:', details.reason);

    if (details.reason === 'install') {
        // 首次安裝：設定所有預設值
        console.log('首次安裝，初始化預設值');
        await chrome.storage.local.set({
            isLoggedIn: false,
            serverKey: null,
            lastLoginTime: null,
            attendanceData: null
        });
        isInitialized = true;
    } else if (details.reason === 'update') {
        // 更新：只重置登入狀態，不觸碰憑證
        console.log('擴充套件更新，重置登入狀態但保留憑證');

        // 只重置登入相關狀態，不設定憑證相關欄位
        // 這樣可以避免覆寫現有的 savedAccount, savedPassword, hasCredentials
        await chrome.storage.local.set({
            isLoggedIn: false,
            serverKey: null,
            lastLoginTime: null,
            attendanceData: null
        });

        // 驗證憑證是否仍然存在
        const credentialCheck = await chrome.storage.local.get([
            'savedAccount',
            'savedPassword',
            'hasCredentials'
        ]);

        console.log('更新後憑證狀態:', {
            hasAccount: !!credentialCheck.savedAccount,
            hasPassword: !!credentialCheck.savedPassword,
            hasCredentials: credentialCheck.hasCredentials
        });

        isInitialized = true;
    }
});

// 監聽 Storage 變更以追蹤憑證修改（用於除錯）
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        // 追蹤憑證相關欄位的變更
        const credentialFields = ['savedAccount', 'savedPassword', 'hasCredentials'];
        const credentialChanges = {};
        let hasCredentialChange = false;

        for (const field of credentialFields) {
            if (changes[field]) {
                credentialChanges[field] = {
                    oldValue: changes[field].oldValue,
                    newValue: changes[field].newValue
                };
                hasCredentialChange = true;
            }
        }

        if (hasCredentialChange) {
            console.warn('🔐 憑證變更偵測:', {
                changes: credentialChanges,
                timestamp: new Date().toISOString(),
                // 記錄呼叫堆疊以追蹤變更來源
                trace: new Error().stack
            });

            // 特別警告：如果憑證被清除
            if (changes.savedPassword &&
                changes.savedPassword.oldValue &&
                !changes.savedPassword.newValue) {
                console.error('⚠️ 警告：密碼已被清除！', {
                    timestamp: new Date().toISOString()
                });
            }

            if (changes.hasCredentials &&
                changes.hasCredentials.oldValue === true &&
                changes.hasCredentials.newValue === false) {
                console.error('⚠️ 警告：憑證標記已被清除！', {
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
});

// 處理來自 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'login':
            handleLogin(request.credentials)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // 保持訊息通道開啟以進行異步回應

        case 'getAttendance':
            handleGetAttendance(request.serverKey)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        case 'getHistoryAttendance':
            handleGetHistoryAttendance(request.serverKey, request.startDate, request.endDate)
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        case 'logout':
            handleLogout()
                .then(result => sendResponse(result))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
    }
});

// 處理登入
async function handleLogin(credentials) {
    try {
        const response = await fetch('https://geip.gigabyte.com.tw/api_geip/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                account: credentials.account,
                password: credentials.password,
                remember: credentials.remember,
                type: 1
            })
        });

        const data = await response.json();

        if (data.statusCode === 200 && data.result && data.result.serverKey) {
            // 先儲存登入狀態
            await chrome.storage.local.set({
                isLoggedIn: true,
                serverKey: data.result.serverKey,
                lastLoginTime: Date.now()
            });

            // 如果需要記住密碼，分開儲存憑證（避免覆蓋其他值）
            if (credentials.remember && credentials.encryptedPassword) {
                await chrome.storage.local.set({
                    savedAccount: credentials.account,
                    savedPassword: credentials.encryptedPassword,
                    hasCredentials: true
                });
                console.log('✓ 憑證已安全儲存');
            }

            return {
                success: true,
                serverKey: data.result.serverKey,
                message: '登入成功'
            };
        } else {
            return {
                success: false,
                error: data.message || '登入失敗，請檢查帳號密碼'
            };
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        return {
            success: false,
            error: '網路連線錯誤，請稍後再試'
        };
    }
}

// 處理取得出勤資訊
async function handleGetAttendance(serverKey) {
    try {
        const today = new Date();
        const startDate = formatDate(today);
        const endDate = formatDate(today);
        
        const response = await fetch('https://eipapi.gigabyte.com.tw/GEIP_API/api/getAttendanceInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'serverkey': serverKey
            },
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                status: "ALL",
                employeeId: "",
                deptId: "",
                lineType: "",
                group: "",
                includeSubDept: false
            })
        });

        const data = await response.json();
        
        if (data.statusCode === 200 && data.result) {
            // 儲存出勤資料
            await chrome.storage.local.set({
                attendanceData: data.result,
                lastUpdateTime: Date.now()
            });
            
            return { 
                success: true, 
                data: data.result,
                message: '出勤資料更新成功'
            };
        } else {
            return { 
                success: false, 
                error: data.message || '無法取得出勤資料'
            };
        }
    } catch (error) {
        console.error('取得出勤資料錯誤:', error);
        return { 
            success: false, 
            error: '網路連線錯誤，請稍後再試'
        };
    }
}

// 處理取得歷史出勤資訊
async function handleGetHistoryAttendance(serverKey, startDate, endDate) {
    try {
        if (!startDate || !endDate) {
            return {
                success: false,
                error: '請指定查詢日期範圍'
            };
        }

        const response = await fetch('https://eipapi.gigabyte.com.tw/GEIP_API/api/getAttendanceInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'serverkey': serverKey
            },
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
                status: "ALL",
                employeeId: "",
                deptId: "",
                lineType: "",
                group: "",
                includeSubDept: false
            })
        });

        const data = await response.json();

        if (data.statusCode === 200 && data.result) {
            return {
                success: true,
                data: data.result,
                message: '歷史出勤資料取得成功'
            };
        } else {
            return {
                success: false,
                error: data.message || '無法取得歷史出勤資料'
            };
        }
    } catch (error) {
        console.error('取得歷史出勤資料錯誤:', error);
        return {
            success: false,
            error: '網路連線錯誤，請稍後再試'
        };
    }
}

// 處理登出
async function handleLogout() {
    try {
        // 清除登入狀態，但保留儲存的憑證以便自動重新登入
        await chrome.storage.local.set({
            isLoggedIn: false,
            serverKey: null,
            attendanceData: null,
            lastUpdateTime: null
        });

        // 注意：不清除 savedAccount, savedPassword, hasCredentials
        // 這樣可以在 token 過期時自動重新登入

        return {
            success: true,
            message: '已登出'
        };
    } catch (error) {
        console.error('登出錯誤:', error);
        return {
            success: false,
            error: '登出時發生錯誤'
        };
    }
}

// 格式化日期為 YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 自動重新登入機制 - 當 token 過期時自動使用儲存的憑證重新登入
async function attemptAutoRelogin() {
    try {
        const data = await chrome.storage.local.get([
            'hasCredentials',
            'savedAccount',
            'savedPassword'
        ]);

        if (!data.hasCredentials || !data.savedAccount || !data.savedPassword) {
            console.log('無儲存的憑證，無法自動重新登入');
            return { success: false, error: '無儲存的憑證' };
        }

        console.log('嘗試自動重新登入...');

        // 使用儲存的憑證重新登入
        const result = await handleLogin({
            account: data.savedAccount,
            password: data.savedPassword, // 這是加密後的密碼，需要在前端解密
            remember: true,
            isEncrypted: true // 標記這是加密的密碼
        });

        if (result.success) {
            console.log('自動重新登入成功');
        } else {
            console.error('自動重新登入失敗:', result.error);
        }

        return result;
    } catch (error) {
        console.error('自動重新登入錯誤:', error);
        return { success: false, error: error.message };
    }
}

// 定期檢查 token 是否過期並自動重新登入（每小時檢查一次）
setInterval(async () => {
    const data = await chrome.storage.local.get(['isLoggedIn', 'lastLoginTime', 'hasCredentials']);

    if (data.isLoggedIn && data.lastLoginTime) {
        const hoursSinceLogin = (Date.now() - data.lastLoginTime) / (1000 * 60 * 60);

        // 如果超過 7.5 小時，嘗試自動重新登入（在 8 小時過期前）
        if (hoursSinceLogin > 7.5 && data.hasCredentials) {
            console.log('Token 即將過期，嘗試自動重新登入...');
            await attemptAutoRelogin();
        }
    }
}, 60 * 60 * 1000); // 每小時檢查一次

// Service Worker 啟動時驗證憑證完整性
async function verifyCredentialsOnStartup() {
    try {
        const data = await chrome.storage.local.get([
            'savedAccount',
            'savedPassword',
            'hasCredentials'
        ]);

        console.log('🔍 Service Worker 啟動 - 憑證狀態檢查:', {
            hasAccount: !!data.savedAccount,
            hasPassword: !!data.savedPassword,
            hasCredentials: data.hasCredentials,
            timestamp: new Date().toISOString()
        });

        // 如果標記為有憑證，驗證實際資料是否完整
        if (data.hasCredentials === true) {
            // 檢查是否真的遺失了憑證
            if (!data.savedAccount || !data.savedPassword) {
                console.warn('⚠️ 偵測到憑證不一致，修正 hasCredentials 標記');
                await chrome.storage.local.set({ hasCredentials: false });
            } else {
                // 憑證完整，記錄確認訊息
                console.log('✅ 憑證驗證通過，可以使用自動登入');
            }
        } else if (data.hasCredentials === false) {
            // 明確標記為無憑證，記錄狀態
            console.log('ℹ️ 無儲存的憑證');
        }
    } catch (error) {
        console.error('憑證驗證失敗:', error);
    }
}

// Service Worker 啟動時執行驗證
verifyCredentialsOnStartup();

// 匯出函數供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { attemptAutoRelogin };
}
