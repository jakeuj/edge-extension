// 背景腳本 - 處理通知和定時任務

// 安裝時初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('下班時間計算器擴充套件已安裝');
    
    // 設定預設設定
    chrome.storage.local.set({
        autoRefresh: false,
        showNotification: true
    });
});

// 監聽來自 popup 的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkOffTime') {
        checkOffTimeNotification();
        sendResponse({ success: true });
    }
});

// 檢查下班時間通知
async function checkOffTimeNotification() {
    try {
        const result = await chrome.storage.local.get(['showNotification', 'todayWorkTime']);
        
        if (!result.showNotification || !result.todayWorkTime) {
            return;
        }
        
        const today = new Date().toDateString();
        if (result.todayWorkTime.date !== today) {
            return;
        }
        
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        // 計算下班時間
        const [hours, minutes] = result.todayWorkTime.time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        
        let endMinutes;
        if (startMinutes <= 8 * 60 + 30) {
            endMinutes = 15 * 60 + 45;
        } else if (startMinutes <= 9 * 60 + 30) {
            const ratio = (startMinutes - 8 * 60 - 30) / 60;
            endMinutes = (15 * 60 + 45) + ratio * (3 * 60);
        } else {
            endMinutes = 18 * 60 + 45;
        }
        
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
        
        // 檢查是否到下班時間
        if (currentMinutes >= endMinutes) {
            // 檢查是否已經發送過通知
            const lastNotificationKey = `notification_${today}`;
            const lastNotification = await chrome.storage.local.get([lastNotificationKey]);
            
            if (!lastNotification[lastNotificationKey]) {
                // 發送下班通知
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: '🎉 下班時間到了！',
                    message: `預計下班時間：${endTimeStr}\n辛苦了一天，可以下班囉！`,
                    priority: 2
                });
                
                // 記錄已發送通知
                await chrome.storage.local.set({
                    [lastNotificationKey]: true
                });
            }
        } else {
            // 檢查是否快到下班時間（提前15分鐘提醒）
            const reminderMinutes = endMinutes - 15;
            if (currentMinutes >= reminderMinutes && currentMinutes < endMinutes) {
                const reminderKey = `reminder_${today}`;
                const lastReminder = await chrome.storage.local.get([reminderKey]);
                
                if (!lastReminder[reminderKey]) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: '⏰ 快下班了！',
                        message: `還有15分鐘就下班了！\n預計下班時間：${endTimeStr}`,
                        priority: 1
                    });
                    
                    await chrome.storage.local.set({
                        [reminderKey]: true
                    });
                }
            }
        }
    } catch (error) {
        console.error('檢查下班時間通知失敗:', error);
    }
}

// 每分鐘檢查一次下班時間
setInterval(checkOffTimeNotification, 60000);

// 處理通知點擊
chrome.notifications.onClicked.addListener((notificationId) => {
    // 開啟擴充套件 popup
    chrome.action.openPopup();
    
    // 清除通知
    chrome.notifications.clear(notificationId);
});

// 清理過期的通知記錄（每天清理一次）
setInterval(async () => {
    try {
        const result = await chrome.storage.local.get();
        const today = new Date().toDateString();
        const keysToRemove = [];
        
        for (const key in result) {
            if (key.startsWith('notification_') || key.startsWith('reminder_')) {
                const keyDate = key.split('_')[1];
                if (keyDate !== today) {
                    keysToRemove.push(key);
                }
            }
        }
        
        if (keysToRemove.length > 0) {
            await chrome.storage.local.remove(keysToRemove);
            console.log('清理過期通知記錄:', keysToRemove.length, '筆');
        }
    } catch (error) {
        console.error('清理過期通知記錄失敗:', error);
    }
}, 24 * 60 * 60 * 1000); // 24小時
