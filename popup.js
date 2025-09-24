// 全域變數
let currentServerKey = null;
let refreshInterval = null;
let userCredentials = null;

// API 設定預設值
const DEFAULT_API_SETTINGS = {
    companyDomain: 'company',
    loginApiUrl: 'https://your-company-api.com/api/auth/login',
    attendanceApiUrl: 'https://your-company-api.com/api/getAttendanceInfo'
};

// 當前 API 設定
let apiSettings = { ...DEFAULT_API_SETTINGS };

// 通用儲存函數
async function setStorage(data) {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set(data);
        } else {
            // 在普通網頁環境中使用 localStorage
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }
    } catch (error) {
        console.error('儲存資料失敗:', error);
    }
}

// 通用讀取函數
async function getStorage(keys) {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            return await chrome.storage.local.get(keys);
        } else {
            // 在普通網頁環境中使用 localStorage
            const result = {};
            for (const key of keys) {
                const value = localStorage.getItem(key);
                if (value !== null) {
                    try {
                        result[key] = JSON.parse(value);
                    } catch {
                        result[key] = value;
                    }
                }
            }
            return result;
        }
    } catch (error) {
        console.error('讀取資料失敗:', error);
        return {};
    }
}

// 通用刪除函數
async function removeStorage(keys) {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.remove(keys);
        } else {
            // 在普通網頁環境中使用 localStorage
            for (const key of keys) {
                localStorage.removeItem(key);
            }
        }
    } catch (error) {
        console.error('刪除資料失敗:', error);
    }
}

// API 設定相關函數
async function loadApiSettings() {
    try {
        const saved = await getStorage('apiSettings');
        if (saved) {
            apiSettings = { ...DEFAULT_API_SETTINGS, ...saved };
        }
        updateApiSettingsUI();
        updateUsernamePrefix();
    } catch (error) {
        console.error('載入 API 設定失敗:', error);
        apiSettings = { ...DEFAULT_API_SETTINGS };
    }
}

async function saveApiSettings() {
    try {
        // 從 UI 讀取設定
        apiSettings.companyDomain = elements.companyDomain.value.trim() || 'company';
        apiSettings.loginApiUrl = elements.loginApiUrl.value.trim() || DEFAULT_API_SETTINGS.loginApiUrl;
        apiSettings.attendanceApiUrl = elements.attendanceApiUrl.value.trim() || DEFAULT_API_SETTINGS.attendanceApiUrl;

        await setStorage({ apiSettings });
        showStatus(elements.loginStatus, '✅ API 設定已儲存', 'success');
        updateUsernamePrefix();
    } catch (error) {
        console.error('儲存 API 設定失敗:', error);
        showStatus(elements.loginStatus, '❌ 儲存失敗：' + error.message, 'error');
    }
}

function updateApiSettingsUI() {
    if (elements.companyDomain) elements.companyDomain.value = apiSettings.companyDomain;
    if (elements.loginApiUrl) elements.loginApiUrl.value = apiSettings.loginApiUrl;
    if (elements.attendanceApiUrl) elements.attendanceApiUrl.value = apiSettings.attendanceApiUrl;
}

function updateUsernamePrefix() {
    if (elements.usernamePrefix) {
        elements.usernamePrefix.textContent = `${apiSettings.companyDomain}\\`;
    }
}

function resetApiSettings() {
    apiSettings = { ...DEFAULT_API_SETTINGS };
    updateApiSettingsUI();
    updateUsernamePrefix();
    showStatus(elements.loginStatus, '🔄 已重置為預設設定', 'success');
}

