// 時間計算模組 - 處理彈性上班制度的時間計算邏輯

class TimeCalculator {
    constructor() {
        // 彈性上班制度規則
        this.rules = {
            flexStartTime: { hours: 8, minutes: 30 }, // 8:30
            flexEndTime: { hours: 9, minutes: 30 },   // 9:30
            standardWorkHours: 9,                      // 標準工作時間 9 小時
            standardWorkMinutes: 15,                   // 額外 15 分鐘
            earlyClockOut: { hours: 17, minutes: 45 }, // 17:45
            lateClockOut: { hours: 18, minutes: 45 }   // 18:45
        };
    }

    // 計算預計下班時間
    calculateExpectedClockOut(clockInTime) {
        if (!clockInTime || clockInTime === '--:--') {
            return {
                expectedTime: '--:--',
                workingHours: 0,
                workingMinutes: 0,
                rule: 'unknown',
                description: '尚未打卡'
            };
        }

        try {
            const clockInMinutes = this.parseTimeToMinutes(clockInTime);
            if (clockInMinutes === null) {
                throw new Error('無效的上班時間格式');
            }

            const flexStartMinutes = this.timeToMinutes(this.rules.flexStartTime);
            const flexEndMinutes = this.timeToMinutes(this.rules.flexEndTime);
            
            let expectedClockOutMinutes;
            let rule;
            let description;

            if (clockInMinutes <= flexStartMinutes) {
                // 8:30 或之前上班 → 17:45 下班
                expectedClockOutMinutes = this.timeToMinutes(this.rules.earlyClockOut);
                rule = 'early';
                description = '8:30前上班，17:45下班';
            } else if (clockInMinutes <= flexEndMinutes) {
                // 8:30-9:30 之間上班 → 固定工作 9小時15分鐘
                const totalWorkMinutes = this.rules.standardWorkHours * 60 + this.rules.standardWorkMinutes;
                expectedClockOutMinutes = clockInMinutes + totalWorkMinutes;
                rule = 'flexible';
                description = '彈性時間上班，工作9小時15分鐘';
            } else {
                // 9:30 之後上班 → 18:45 下班
                expectedClockOutMinutes = this.timeToMinutes(this.rules.lateClockOut);
                rule = 'late';
                description = '9:30後上班，18:45下班';
            }

            const expectedTime = this.minutesToTimeString(expectedClockOutMinutes);
            const workingMinutes = expectedClockOutMinutes - clockInMinutes;
            const workingHours = Math.floor(workingMinutes / 60);
            const remainingMinutes = workingMinutes % 60;

            return {
                expectedTime: expectedTime,
                workingHours: workingHours,
                workingMinutes: remainingMinutes,
                totalWorkingMinutes: workingMinutes,
                rule: rule,
                description: description,
                clockInMinutes: clockInMinutes,
                expectedClockOutMinutes: expectedClockOutMinutes
            };
        } catch (error) {
            console.error('計算預計下班時間錯誤:', error);
            return {
                expectedTime: '--:--',
                workingHours: 0,
                workingMinutes: 0,
                rule: 'error',
                description: '計算錯誤: ' + error.message
            };
        }
    }

    // 計算剩餘工作時間
    calculateRemainingTime(clockInTime, currentTime = null) {
        if (!clockInTime || clockInTime === '--:--') {
            return {
                remainingTime: '--:--',
                remainingMinutes: 0,
                isOvertime: false,
                overtimeMinutes: 0,
                description: '尚未打卡'
            };
        }

        try {
            const now = currentTime || new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            
            const expectedClockOut = this.calculateExpectedClockOut(clockInTime);
            if (expectedClockOut.rule === 'error') {
                return {
                    remainingTime: '--:--',
                    remainingMinutes: 0,
                    isOvertime: false,
                    overtimeMinutes: 0,
                    description: expectedClockOut.description
                };
            }

            const remainingMinutes = expectedClockOut.expectedClockOutMinutes - currentMinutes;
            
            if (remainingMinutes > 0) {
                // 還有剩餘時間
                return {
                    remainingTime: this.minutesToTimeString(remainingMinutes),
                    remainingMinutes: remainingMinutes,
                    isOvertime: false,
                    overtimeMinutes: 0,
                    description: `還需工作 ${this.formatDuration(remainingMinutes)}`
                };
            } else {
                // 已經超過下班時間
                const overtimeMinutes = Math.abs(remainingMinutes);
                return {
                    remainingTime: '00:00',
                    remainingMinutes: 0,
                    isOvertime: true,
                    overtimeMinutes: overtimeMinutes,
                    description: `已超時 ${this.formatDuration(overtimeMinutes)}`
                };
            }
        } catch (error) {
            console.error('計算剩餘時間錯誤:', error);
            return {
                remainingTime: '--:--',
                remainingMinutes: 0,
                isOvertime: false,
                overtimeMinutes: 0,
                description: '計算錯誤: ' + error.message
            };
        }
    }

