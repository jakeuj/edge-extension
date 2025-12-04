// ============================================
// 繁體中文語言檔
// ============================================

export default {
  // 通用
  common: {
    appName: '技嘉出勤時間追蹤器',
    confirm: '確認',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    close: '關閉',
    loading: '載入中...',
    refresh: '重新整理',
    back: '返回',
    next: '下一步',
    submit: '送出',
    reset: '重置',
    search: '搜尋',
    filter: '篩選',
    export: '匯出',
    import: '匯入',
    yes: '是',
    no: '否',
  },

  // 導航
  nav: {
    home: '首頁',
    history: '歷史記錄',
    settings: '設定',
    logout: '登出',
  },

  // 登入頁面
  login: {
    title: '登入',
    account: '帳號',
    password: '密碼',
    accountPlaceholder: 'gigabyte\\使用者名稱',
    passwordPlaceholder: '請輸入密碼',
    rememberMe: '記住密碼',
    loginButton: '登入',
    loggingIn: '登入中...',
    accountRequired: '請輸入帳號',
    passwordRequired: '請輸入密碼',
    accountFormatError: '帳號格式錯誤，請使用 "gigabyte\\使用者名稱" 格式',
    loginSuccess: '登入成功',
    loginFailed: '登入失敗',
  },

  // 首頁
  home: {
    title: '出勤資訊',
    todayAttendance: '今日出勤',
    clockIn: '上班打卡',
    clockOut: '下班打卡',
    expectedClockOut: '預計下班',
    remainingTime: '剩餘時間',
    workHours: '工作時數',
    canLeaveNow: '可以下班了！',
    notClockedIn: '尚未打卡',
    notClockedOut: '尚未下班打卡',
    flexTimeMode: '彈性上班',
    standardMode: '標準上班',
    refreshing: '更新中...',
    lastUpdate: '最後更新',
    autoRefresh: '自動更新',
  },

  // 歷史記錄頁面
  history: {
    title: '歷史記錄',
    abnormalRecords: '異常記錄',
    allRecords: '所有記錄',
    date: '日期',
    clockIn: '上班',
    clockOut: '下班',
    workHours: '工時',
    status: '狀態',
    normal: '正常',
    abnormal: '異常',
    leave: '請假',
    absent: '缺勤',
    searchDays: '查詢天數',
    days: '天',
    noRecords: '無記錄',
    loadMore: '載入更多',
  },

  // 設定頁面
  settings: {
    title: '設定',
    general: '一般設定',
    appearance: '外觀設定',
    advanced: '進階設定',
    about: '關於',

    // 一般設定
    autoRefresh: '自動更新',
    autoRefreshDesc: '自動更新出勤資訊',
    refreshInterval: '更新間隔',
    refreshIntervalDesc: '自動更新的時間間隔（秒）',
    notifications: '通知',
    notificationsDesc: '啟用桌面通知',
    abnormalSearchDays: '異常記錄查詢天數',
    abnormalSearchDaysDesc: '查詢異常記錄的天數範圍',
    autoLogin: '自動登入',
    autoLoginDesc: '啟動時自動登入',

    // 外觀設定
    theme: '主題',
    themeLight: '明亮主題',
    themeDark: '深色主題',
    themeMorandi: '莫蘭迪主題',
    language: '語言',
    languageZhTW: '繁體中文',
    languageEnUS: 'English',

    // 進階設定
    clearCache: '清除快取',
    clearCacheDesc: '清除所有本地快取資料',
    clearCacheConfirm: '確定要清除所有快取資料嗎？',
    clearCredentials: '清除憑證',
    clearCredentialsDesc: '清除儲存的帳號密碼',
    clearCredentialsConfirm: '確定要清除儲存的憑證嗎？',
    resetSettings: '重置設定',
    resetSettingsDesc: '恢復為預設設定',
    resetSettingsConfirm: '確定要重置所有設定嗎？',

    // 關於
    version: '版本',
    developer: '開發者',
    repository: '原始碼',
    license: '授權',
  },

  // 組件
  components: {
    // 時間顯示
    timeDisplay: {
      hours: '小時',
      minutes: '分鐘',
      seconds: '秒',
    },

    // 主題切換
    themeToggle: {
      tooltip: '切換主題',
    },

    // 語言選擇器
    languageSelector: {
      tooltip: '選擇語言',
    },
  },

  // 錯誤訊息
  errors: {
    authRequired: '請先登入',
    authExpired: '登入已過期，請重新登入',
    authFailed: '認證失敗',
    invalidCredentials: '帳號或密碼錯誤',
    invalidAccountFormat: '帳號格式錯誤',
    invalidServerKey: '無效的認證金鑰',
    loginFailed: '登入失敗',
    apiError: 'API 呼叫失敗',
    networkError: '網路連線錯誤',
    serverError: '伺服器錯誤',
    dataNotFound: '找不到資料',
    dataInvalid: '資料格式錯誤',
    storageError: '儲存失敗',
    storageQuotaExceeded: '儲存空間不足',
    encryptionFailed: '加密失敗',
    decryptionFailed: '解密失敗',
    unknownError: '未知錯誤',
  },

  // 成功訊息
  success: {
    loginSuccess: '登入成功',
    logoutSuccess: '登出成功',
    dataUpdated: '資料已更新',
    settingsSaved: '設定已儲存',
    cacheCleared: '快取已清除',
    credentialsCleared: '憑證已清除',
    settingsReset: '設定已重置',
  },

  // 彈性上班制度說明
  flexTime: {
    title: '彈性上班制度',
    rule1: '8:30 或之前上班 → 17:45 下班',
    rule2: '8:30 - 9:30 之間上班 → 固定工作 9小時15分鐘',
    rule3: '9:30 之後上班 → 18:45 下班',
    note1: '彈性上班時間：8:30 - 9:30',
    note2: '標準工作時間：9小時15分鐘',
    note3: '午休時間不計入工作時間',
  },

  // 時間格式
  time: {
    format: 'HH:mm',
    dateFormat: 'YYYY/MM/DD',
    dateTimeFormat: 'YYYY/MM/DD HH:mm',
    weekdays: {
      sunday: '星期日',
      monday: '星期一',
      tuesday: '星期二',
      wednesday: '星期三',
      thursday: '星期四',
      friday: '星期五',
      saturday: '星期六',
    },
  },
}
