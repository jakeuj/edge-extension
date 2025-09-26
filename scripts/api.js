// API 呼叫模組 - 處理與技嘉 EIP 系統的 API 通訊

class ApiManager {
    constructor() {
        this.baseUrl = 'https://eipapi.gigabyte.com.tw/GEIP_API/api';
        this.loginUrl = 'https://geip.gigabyte.com.tw/api_geip/api/auth/login';
        this.attendanceUrl = 'https://geip.gigabyte.com.tw/api_geip/api/main/attendance';
    }

    // 取得出勤資訊
    async getAttendanceInfo(serverKey, startDate = null, endDate = null) {
        try {
            if (!serverKey) {
                throw new Error('缺少認證金鑰，請重新登入');
            }

            // 如果沒有指定日期，使用今天
            const today = new Date();
            const defaultDate = this.formatDate(today);

            const requestData = {
                startDate: startDate || defaultDate,
                endDate: endDate || defaultDate,
                status: "ALL",
                employeeId: "",
                deptId: "",
                lineType: "",
                group: "",
                includeSubDept: false
            };

            // 發送請求到背景腳本
            const response = await this.sendMessage({
                action: 'getAttendance',
                serverKey: serverKey
            });

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                throw new Error(response.error || '無法取得出勤資料');
            }
        } catch (error) {
            console.error('取得出勤資訊錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 取得異常出勤資訊（可自訂天數）
    async getAbnormalAttendance(serverKey, days = null) {
        try {
            if (!serverKey) {
                throw new Error('缺少認證金鑰，請重新登入');
            }

            // 如果沒有指定天數，從設定中取得，預設為45天
            let searchDays = days;
            if (searchDays === null) {
                try {
                    const settings = await window.storageManager.getSettings();
                    searchDays = settings.data.abnormalSearchDays || 45;
                } catch (error) {
                    console.warn('無法取得設定，使用預設值45天:', error);
                    searchDays = 45;
                }
            }

            // 計算指定天數的日期範圍
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - searchDays);

            const startDateStr = this.formatDate(startDate);
            const endDateStr = this.formatDate(endDate);

            // 發送請求到背景腳本
            const response = await this.sendMessage({
                action: 'getHistoryAttendance',
                serverKey: serverKey,
                startDate: startDateStr,
                endDate: endDateStr
            });

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                throw new Error(response.error || '無法取得異常出勤資料');
            }
        } catch (error) {
            console.error('取得異常出勤資訊錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 取得歷史出勤資訊（保留原方法以維持相容性）
    async getHistoryAttendance(serverKey, startDate, endDate) {
        try {
            if (!serverKey) {
                throw new Error('缺少認證金鑰，請重新登入');
            }

            if (!startDate || !endDate) {
                throw new Error('請指定查詢日期範圍');
            }

            // 發送請求到背景腳本
            const response = await this.sendMessage({
                action: 'getHistoryAttendance',
                serverKey: serverKey,
                startDate: startDate,
                endDate: endDate
            });

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                throw new Error(response.error || '無法取得歷史出勤資料');
            }
        } catch (error) {
            console.error('取得歷史出勤資訊錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 取得今日出勤資訊（簡化版）
    async getTodayAttendance(serverKey) {
        try {
            const result = await this.getAttendanceInfo(serverKey);
            
            if (!result.success) {
                return result;
            }

            // 解析今日出勤資料
            const todayData = this.parseTodayAttendance(result.data);
            
            return {
                success: true,
                data: todayData,
                message: '今日出勤資料取得成功'
            };
        } catch (error) {
            console.error('取得今日出勤資訊錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 解析今日出勤資料
    parseTodayAttendance(attendanceData) {
        const today = new Date();
        const todayString = this.formatDateForComparison(today);
        
        let todayRecord = null;

        // 在部門列表中尋找今日記錄
        if (attendanceData && attendanceData.deptItemList) {
            for (const dept of attendanceData.deptItemList) {
                if (dept.employeeItemList) {
                    for (const employee of dept.employeeItemList) {
                        const recordDate = this.parseRecordDate(employee.date);
                        if (recordDate === todayString) {
                            todayRecord = {
                                employeeId: employee.employeeId,
                                name: employee.name,
                                date: employee.date,
                                status: employee.status,
                                punchIn: employee.punchIn,
                                punchOut: employee.punchOut,
                                leaveTime: employee.leaveTime,
                                deptName: dept.deptName
                            };
                            break;
                        }
                    }
                    if (todayRecord) break;
                }
            }
        }

        return todayRecord;
    }

    // 解析歷史出勤資料
    parseHistoryAttendance(attendanceData) {
        const historyRecords = [];

        if (attendanceData && attendanceData.deptItemList) {
            for (const dept of attendanceData.deptItemList) {
                if (dept.employeeItemList) {
                    for (const employee of dept.employeeItemList) {
                        const record = {
                            employeeId: employee.employeeId,
                            name: employee.name,
                            date: employee.date,
                            status: employee.status,
                            punchIn: employee.punchIn,
                            punchOut: employee.punchOut,
                            leaveTime: employee.leaveTime,
                            holidayPunchIn: employee.holidayPunchIn,
                            holidayPunchOut: employee.holidayPunchOut,
                            deptName: dept.deptName,
                            // 計算工作時間
                            workHours: this.calculateWorkHours(employee.punchIn, employee.punchOut),
                            // 格式化日期用於排序
                            sortDate: this.parseRecordDate(employee.date)
                        };
                        historyRecords.push(record);
                    }
                }
            }
        }

        // 按日期排序（最新的在前）
        historyRecords.sort((a, b) => {
            if (a.sortDate && b.sortDate) {
                return new Date(b.sortDate) - new Date(a.sortDate);
            }
            return 0;
        });

        return historyRecords;
    }

    // 解析異常出勤資料（只保留異常記錄）
    parseAbnormalAttendance(attendanceData) {
        const allRecords = this.parseHistoryAttendance(attendanceData);

        // 只保留狀態為「異常」的記錄
        const abnormalRecords = allRecords.filter(record => {
            return record.status === '異常';
        });

        return abnormalRecords;
    }

    // 計算工作時間
    calculateWorkHours(punchIn, punchOut) {
        if (!punchIn || !punchOut || punchIn === '--:--' || punchOut === '--:--') {
            return '--:--';
        }

        try {
            const inMinutes = this.parseTimeToMinutes(punchIn);
            const outMinutes = this.parseTimeToMinutes(punchOut);

            if (inMinutes !== null && outMinutes !== null && outMinutes > inMinutes) {
                const workMinutes = outMinutes - inMinutes;
                const hours = Math.floor(workMinutes / 60);
                const minutes = workMinutes % 60;
                return `${hours}小時${minutes}分鐘`;
            }
        } catch (error) {
            console.error('計算工作時間錯誤:', error);
        }

        return '--:--';
    }

    // 解析記錄日期格式 (2025/09/24(二) -> 2025-09-24)
    parseRecordDate(dateString) {
        if (!dateString) return null;
        
        try {
            // 提取日期部分 (移除星期)
            const datePart = dateString.split('(')[0];
            const parts = datePart.split('/');
            
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                const day = parts[2].padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (error) {
            console.error('解析日期錯誤:', error);
        }
        
        return null;
    }

    // 格式化日期為比較用格式 (YYYY-MM-DD)
    formatDateForComparison(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 格式化日期為 API 請求格式 (YYYY-MM-DD)
    formatDate(date) {
        return this.formatDateForComparison(date);
    }

    // 驗證 API 回應
    validateApiResponse(response) {
        if (!response) {
            return { valid: false, error: '無回應資料' };
        }

        if (response.statusCode !== 200) {
            return { 
                valid: false, 
                error: response.message || `API 錯誤 (狀態碼: ${response.statusCode})` 
            };
        }

        if (!response.result) {
            return { valid: false, error: '回應資料格式錯誤' };
        }

        return { valid: true };
    }

    // 處理 API 錯誤
    handleApiError(error, context = '') {
        let errorMessage = '未知錯誤';

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = '網路連線錯誤，請檢查網路連線';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = '認證失敗，請重新登入';
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
            errorMessage = '權限不足，請聯絡系統管理員';
        } else if (error.message.includes('404')) {
            errorMessage = 'API 端點不存在';
        } else if (error.message.includes('500')) {
            errorMessage = '伺服器內部錯誤，請稍後再試';
        } else if (error.message) {
            errorMessage = error.message;
        }

        if (context) {
            errorMessage = `${context}: ${errorMessage}`;
        }

        return errorMessage;
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



    // 檢查 serverKey 是否有效
    async validateServerKey(serverKey) {
        try {
            const result = await this.getTodayAttendance(serverKey);
            return result.success;
        } catch (error) {
            return false;
        }
    }

    // 取得 API 狀態資訊
    getApiStatus() {
        return {
            baseUrl: this.baseUrl,
            loginUrl: this.loginUrl,
            attendanceUrl: this.attendanceUrl,
            timestamp: new Date().toISOString()
        };
    }

    // 格式化時間顯示 (HH:MM)
    formatTime(timeString) {
        if (!timeString || timeString === '--:--' || timeString === '') {
            return '--:--';
        }

        try {
            // 確保時間格式為 HH:MM
            const parts = timeString.split(':');
            if (parts.length === 2) {
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        } catch (error) {
            console.error('格式化時間錯誤:', error);
        }

        return timeString;
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
                return hours * 60 + minutes;
            }
        } catch (error) {
            console.error('解析時間錯誤:', error);
        }

        return null;
    }

    // 將分鐘數轉換為時間字串
    minutesToTimeString(minutes) {
        if (minutes === null || minutes === undefined) {
            return '--:--';
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}

// 匯出 API 管理器實例
window.apiManager = new ApiManager();