// DOM 元素
const elements = {
    // 區域
    loginSection: document.getElementById('loginSection'),
    mainSection: document.getElementById('mainSection'),
    settingsSection: document.getElementById('settingsSection'),
    
    // 登入相關
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    rememberCredentials: document.getElementById('rememberCredentials'),
    loginBtn: document.getElementById('loginBtn'),
    skipLoginBtn: document.getElementById('skipLoginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    loginStatus: document.getElementById('loginStatus'),
    usernamePrefix: document.getElementById('usernamePrefix'),

    // API 設定相關
    toggleApiSettings: document.getElementById('toggleApiSettings'),
    apiSettingsSection: document.getElementById('apiSettingsSection'),
    companyDomain: document.getElementById('companyDomain'),
    loginApiUrl: document.getElementById('loginApiUrl'),
    attendanceApiUrl: document.getElementById('attendanceApiUrl'),
    saveApiSettings: document.getElementById('saveApiSettings'),
    resetApiSettings: document.getElementById('resetApiSettings'),
    
    // 時間顯示
    currentTime: document.getElementById('currentTime'),
    currentDate: document.getElementById('currentDate'),
    
    // 工作時間
    workStartTime: document.getElementById('workStartTime'),
    autoDetectBtn: document.getElementById('autoDetectBtn'),
    detectionStatus: document.getElementById('detectionStatus'),
    
    // 結果顯示
    endTime: document.getElementById('endTime'),
    remainingTime: document.getElementById('remainingTime'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    
    // 控制按鈕
    refreshBtn: document.getElementById('refreshBtn'),
    testBtn: document.getElementById('testBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    backToMainBtn: document.getElementById('backToMainBtn'),
    
    // 設定
    autoRefresh: document.getElementById('autoRefresh'),
    showNotification: document.getElementById('showNotification')
};

// 舊的事件監聽器已移除，使用新版本

// 檢查登入狀態
async function checkLoginStatus() {
    try {
        const result = await getStorage(['serverKey', 'userCredentials', 'lastLoginTime']);
        
        if (result.serverKey && result.userCredentials) {
            const lastLoginTime = result.lastLoginTime || 0;
            const now = Date.now();
            const hoursSinceLogin = (now - lastLoginTime) / (1000 * 60 * 60);
            
            // 如果超過 8 小時，嘗試重新登入
            if (hoursSinceLogin > 8) {
                await refreshServerKey(result.userCredentials);
            } else {
                currentServerKey = result.serverKey;
                userCredentials = result.userCredentials;
                showMainInterface();
            }
        } else {
            showLoginInterface();
        }
    } catch (error) {
        console.error('檢查登入狀態失敗:', error);
        showLoginInterface();
    }
}

// 顯示登入介面
function showLoginInterface() {
    elements.loginSection.classList.remove('hidden');
    elements.mainSection.classList.add('hidden');
    elements.settingsSection.classList.add('hidden');
}

// 顯示主介面
function showMainInterface() {
    elements.loginSection.classList.add('hidden');
    elements.mainSection.classList.remove('hidden');
    elements.settingsSection.classList.add('hidden');
    
    // 載入今日上班時間
    loadTodayWorkTime();
    calculateEndTime();
}

// 顯示設定介面
function showSettings() {
    elements.mainSection.classList.add('hidden');
    elements.settingsSection.classList.remove('hidden');
}

// 顯示主頁
function showMain() {
    elements.settingsSection.classList.add('hidden');
    elements.mainSection.classList.remove('hidden');
}

// 處理登入
async function handleLogin() {
    const username = elements.username.value.trim();
    const password = elements.password.value.trim();

    if (!username || !password) {
        showStatus(elements.loginStatus, '請輸入使用者名稱和密碼', 'error');
        return;
    }

    // 組合完整帳號
    const account = `${apiSettings.companyDomain}\\${username}`;

    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = '登入中...';
    showStatus(elements.loginStatus, '正在連接伺服器...', 'info');

    try {
        console.log('開始登入流程...');
        const credentials = { account, password };
        const serverKey = await loginToSystem(credentials);

        if (serverKey) {
            currentServerKey = serverKey;
            userCredentials = credentials;

            console.log('儲存登入資訊...');
            // 儲存登入資訊
            await setStorage({
                serverKey: serverKey,
                userCredentials: credentials,
                lastLoginTime: Date.now()
            });

            // 儲存帳號密碼（如果勾選記住）
            await saveCredentials(username, password);

            showStatus(elements.loginStatus, '登入成功！正在載入介面...', 'success');
            setTimeout(() => {
                showMainInterface();
            }, 1500);
        } else {
            showStatus(elements.loginStatus, '登入失敗，未取得有效的 ServerKey', 'error');
        }
    } catch (error) {
        console.error('登入錯誤:', error);

        // 根據錯誤類型提供更具體的提示
        let errorMessage = error.message;

        if (errorMessage.includes('網路連線失敗')) {
            errorMessage = '網路連線失敗，請檢查：\n1. 網路連線是否正常\n2. 是否已連接公司 VPN\n3. 防火牆設定是否正確';
        } else if (errorMessage.includes('HTTP 401') || errorMessage.includes('HTTP 403')) {
            errorMessage = '帳號或密碼錯誤，請檢查：\n1. 帳號格式是否正確 (company\\username)\n2. 密碼是否正確\n3. 帳號是否已被鎖定';
        } else if (errorMessage.includes('HTTP 500')) {
            errorMessage = '伺服器內部錯誤，請稍後再試或聯絡系統管理員';
        } else if (errorMessage.includes('帳號已暫時鎖定') || errorMessage.includes('密碼錯誤次數過多')) {
            errorMessage = '🔒 帳號已被暫時鎖定\n\n' + error.message + '\n\n建議：\n1. 等待 15 分鐘後再嘗試\n2. 確認密碼是否正確\n3. 聯絡系統管理員重置帳號';
        } else if (errorMessage.includes('帳號或密碼錯誤')) {
            errorMessage = '❌ 帳號或密碼錯誤\n\n請檢查：\n1. 帳號格式：company\\username\n2. 密碼是否正確\n3. 是否有大小寫錯誤\n\n⚠️ 注意：多次錯誤可能導致帳號鎖定';
        }

        showStatus(elements.loginStatus, errorMessage, 'error');
    } finally {
        elements.loginBtn.disabled = false;
        elements.loginBtn.textContent = '登入';
    }
}

// 處理登出
async function handleLogout() {
    try {
        console.log('開始登出...');

        // 清除 ServerKey 和登入狀態，但保留帳號密碼
        await removeStorage(['serverKey', 'userCredentials', 'lastLoginTime']);

        // 重置全域變數
        currentServerKey = null;
        userCredentials = null;

        // 清除介面資料
        elements.workStartTime.value = '';
        elements.endTime.textContent = '--:--';
        elements.remainingTime.textContent = '--:--:--';
        elements.progressFill.style.width = '0%';
        elements.progressText.textContent = '0%';

        // 清除狀態訊息
        clearStatus(elements.loginStatus);
        clearStatus(elements.detectionStatus);

        // 顯示登入介面
        showLoginInterface();

        console.log('登出完成');
        showStatus(elements.loginStatus, '已登出，帳號密碼已保留', 'info');

    } catch (error) {
        console.error('登出失敗:', error);
        showStatus(elements.loginStatus, '登出時發生錯誤：' + error.message, 'error');
    }
}

// 載入儲存的帳號密碼
async function loadSavedCredentials() {
    try {
        const result = await getStorage(['savedCredentials']);
        if (result.savedCredentials) {
            const { username, password, remember } = result.savedCredentials;
            if (remember) {
                elements.username.value = username || '';
                elements.password.value = password || '';
                elements.rememberCredentials.checked = true;
                console.log('載入儲存的帳號密碼');
            }
        }
    } catch (error) {
        console.error('載入帳號密碼失敗:', error);
    }
}

// 儲存帳號密碼
async function saveCredentials(username, password) {
    try {
        if (elements.rememberCredentials.checked) {
            const credentialsData = {
                username: username,
                password: password,
                remember: true
            };

            await setStorage({
                savedCredentials: credentialsData
            });
            console.log('帳號密碼已儲存');
        } else {
            // 如果不記住，清除儲存的帳號密碼
            await removeStorage(['savedCredentials']);
            console.log('帳號密碼已清除');
        }
    } catch (error) {
        console.error('儲存帳號密碼失敗:', error);
    }
}

// 跳過登入，直接使用測試 ServerKey
async function handleSkipLogin() {
    elements.skipLoginBtn.disabled = true;
    elements.skipLoginBtn.textContent = '載入中...';
    showStatus(elements.loginStatus, '使用測試 ServerKey 跳過登入...', 'info');

    try {
        // 使用測試用的 ServerKey
        const testServerKey = 'YOUR_TEST_SERVER_KEY_HERE';
        console.log('使用測試 ServerKey:', testServerKey);

        currentServerKey = testServerKey;
        userCredentials = {
            account: 'company\\testuser',
            password: '***'
        };

        // 儲存測試用的登入資訊
        await setStorage({
            serverKey: testServerKey,
            userCredentials: userCredentials,
            lastLoginTime: Date.now()
        });

        showStatus(elements.loginStatus, '✅ 測試模式啟用成功！正在載入介面...', 'success');

        setTimeout(() => {
            showMainInterface();
        }, 1500);

    } catch (error) {
        console.error('跳過登入失敗:', error);
        showStatus(elements.loginStatus, '跳過登入失敗：' + error.message, 'error');
    } finally {
        elements.skipLoginBtn.disabled = false;
        elements.skipLoginBtn.textContent = '跳過登入 (使用測試 Key)';
    }
}

// 登入系統
async function loginToSystem(credentials) {
    console.log('開始登入系統...');
    console.log('帳號:', credentials.account);

    const requestBody = {
        account: credentials.account,
        password: credentials.password,
        remember: false,
        type: 1
    };

    console.log('登入請求內容:', { ...requestBody, password: '***' });

    try {
        const response = await fetch(apiSettings.loginApiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('登入回應狀態:', response.status, response.statusText);

        // 先取得回應文字
        const responseText = await response.text();
        console.log('登入回應內容 (原始):', responseText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n回應內容: ${responseText}`);
        }

        // 嘗試解析 JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('登入回應內容 (解析後):', data);
        } catch (parseError) {
            console.error('JSON 解析錯誤:', parseError);
            throw new Error(`回應格式錯誤，無法解析 JSON: ${responseText}`);
        }

        // 檢查回應狀態
        if (data.statusCode === 200) {
            // 注意：API 回應中是 serverKey (大寫 K)，不是 serverkey (小寫)
            if (data.result && data.result.serverKey) {
                console.log('登入成功，取得 ServerKey:', data.result.serverKey);
                return data.result.serverKey;
            } else {
                console.error('登入回應中沒有 serverKey:', data);
                console.error('可用的 result 屬性:', Object.keys(data.result || {}));
                throw new Error('登入成功但未取得 ServerKey，請檢查 API 回應格式');
            }
        } else {
            console.error('登入失敗，狀態碼:', data.statusCode, '訊息:', data.message);
            throw new Error(data.message || `登入失敗 (狀態碼: ${data.statusCode})`);
        }

    } catch (error) {
        console.error('登入系統錯誤:', error);

        // 如果是網路錯誤
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('網路連線失敗，請檢查網路連線或 VPN 設定');
        }

        // 重新拋出錯誤
        throw error;
    }
}

// 重新整理 ServerKey
async function refreshServerKey(credentials) {
    try {
        const serverKey = await loginToSystem(credentials);
        if (serverKey) {
            currentServerKey = serverKey;
            await setStorage({
                serverKey: serverKey,
                lastLoginTime: Date.now()
            });
            return true;
        }
    } catch (error) {
        console.error('重新整理 ServerKey 失敗:', error);
        showLoginInterface();
        return false;
    }
}

// 自動偵測上班時間
async function handleAutoDetect() {
    if (!currentServerKey) {
        showStatus(elements.detectionStatus, '請先登入系統', 'error');
        return;
    }

    elements.autoDetectBtn.disabled = true;
    elements.autoDetectBtn.textContent = '偵測中...';

    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        const attendanceData = await getAttendanceInfo(dateStr, dateStr);
        const todayRecord = findTodayRecord(attendanceData);

        if (todayRecord && todayRecord.punchIn) {
            elements.workStartTime.value = todayRecord.punchIn;

            // 檢查是否有系統計算的下班時間
            if (todayRecord.punchOut) {
                console.log('使用系統計算的下班時間:', todayRecord.punchOut);
                elements.endTime.textContent = todayRecord.punchOut;
                showStatus(elements.detectionStatus, `✅ 偵測成功！\n上班：${todayRecord.punchIn}\n下班：${todayRecord.punchOut}（系統計算）`, 'success');

                // 使用系統下班時間計算剩餘時間
                const [endHours, endMinutes] = todayRecord.punchOut.split(':').map(Number);
                const endMinutesTotal = endHours * 60 + endMinutes;
                updateRemainingTime(endMinutesTotal);
            } else {
                // 沒有系統下班時間，使用我們的計算邏輯
                calculateEndTime();
                showStatus(elements.detectionStatus, `✅ 偵測成功！\n上班：${todayRecord.punchIn}\n下班：計算中...`, 'success');
            }
        } else {
            showStatus(elements.detectionStatus, '今日尚未打卡或無法取得打卡資料', 'info');
        }
    } catch (error) {
        console.error('自動偵測失敗:', error);
        showStatus(elements.detectionStatus, '偵測失敗：' + error.message, 'error');
    } finally {
        elements.autoDetectBtn.disabled = false;
        elements.autoDetectBtn.textContent = '自動偵測';
    }
}

// 取得出勤資訊
async function getAttendanceInfo(startDate, endDate) {
    const response = await fetch(apiSettings.attendanceApiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'serverkey': currentServerKey,
            'Content-Type': 'application/json'
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

    if (!response.ok) {
        throw new Error('取得出勤資訊失敗');
    }

    const data = await response.json();

    if (data.statusCode === 200) {
        return data.result;
    } else {
        throw new Error(data.message || '取得出勤資訊失敗');
    }
}

// 尋找今日記錄
function findTodayRecord(attendanceData) {
    if (!attendanceData || !attendanceData.deptItemList) {
        return null;
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    for (const dept of attendanceData.deptItemList) {
        if (dept.employeeItemList) {
            for (const employee of dept.employeeItemList) {
                if (employee.date && employee.date.includes(todayStr)) {
                    return employee;
                }
            }
        }
    }

    return null;
}

// 載入今日工作時間
async function loadTodayWorkTime() {
    try {
        const result = await getStorage(['todayWorkTime']);
        if (result.todayWorkTime) {
            const today = new Date().toDateString();
            if (result.todayWorkTime.date === today) {
                elements.workStartTime.value = result.todayWorkTime.time;
            }
        }
    } catch (error) {
        console.error('載入今日工作時間失敗:', error);
    }
}

// 儲存今日工作時間
async function saveTodayWorkTime(time) {
    try {
        const today = new Date().toDateString();
        await setStorage({
            todayWorkTime: {
                date: today,
                time: time
            }
        });
    } catch (error) {
        console.error('儲存今日工作時間失敗:', error);
    }
}

// 計算下班時間
function calculateEndTime() {
    const startTime = elements.workStartTime.value;
    if (!startTime) {
        elements.endTime.textContent = '--:--';
        elements.remainingTime.textContent = '--:--:--';
        elements.progressFill.style.width = '0%';
        elements.progressText.textContent = '0%';
        return;
    }

    // 儲存今日工作時間
    saveTodayWorkTime(startTime);

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;

    // 彈性上班制度邏輯 - 固定工作時間 9小時15分鐘
    let endMinutes;
    const workDuration = 9 * 60 + 15; // 9小時15分鐘

    if (startMinutes <= 8 * 60 + 30) { // 8:30 或之前
        endMinutes = 17 * 60 + 45; // 17:45
    } else if (startMinutes <= 9 * 60 + 30) { // 8:30 - 9:30
        // 固定工作時間：上班時間 + 9小時15分鐘
        endMinutes = startMinutes + workDuration;
    } else { // 9:30 之後
        endMinutes = 18 * 60 + 45; // 18:45
    }

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    elements.endTime.textContent = endTimeStr;

    // 計算剩餘時間和進度
    updateRemainingTime(endMinutes);
}

// 更新剩餘時間和進度
function updateRemainingTime(endMinutes) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startTime = elements.workStartTime.value;
    if (!startTime) return;

    const [startHours, startMins] = startTime.split(':').map(Number);
    const startMinutes = startHours * 60 + startMins;

    const totalWorkMinutes = endMinutes - startMinutes;
    const workedMinutes = Math.max(0, currentMinutes - startMinutes);
    const remainingMinutes = Math.max(0, endMinutes - currentMinutes);

    // 更新剩餘時間
    if (remainingMinutes > 0) {
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        const seconds = 60 - now.getSeconds();
        elements.remainingTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        elements.remainingTime.style.color = '#4facfe';
    } else {
        elements.remainingTime.textContent = '已下班！';
        elements.remainingTime.style.color = '#28a745';
    }

    // 更新進度
    const progress = Math.min(100, Math.max(0, (workedMinutes / totalWorkMinutes) * 100));
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${Math.round(progress)}%`;
}

// 開始時間更新
function startTimeUpdate() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

// 更新當前時間
function updateCurrentTime() {
    const now = new Date();

    // 更新時間顯示
    const timeStr = now.toLocaleTimeString('zh-TW', { hour12: false });
    const dateStr = now.toLocaleDateString('zh-TW');

    elements.currentTime.textContent = timeStr;
    elements.currentDate.textContent = dateStr;

    // 如果有設定上班時間，更新剩餘時間
    if (elements.workStartTime.value) {
        const [hours, minutes] = elements.workStartTime.value.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;

        let endMinutes;
        const workDuration = 9 * 60 + 15; // 9小時15分鐘

        if (startMinutes <= 8 * 60 + 30) {
            endMinutes = 17 * 60 + 45;
        } else if (startMinutes <= 9 * 60 + 30) {
            // 固定工作時間：上班時間 + 9小時15分鐘
            endMinutes = startMinutes + workDuration;
        } else {
            endMinutes = 18 * 60 + 45;
        }

        updateRemainingTime(endMinutes);
    }
}

// 處理重新整理
async function handleRefresh() {
    elements.refreshBtn.disabled = true;
    elements.refreshBtn.textContent = '🔄 重新整理中...';

    try {
        // 重新載入今日工作時間
        await loadTodayWorkTime();

        // 如果有 serverKey，嘗試自動偵測
        if (currentServerKey) {
            await handleAutoDetect();
        }

        // 重新計算下班時間
        calculateEndTime();

        showStatus(elements.detectionStatus, '重新整理完成', 'success');
    } catch (error) {
        console.error('重新整理失敗:', error);
        showStatus(elements.detectionStatus, '重新整理失敗：' + error.message, 'error');
    } finally {
        elements.refreshBtn.disabled = false;
        elements.refreshBtn.textContent = '🔄 重新整理';
    }
}

// 處理登出 (舊版本，已被新版本取代)
async function handleLogoutOld() {
    try {
        await removeStorage(['serverKey', 'userCredentials', 'lastLoginTime', 'todayWorkTime']);
        currentServerKey = null;
        userCredentials = null;

        // 清空表單
        elements.username.value = '';
        elements.password.value = '';
        elements.workStartTime.value = '09:30';

        // 停止自動重新整理
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }

        showLoginInterface();
    } catch (error) {
        console.error('登出失敗:', error);
    }
}

// 處理自動重新整理設定變更
function handleAutoRefreshChange() {
    const enabled = elements.autoRefresh.checked;

    if (enabled) {
        if (!refreshInterval) {
            refreshInterval = setInterval(async () => {
                if (currentServerKey && elements.mainSection && !elements.mainSection.classList.contains('hidden')) {
                    await handleRefresh();
                }
            }, 60000); // 每分鐘重新整理
        }
    } else {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    saveSettings();
}

// 載入設定
async function loadSettings() {
    try {
        const result = await getStorage(['autoRefresh', 'showNotification']);

        elements.autoRefresh.checked = result.autoRefresh || false;
        elements.showNotification.checked = result.showNotification || false;

        // 如果啟用自動重新整理，開始計時器
        if (result.autoRefresh) {
            handleAutoRefreshChange();
        }
    } catch (error) {
        console.error('載入設定失敗:', error);
    }
}

// 儲存設定
async function saveSettings() {
    try {
        await setStorage({
            autoRefresh: elements.autoRefresh.checked,
            showNotification: elements.showNotification.checked
        });
    } catch (error) {
        console.error('儲存設定失敗:', error);
    }
}

// 測試 API 功能
async function handleTestAPI() {
    elements.testBtn.disabled = true;
    elements.testBtn.textContent = '🧪 測試中...';

    try {
        // 使用測試用的 ServerKey 進行測試
        const testServerKey = 'YOUR_TEST_SERVER_KEY_HERE';
        console.log('使用測試 ServerKey:', testServerKey);

        currentServerKey = testServerKey;

        // 測試出勤查詢 API
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        showStatus(elements.detectionStatus, '正在測試出勤查詢 API...', 'info');

        const attendanceData = await getAttendanceInfo(dateStr, dateStr);
        const todayRecord = findTodayRecord(attendanceData);

        if (todayRecord && todayRecord.punchIn) {
            elements.workStartTime.value = todayRecord.punchIn;

            // 檢查是否有系統計算的下班時間
            if (todayRecord.punchOut) {
                console.log('使用系統計算的下班時間:', todayRecord.punchOut);
                elements.endTime.textContent = todayRecord.punchOut;
                showStatus(elements.detectionStatus, `✅ API 測試成功！\n上班：${todayRecord.punchIn}\n下班：${todayRecord.punchOut}（系統計算）`, 'success');

                // 使用系統下班時間計算剩餘時間
                const [endHours, endMinutes] = todayRecord.punchOut.split(':').map(Number);
                const endMinutesTotal = endHours * 60 + endMinutes;
                updateRemainingTime(endMinutesTotal);
            } else {
                // 沒有系統下班時間，使用我們的計算邏輯
                calculateEndTime();
                showStatus(elements.detectionStatus, `✅ API 測試成功！\n上班：${todayRecord.punchIn}\n下班：計算中...`, 'success');
            }

            // 儲存測試用的 ServerKey
            await setStorage({
                serverKey: testServerKey,
                lastLoginTime: Date.now()
            });

            showMainInterface();
        } else {
            showStatus(elements.detectionStatus, '✅ API 連接成功，但今日尚未打卡', 'info');
            showMainInterface();
        }

    } catch (error) {
        console.error('API 測試失敗:', error);
        showStatus(elements.detectionStatus, '❌ API 測試失敗：' + error.message, 'error');
    } finally {
        elements.testBtn.disabled = false;
        elements.testBtn.textContent = '🧪 測試 API';
    }
}

// 顯示狀態訊息
function showStatus(element, message, type) {
    const textElement = element.querySelector('.status-text') || element;
    const closeButton = element.querySelector('.status-close');

    textElement.textContent = message;
    element.className = `status ${type} show`;

    // 顯示關閉按鈕（錯誤訊息）
    if (closeButton) {
        closeButton.style.display = type === 'error' ? 'block' : 'none';
    }

    // 清除之前的計時器
    if (element.statusTimer) {
        clearTimeout(element.statusTimer);
    }

    // 根據訊息類型決定顯示時間
    let displayTime = 3000; // 預設 3 秒

    if (type === 'error') {
        displayTime = 10000; // 錯誤訊息顯示 10 秒
    } else if (type === 'success') {
        displayTime = 4000; // 成功訊息顯示 4 秒
    } else if (type === 'info') {
        displayTime = 5000; // 資訊訊息顯示 5 秒
    }

    // 設定新的計時器
    element.statusTimer = setTimeout(() => {
        clearStatus(element);
    }, displayTime);
}

// 清除狀態訊息
function clearStatus(element) {
    const textElement = element.querySelector('.status-text') || element;
    const closeButton = element.querySelector('.status-close');

    textElement.textContent = '';
    element.className = 'status';

    if (closeButton) {
        closeButton.style.display = 'none';
    }

    if (element.statusTimer) {
        clearTimeout(element.statusTimer);
        element.statusTimer = null;
    }
}

// 全域函數供 HTML 使用
window.clearStatus = clearStatus;

// 初始化應用程式
document.addEventListener('DOMContentLoaded', async function() {
    console.log('應用程式初始化...');

    // 載入 API 設定
    await loadApiSettings();

    // 載入應用程式設定
    await loadSettings();

    // 載入儲存的帳號密碼
    await loadSavedCredentials();

    // 檢查登入狀態
    await checkLoginStatus();

    // 設定事件監聽器
    setupEventListeners();

    // 開始時間更新
    startTimeUpdate();
});

// 設定事件監聽器
function setupEventListeners() {
    // 登入相關
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleLogin);
    }

    if (elements.skipLoginBtn) {
        elements.skipLoginBtn.addEventListener('click', handleSkipLogin);
    }

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }

    // API 設定相關
    if (elements.toggleApiSettings) {
        elements.toggleApiSettings.addEventListener('click', function() {
            elements.apiSettingsSection.classList.toggle('hidden');
            const isVisible = !elements.apiSettingsSection.classList.contains('hidden');
            this.textContent = isVisible ? '⚙️ 隱藏設定' : '⚙️ API 設定';
        });
    }

    if (elements.saveApiSettings) {
        elements.saveApiSettings.addEventListener('click', saveApiSettings);
    }

    if (elements.resetApiSettings) {
        elements.resetApiSettings.addEventListener('click', resetApiSettings);
    }

    // 公司域名變更時即時更新前綴
    if (elements.companyDomain) {
        elements.companyDomain.addEventListener('input', function() {
            const domain = this.value.trim() || 'company';
            if (elements.usernamePrefix) {
                elements.usernamePrefix.textContent = `${domain}\\`;
            }
        });
    }

    // 其他事件監聽器
    if (elements.workStartTime) {
        elements.workStartTime.addEventListener('change', calculateEndTime);
    }

    if (elements.autoDetectBtn) {
        elements.autoDetectBtn.addEventListener('click', handleAutoDetect);
    }

    if (elements.testBtn) {
        elements.testBtn.addEventListener('click', handleTestAPI);
    }

    // 其他控制按鈕
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', handleRefresh);
    }

    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', showSettings);
    }

    if (elements.backToMainBtn) {
        elements.backToMainBtn.addEventListener('click', showMain);
    }

    // 設定變更
    if (elements.autoRefresh) {
        elements.autoRefresh.addEventListener('change', handleAutoRefreshChange);
    }

    // Enter 鍵登入
    if (elements.username) {
        elements.username.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    if (elements.password) {
        elements.password.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // 設定變更
    if (elements.showNotification) {
        elements.showNotification.addEventListener('change', saveSettings);
    }
}