    // 分析上班時間類型
    analyzeClockInTime(clockInTime) {
        if (!clockInTime || clockInTime === '--:--') {
            return {
                type: 'none',
                description: '尚未打卡',
                isEarly: false,
                isLate: false,
                isFlexible: false
            };
        }

        try {
            const clockInMinutes = this.parseTimeToMinutes(clockInTime);
            const flexStartMinutes = this.timeToMinutes(this.rules.flexStartTime);
            const flexEndMinutes = this.timeToMinutes(this.rules.flexEndTime);

            if (clockInMinutes <= flexStartMinutes) {
                return {
                    type: 'early',
                    description: '早到上班',
                    isEarly: true,
                    isLate: false,
                    isFlexible: false
                };
            } else if (clockInMinutes <= flexEndMinutes) {
                return {
                    type: 'flexible',
                    description: '彈性時間上班',
                    isEarly: false,
                    isLate: false,
                    isFlexible: true
                };
            } else {
                return {
                    type: 'late',
                    description: '遲到上班',
                    isEarly: false,
                    isLate: true,
                    isFlexible: false
                };
            }
        } catch (error) {
            return {
                type: 'error',
                description: '時間格式錯誤',
                isEarly: false,
                isLate: false,
                isFlexible: false
            };
        }
    }

    // 取得彈性上班制度說明
    getFlexTimeRules() {
        return {
            title: '彈性上班制度規則',
            rules: [
                {
                    condition: '8:30 或之前上班',
                    result: '17:45 下班',
                    description: '早到可以早下班'
                },
                {
                    condition: '8:30 - 9:30 之間上班',
                    result: '固定工作 9小時15分鐘',
                    description: '彈性上班時間'
                },
                {
                    condition: '9:30 之後上班',
                    result: '18:45 下班',
                    description: '遲到固定下班時間'
                }
            ],
            notes: [
                '彈性上班時間：8:30 - 9:30',
                '標準工作時間：9小時15分鐘',
                '午休時間不計入工作時間'
            ]
        };
    }

    // 解析時間字串為分鐘數
    parseTimeToMinutes(timeString) {
        if (!timeString || timeString === '--:--' || timeString === '') {
            return null;
        }

        try {
            const parts = timeString.split(':');
            if (parts.length === 2) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                
                if (isNaN(hours) || isNaN(minutes)) {
                    return null;
                }
                
                return hours * 60 + minutes;
            }
        } catch (error) {
            console.error('解析時間錯誤:', error);
        }

        return null;
    }

    // 將時間物件轉換為分鐘數
    timeToMinutes(timeObj) {
        return timeObj.hours * 60 + timeObj.minutes;
    }

    // 將分鐘數轉換為時間字串
    minutesToTimeString(minutes) {
        if (minutes === null || minutes === undefined || isNaN(minutes)) {
            return '--:--';
        }

        // 處理跨日情況
        const normalizedMinutes = minutes % (24 * 60);
        const hours = Math.floor(normalizedMinutes / 60);
        const mins = normalizedMinutes % 60;
        
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // 格式化時間長度顯示
    formatDuration(minutes) {
        if (minutes === null || minutes === undefined || isNaN(minutes)) {
            return '0分鐘';
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours}小時${mins}分鐘`;
        } else if (hours > 0) {
            return `${hours}小時`;
        } else {
            return `${mins}分鐘`;
        }
    }

    // 檢查是否為工作日
    isWorkingDay(date = null) {
        const checkDate = date || new Date();
        const dayOfWeek = checkDate.getDay();
        
        // 0 = 星期日, 6 = 星期六
        return dayOfWeek >= 1 && dayOfWeek <= 5;
    }

    // 取得今日日期資訊
    getTodayInfo() {
        const today = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        
        return {
            date: today,
            dateString: this.formatDate(today),
            weekday: weekdays[today.getDay()],
            isWorkingDay: this.isWorkingDay(today),
            timestamp: today.getTime()
        };
    }

    // 格式化日期顯示
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
}

// 匯出時間計算器實例
window.timeCalculator = new TimeCalculator();
