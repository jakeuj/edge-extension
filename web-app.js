// 網頁版彈性上班下班時間計算器
// 簡化版本，不包含 API 整合功能

// DOM 元素
const elements = {
    workStartTime: document.getElementById('workStartTime'),
    endTime: document.getElementById('endTime'),
    remainingTime: document.getElementById('remainingTime'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    currentTime: document.getElementById('currentTime'),
    currentDate: document.getElementById('currentDate'),
    calculateBtn: document.getElementById('calculateBtn'),
    calculationStatus: document.getElementById('calculationStatus')
};

// 全域變數
let updateInterval = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 網頁版彈性上班計算器載入完成');
    
    // 設定事件監聽器
    elements.calculateBtn.addEventListener('click', calculateEndTime);
    elements.workStartTime.addEventListener('change', calculateEndTime);
    
    // 開始更新時間
    startTimeUpdate();
    
    // 初始計算
    calculateEndTime();
});

// 開始時間更新
function startTimeUpdate() {
    updateCurrentTime();
    updateInterval = setInterval(updateCurrentTime, 1000);
}

// 更新當前時間
function updateCurrentTime() {
    const now = new Date();
    
    // 更新時間顯示
    const timeString = now.toLocaleTimeString('zh-TW', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    elements.currentTime.textContent = timeString;
    
    // 更新日期顯示
    const dateString = now.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });
    elements.currentDate.textContent = dateString;
    
    // 如果有設定下班時間，更新剩餘時間
    if (elements.endTime.textContent !== '--:--') {
        updateRemainingTime();
    }
}

// 計算下班時間
function calculateEndTime() {
    const startTime = elements.workStartTime.value;
    
    if (!startTime) {
        showStatus('請選擇上班時間', 'error');
        return;
    }
    
    try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        
        // 彈性上班制度邏輯
        let endMinutes;
        let workDuration;
        
        if (startMinutes <= 8 * 60 + 30) {
            // 8:30 或之前上班 → 17:45 下班
            endMinutes = 17 * 60 + 45;
            workDuration = endMinutes - startMinutes;
        } else if (startMinutes <= 9 * 60 + 30) {
            // 8:30-9:30 之間上班 → 固定工作 9小時15分鐘
            workDuration = 9 * 60 + 15;
            endMinutes = startMinutes + workDuration;
        } else {
            // 9:30 之後上班 → 18:45 下班
            endMinutes = 18 * 60 + 45;
            workDuration = endMinutes - startMinutes;
        }
        
        // 格式化下班時間
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
        
        elements.endTime.textContent = endTimeString;
        
        // 顯示計算結果
        const workHours = Math.floor(workDuration / 60);
        const workMins = workDuration % 60;
        showStatus(`✅ 計算完成！\n上班：${startTime}\n下班：${endTimeString}\n工作時間：${workHours}小時${workMins}分鐘`, 'success');
        
        // 更新剩餘時間和進度
        updateRemainingTime();
        
        console.log(`計算結果 - 上班：${startTime}, 下班：${endTimeString}, 工作時間：${workHours}:${workMins.toString().padStart(2, '0')}`);
        
    } catch (error) {
        console.error('計算錯誤:', error);
        showStatus('計算時發生錯誤：' + error.message, 'error');
    }
}

// 更新剩餘時間和進度
function updateRemainingTime() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const endTimeStr = elements.endTime.textContent;
    if (endTimeStr === '--:--') return;
    
    const [endHours, endMins] = endTimeStr.split(':').map(Number);
    const endMinutes = endHours * 60 + endMins;
    
    const startTimeStr = elements.workStartTime.value;
    if (!startTimeStr) return;
    
    const [startHours, startMins] = startTimeStr.split(':').map(Number);
    const startMinutes = startHours * 60 + startMins;
    
    // 計算剩餘時間
    const remainingMinutes = endMinutes - currentMinutes;
    
    if (remainingMinutes <= 0) {
        elements.remainingTime.textContent = '已下班！';
        elements.progressFill.style.width = '100%';
        elements.progressText.textContent = '100%';
        elements.remainingTime.style.color = '#28a745';
    } else {
        const hours = Math.floor(remainingMinutes / 60);
        const mins = remainingMinutes % 60;
        const secs = 60 - now.getSeconds();
        
        elements.remainingTime.textContent = `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        elements.remainingTime.style.color = '#495057';
        
        // 計算進度
        const totalWorkMinutes = endMinutes - startMinutes;
        const workedMinutes = currentMinutes - startMinutes;
        const progress = Math.max(0, Math.min(100, (workedMinutes / totalWorkMinutes) * 100));
        
        elements.progressFill.style.width = `${progress}%`;
        elements.progressText.textContent = `${Math.round(progress)}%`;
    }
}

// 顯示狀態訊息
function showStatus(message, type = 'info') {
    const statusElement = elements.calculationStatus;
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    // 成功訊息 3 秒後自動隱藏
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

// 清除狀態訊息
function clearStatus() {
    elements.calculationStatus.style.display = 'none';
}

// 頁面卸載時清理
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// 導出函數供測試使用
window.FlexWorkCalculator = {
    calculateEndTime,
    updateRemainingTime,
    showStatus,
    clearStatus
};

console.log('🕐 彈性上班計算器已載入完成');
console.log('📋 計算規則：');
console.log('• 8:30 上班 → 17:45 下班');
console.log('• 9:30 上班 → 18:45 下班');
console.log('• 8:30-9:30 之間上班 → 上班時間 + 9小時15分鐘');
console.log('• 9:30 之後上班 → 18:45 下班');
