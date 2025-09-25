// 背景服務工作者 - 處理擴充套件的背景任務

// 安裝時的初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('技嘉出勤時間追蹤器已安裝');
    
    // 設定預設值
    chrome.storage.local.set({
        isLoggedIn: false,
        serverKey: null,
        lastLoginTime: null,
        attendanceData: null
    });
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
            // 儲存登入資訊
            const loginData = {
                isLoggedIn: true,
                serverKey: data.result.serverKey,
                lastLoginTime: Date.now()
            };
            
            if (credentials.remember) {
                loginData.savedAccount = credentials.account;
            }
            
            await chrome.storage.local.set(loginData);
            
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
        await chrome.storage.local.set({
            isLoggedIn: false,
            serverKey: null,
            attendanceData: null,
            lastUpdateTime: null
        });
        
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

// 定期檢查 serverKey 是否過期（每小時檢查一次）
setInterval(async () => {
    const data = await chrome.storage.local.get(['isLoggedIn', 'lastLoginTime']);
    
    if (data.isLoggedIn && data.lastLoginTime) {
        const hoursSinceLogin = (Date.now() - data.lastLoginTime) / (1000 * 60 * 60);
        
        // 如果超過 8 小時，清除登入狀態
        if (hoursSinceLogin > 8) {
            await chrome.storage.local.set({
                isLoggedIn: false,
                serverKey: null,
                attendanceData: null
            });
            console.log('登入已過期，已自動登出');
        }
    }
}, 60 * 60 * 1000); // 每小時檢查一次
