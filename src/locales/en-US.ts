// ============================================
// English Language File
// ============================================

export default {
  // Common
  common: {
    appName: 'Gigabyte Attendance Tracker',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    yes: 'Yes',
    no: 'No',
  },

  // Navigation
  nav: {
    home: 'Home',
    history: 'History',
    settings: 'Settings',
    logout: 'Logout',
  },

  // Login Page
  login: {
    title: 'Login',
    account: 'Account',
    password: 'Password',
    accountPlaceholder: 'gigabyte\\username',
    passwordPlaceholder: 'Enter password',
    rememberMe: 'Remember me',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    accountRequired: 'Account is required',
    passwordRequired: 'Password is required',
    accountFormatError: 'Invalid account format, use "gigabyte\\username"',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
  },

  // Home Page
  home: {
    title: 'Attendance',
    todayAttendance: 'Today\'s Attendance',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    expectedClockOut: 'Expected Clock Out',
    remainingTime: 'Remaining Time',
    workHours: 'Work Hours',
    canLeaveNow: 'You can leave now!',
    notClockedIn: 'Not clocked in',
    notClockedOut: 'Not clocked out',
    flexTimeMode: 'Flex Time',
    standardMode: 'Standard Time',
    refreshing: 'Refreshing...',
    lastUpdate: 'Last Update',
    autoRefresh: 'Auto Refresh',
  },

  // History Page
  history: {
    title: 'History',
    abnormalRecords: 'Abnormal Records',
    allRecords: 'All Records',
    date: 'Date',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    workHours: 'Hours',
    status: 'Status',
    normal: 'Normal',
    abnormal: 'Abnormal',
    leave: 'Leave',
    absent: 'Absent',
    searchDays: 'Search Days',
    days: 'days',
    noRecords: 'No records',
    loadMore: 'Load More',
  },

  // Settings Page
  settings: {
    title: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    advanced: 'Advanced',
    about: 'About',

    // General Settings
    autoRefresh: 'Auto Refresh',
    autoRefreshDesc: 'Automatically refresh attendance data',
    refreshInterval: 'Refresh Interval',
    refreshIntervalDesc: 'Auto refresh interval (seconds)',
    notifications: 'Notifications',
    notificationsDesc: 'Enable desktop notifications',
    abnormalSearchDays: 'Abnormal Search Days',
    abnormalSearchDaysDesc: 'Days to search for abnormal records',
    autoLogin: 'Auto Login',
    autoLoginDesc: 'Automatically login on startup',

    // Appearance Settings
    theme: 'Theme',
    themeLight: 'Light Theme',
    themeDark: 'Dark Theme',
    themeMorandi: 'Morandi Theme',
    language: 'Language',
    languageZhTW: '繁體中文',
    languageEnUS: 'English',

    // Advanced Settings
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Clear all local cache data',
    clearCacheConfirm: 'Are you sure you want to clear all cache?',
    clearCredentials: 'Clear Credentials',
    clearCredentialsDesc: 'Clear saved account and password',
    clearCredentialsConfirm: 'Are you sure you want to clear credentials?',
    resetSettings: 'Reset Settings',
    resetSettingsDesc: 'Reset to default settings',
    resetSettingsConfirm: 'Are you sure you want to reset all settings?',

    // About
    version: 'Version',
    developer: 'Developer',
    repository: 'Repository',
    license: 'License',
  },

  // Components
  components: {
    // Time Display
    timeDisplay: {
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
    },

    // Theme Toggle
    themeToggle: {
      tooltip: 'Toggle Theme',
    },

    // Language Selector
    languageSelector: {
      tooltip: 'Select Language',
    },
  },

  // Error Messages
  errors: {
    authRequired: 'Please login first',
    authExpired: 'Session expired, please login again',
    authFailed: 'Authentication failed',
    invalidCredentials: 'Invalid account or password',
    invalidAccountFormat: 'Invalid account format',
    invalidServerKey: 'Invalid server key',
    loginFailed: 'Login failed',
    apiError: 'API call failed',
    networkError: 'Network error',
    serverError: 'Server error',
    dataNotFound: 'Data not found',
    dataInvalid: 'Invalid data format',
    storageError: 'Storage failed',
    storageQuotaExceeded: 'Storage quota exceeded',
    encryptionFailed: 'Encryption failed',
    decryptionFailed: 'Decryption failed',
    unknownError: 'Unknown error',
  },

  // Success Messages
  success: {
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logout successful',
    dataUpdated: 'Data updated',
    settingsSaved: 'Settings saved',
    cacheCleared: 'Cache cleared',
    credentialsCleared: 'Credentials cleared',
    settingsReset: 'Settings reset',
  },

  // Flex Time Rules
  flexTime: {
    title: 'Flex Time Rules',
    rule1: 'Clock in ≤ 8:30 → Clock out at 17:45',
    rule2: 'Clock in 8:30-9:30 → Work exactly 9h 15min',
    rule3: 'Clock in > 9:30 → Clock out at 18:45',
    note1: 'Flex time window: 8:30 - 9:30',
    note2: 'Required work hours: 9h 15min',
    note3: 'Lunch break not included in work hours',
  },

  // Time Format
  time: {
    format: 'HH:mm',
    dateFormat: 'YYYY/MM/DD',
    dateTimeFormat: 'YYYY/MM/DD HH:mm',
    weekdays: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
    },
  },
}


