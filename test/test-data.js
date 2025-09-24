// 測試資料 - 用於開發和測試時模擬 API 回應

const testData = {
    // 模擬登入成功回應
    loginSuccess: {
        statusCode: 200,
        message: "",
        result: {
            serverKey: "test_server_key_12345"
        }
    },

    // 模擬登入失敗回應
    loginFailure: {
        statusCode: 401,
        message: "帳號或密碼錯誤",
        result: null
    },

    // 模擬出勤資料回應
    attendanceData: {
        statusCode: 200,
        message: "",
        result: {
            deptItemList: [
                {
                    deptId: "UI1G12",
                    deptName: "APP開發課",
                    employeeItemList: [
                        {
                            id: "0",
                            employeeId: "TA210001",
                            name: "測試使用者",
                            date: "2024/09/24(二)",
                            status: "正常",
                            punchIn: "09:15",
                            punchOut: "",
                            leaveTime: "",
                            holidayPunchIn: "",
                            holidayPunchOut: ""
                        }
                    ]
                }
            ],
            totalAmount: ""
        }
    },

    // 模擬已下班的出勤資料
    attendanceDataWithClockOut: {
        statusCode: 200,
        message: "",
        result: {
            deptItemList: [
                {
                    deptId: "UI1G12",
                    deptName: "APP開發課",
                    employeeItemList: [
                        {
                            id: "0",
                            employeeId: "TA210001",
                            name: "測試使用者",
                            date: "2024/09/24(二)",
                            status: "正常",
                            punchIn: "09:15",
                            punchOut: "18:30",
                            leaveTime: "18:35",
                            holidayPunchIn: "",
                            holidayPunchOut: ""
                        }
                    ]
                }
            ],
            totalAmount: ""
        }
    },

    // 測試不同上班時間的案例
    testCases: {
        early: {
            clockIn: "08:25",
            expectedClockOut: "17:45",
            description: "早到上班案例"
        },
        flexible1: {
            clockIn: "08:45",
            expectedClockOut: "18:00",
            description: "彈性時間上班案例1"
        },
        flexible2: {
            clockIn: "09:15",
            expectedClockOut: "18:30",
            description: "彈性時間上班案例2"
        },
        onTime: {
            clockIn: "09:30",
            expectedClockOut: "18:45",
            description: "準時上班案例"
        },
        late: {
            clockIn: "10:00",
            expectedClockOut: "18:45",
            description: "遲到上班案例"
        }
    }
};

// 測試函數
const testFunctions = {
    // 測試時間計算功能
    testTimeCalculation() {
        console.log('=== 測試時間計算功能 ===');
        
        Object.entries(testData.testCases).forEach(([key, testCase]) => {
            const result = window.timeCalculator?.calculateExpectedClockOut(testCase.clockIn);
            console.log(`${testCase.description}:`, {
                input: testCase.clockIn,
                expected: testCase.expectedClockOut,
                actual: result?.expectedTime,
                rule: result?.rule,
                description: result?.description
            });
        });
    },

    // 測試 API 資料解析
    testApiParsing() {
        console.log('=== 測試 API 資料解析 ===');
        
        const todayData = window.apiManager?.parseTodayAttendance(testData.attendanceData.result);
        console.log('今日出勤資料解析結果:', todayData);
    },

    // 測試認證功能
    async testAuth() {
        console.log('=== 測試認證功能 ===');
        
        // 測試帳號格式驗證
        const testAccounts = [
            'gigabyte\\test.user',
            'test.user',
            'gigabyte\\',
            '\\test.user',
            'gigabyte\\test\\user'
        ];

        testAccounts.forEach(account => {
            const result = window.authManager?.validateAccountFormat(account);
            console.log(`帳號格式測試 "${account}":`, result);
        });
    },

    // 測試儲存功能
    async testStorage() {
        console.log('=== 測試儲存功能 ===');
        
        try {
            // 測試儲存和讀取
            const testLoginData = {
                serverKey: 'test_key_123',
                account: 'gigabyte\\test.user',
                remember: true
            };

            const saveResult = await window.storageManager?.saveLoginInfo(testLoginData);
            console.log('儲存測試結果:', saveResult);

            const loadResult = await window.storageManager?.getLoginInfo();
            console.log('讀取測試結果:', loadResult);

        } catch (error) {
            console.error('儲存測試錯誤:', error);
        }
    },

    // 執行所有測試
    async runAllTests() {
        console.log('🧪 開始執行所有測試...');
        
        // 等待模組載入
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.testTimeCalculation();
        this.testApiParsing();
        await this.testAuth();
        await this.testStorage();
        
        console.log('✅ 所有測試執行完成');
    }
};

// 如果在瀏覽器環境中，將測試函數加到全域
if (typeof window !== 'undefined') {
    window.testData = testData;
    window.testFunctions = testFunctions;
    
    // 在控制台中提供快速測試命令
    console.log('🧪 測試工具已載入！使用以下命令進行測試：');
    console.log('- testFunctions.runAllTests() - 執行所有測試');
    console.log('- testFunctions.testTimeCalculation() - 測試時間計算');
    console.log('- testFunctions.testApiParsing() - 測試 API 解析');
    console.log('- testFunctions.testAuth() - 測試認證功能');
    console.log('- testFunctions.testStorage() - 測試儲存功能');
}

// Node.js 環境匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testData, testFunctions };
}
