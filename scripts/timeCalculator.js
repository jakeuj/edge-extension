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

    /**
     * 計算最佳請假策略（支援雙時段請假）
     * 根據實際打卡時間計算需要請假的時數和最佳請假區間
     *
     * 新邏輯：
     * 1. 先處理上班卡（遲到問題）- 調整到彈性時間範圍內
     * 2. 基於調整後的上班卡計算應下班時間
     * 3. 處理下班卡（早退問題）- 補足工時缺口
     *
     * @param {string} punchIn - 上班打卡時間 (HH:MM)
     * @param {string} leaveTime - 實際離開時間 (HH:MM)
     * @returns {Object} 包含請假時數和請假區間的物件
     */
    calculateLeaveStrategy(punchIn, leaveTime) {
        // 常數定義
        const BASE_START = 8 * 60 + 30;      // 08:30 = 510 分鐘（正常上班時間）
        const FLEX_END = 9 * 60 + 30;        // 09:30 = 570 分鐘（彈性上班時間上限）
        const BASE_END = 18 * 60 + 45;       // 18:45 = 1125 分鐘（正常下班時間）
        const TARGET = 555;                   // 9小時15分鐘 = 555 分鐘（目標工時）

        // 處理無效輸入
        if (!punchIn || punchIn === '--:--' || !leaveTime || leaveTime === '--:--') {
            return {
                needLeave: false,
                leaveHours: 0,
                leaveMinutes: 0,
                totalLeaveHours: 0,
                deficit: 0,
                actualDuration: 0,
                description: '打卡資料不完整',
                leaveSegments: []
            };
        }

        try {
            // Step 1: 解析時間
            const T_in = this.parseTimeToMinutes(punchIn);
            const T_out = this.parseTimeToMinutes(leaveTime);

            if (T_in === null || T_out === null) {
                return {
                    needLeave: false,
                    leaveHours: 0,
                    leaveMinutes: 0,
                    totalLeaveHours: 0,
                    deficit: 0,
                    actualDuration: 0,
                    description: '時間格式錯誤',
                    leaveSegments: []
                };
            }

            // 儲存請假時段
            const leaveSegments = [];
            let totalLeaveMinutes = 0;
            let totalWastedMinutes = 0;  // 累計因向上取整造成的浪費
            let adjustedClockIn = T_in;

            // Step 2: 處理上班卡（遲到問題）
            if (T_in > FLEX_END) {
                // 超過彈性上班時間上限，需要請假
                // 計算遲到時間（從 09:30 到實際上班時間）
                const lateMinutes = T_in - FLEX_END;
                const morningLeaveMinutes = Math.ceil(lateMinutes / 30) * 30;
                const morningWasted = morningLeaveMinutes - lateMinutes;  // 向上取整造成的浪費

                leaveSegments.push({
                    type: 'morning',
                    startTime: this.minutesToTimeString(FLEX_END),  // 固定從 09:30 開始
                    endTime: this.minutesToTimeString(T_in),
                    minutes: morningLeaveMinutes,
                    hours: morningLeaveMinutes / 60,
                    reason: '遲到補償'
                });

                totalLeaveMinutes += morningLeaveMinutes;
                totalWastedMinutes += morningWasted;
                // 調整後的上班時間為彈性上班時間上限
                adjustedClockIn = FLEX_END;
            }

            // Step 3: 基於調整後的上班卡計算應下班時間
            const expectedClockOut = adjustedClockIn + TARGET;

            // Step 4: 處理下班卡（早退問題）
            if (T_out < expectedClockOut) {
                // 早退，需要補足工時
                const afternoonDeficit = expectedClockOut - T_out;
                const afternoonLeaveMinutes = Math.ceil(afternoonDeficit / 30) * 30;
                const afternoonWasted = afternoonLeaveMinutes - afternoonDeficit;  // 向上取整造成的浪費
                const afternoonLeaveEnd = Math.min(T_out + afternoonLeaveMinutes, BASE_END);

                leaveSegments.push({
                    type: 'afternoon',
                    startTime: this.minutesToTimeString(T_out),
                    endTime: this.minutesToTimeString(afternoonLeaveEnd),
                    minutes: afternoonLeaveMinutes,
                    hours: afternoonLeaveMinutes / 60,
                    reason: '早退補償'
                });

                totalLeaveMinutes += afternoonLeaveMinutes;
                totalWastedMinutes += afternoonWasted;
            }

            // Step 5: 計算實際工作時長
            const actualDuration = T_out - T_in;  // 原始工作時長（用於顯示）

            // 如果不需要請假
            if (leaveSegments.length === 0) {
                return {
                    needLeave: false,
                    leaveHours: 0,
                    leaveMinutes: 0,
                    totalLeaveHours: 0,
                    deficit: 0,
                    actualDuration: actualDuration,
                    description: '工作時數充足，無需請假',
                    leaveSegments: []
                };
            }

            // Step 6: 計算效益分析
            const totalLeaveHours = totalLeaveMinutes / 60;
            const wastedMinutes = totalWastedMinutes;  // 因向上取整造成的浪費
            const deficit = totalLeaveMinutes - wastedMinutes;  // 實際的工時缺口（用於向後相容）

            // Step 7: 建立描述文字
            let description = '';
            if (leaveSegments.length === 1) {
                const segment = leaveSegments[0];
                description = `需請假 ${segment.hours} 小時 (${segment.startTime} - ${segment.endTime})`;
            } else if (leaveSegments.length === 2) {
                const morning = leaveSegments[0];
                const afternoon = leaveSegments[1];
                description = `需請假 ${totalLeaveHours} 小時 (上班段: ${morning.startTime} - ${morning.endTime}, 下班段: ${afternoon.startTime} - ${afternoon.endTime})`;
            }

            // 為了向後相容，保留舊的欄位
            const firstSegment = leaveSegments[0];
            const lastSegment = leaveSegments[leaveSegments.length - 1];

            return {
                needLeave: true,
                leaveHours: totalLeaveHours,
                leaveMinutes: totalLeaveMinutes,
                totalLeaveHours: totalLeaveHours,
                // 向後相容欄位（使用第一個時段）
                leaveStartTime: firstSegment.startTime,
                leaveEndTime: firstSegment.endTime,
                // 新增欄位
                leaveSegments: leaveSegments,
                deficit: deficit,
                wastedMinutes: wastedMinutes,
                actualDuration: actualDuration,
                description: description
            };

        } catch (error) {
            console.error('計算請假策略錯誤:', error);
            return {
                needLeave: false,
                leaveHours: 0,
                leaveMinutes: 0,
                totalLeaveHours: 0,
                deficit: 0,
                actualDuration: 0,
                description: '計算錯誤: ' + error.message,
                leaveSegments: []
            };
        }
    }
}

// 匯出時間計算器實例
window.timeCalculator = new TimeCalculator();
