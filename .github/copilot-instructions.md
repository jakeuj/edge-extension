# Copilot Instructions for Edge Extension Project

## Project Overview
Production-ready Microsoft Edge extension for Gigabyte employees to track attendance times and calculate flexible work schedule completion. Features complete modular architecture with popup UI, background service worker, and comprehensive testing framework.

## Core Architecture & Module System
- **Modular Design**: Five core modules with specific responsibilities
  - `PopupManager` (popup.js) - Main controller and UI orchestration
  - `AuthManager` (auth.js) - Authentication and session management  
  - `ApiManager` (api.js) - EIP system integration and data parsing
  - `TimeCalculator` (timeCalculator.js) - Flexible work schedule calculations
  - `StorageManager` (storage.js) - Chrome Storage API abstraction
- **Background Worker**: Service worker pattern with message passing for API calls
- **Async Module Loading**: Modules wait for dependencies using `waitForModules()` pattern

## Critical Business Logic: Flexible Work Schedule
```javascript
// Core time calculation rules in timeCalculator.js
flexStartTime: { hours: 8, minutes: 30 },   // 8:30 flex start
flexEndTime: { hours: 9, minutes: 30 },     // 9:30 flex end
standardWorkHours: 9, standardWorkMinutes: 15,  // 9h15m work period
earlyClockOut: { hours: 17, minutes: 45 },  // 17:45 for early arrival
lateClockOut: { hours: 18, minutes: 45 }    // 18:45 for late arrival
```
- **Before 8:30**: Work until 17:45
- **8:30-9:30**: Work exactly 9h15m (calculated dynamically)  
- **After 9:30**: Work until 18:45

## Development & Testing Workflow
1. **Extension Testing**: Load unpacked in `edge://extensions/` with developer mode
2. **API Testing**: Use `app.http` with REST Client extension for endpoint verification
3. **Integrated Testing**: Use `test/test-data.js` - run `testFunctions.runAllTests()` in popup console
4. **Hot Reload**: Click "Reload" in extensions page after code changes
5. **Debugging**: F12 in popup for frontend, check background page for service worker logs

## Authentication & API Integration Patterns
```javascript
// Domain authentication format (critical pattern)
account: "gigabyte\\username"  // Backslash required, not forward slash

// Background worker message pattern for API calls
chrome.runtime.sendMessage({
  action: 'login|getAttendance|logout',
  credentials: { account, password, remember }
});
```

## File Organization & Responsibilities
- **`manifest.json`**: Extension config with EIP domain permissions
- **`popup.html` + `styles/popup.css`**: Clean UI with status indicators and form sections
- **`background.js`**: Handles all network requests, implements auto-logout after 8 hours
- **`index.html`**: GitHub Pages landing page with full documentation
- **`tools/generate-icons.html`**: SVG to PNG icon generation utility

## Data Flow & State Management
1. **Login Flow**: popup → background worker → EIP auth → Chrome storage
2. **Data Refresh**: Scheduled updates with `refreshInterval` in PopupManager
3. **Attendance Parsing**: Extract today's data from department hierarchy in `parseTodayAttendance()`
4. **Storage Pattern**: Use Chrome Storage Local with structured keys (`isLoggedIn`, `serverKey`, `attendanceData`)

## Testing & Quality Assurance
- **Test Data**: `test/test-data.js` provides mock responses and edge cases
- **Console Testing**: Interactive testing commands available in popup dev console
- **Edge Cases**: Handle missing punch times, different time formats, network failures
- **Validation**: Account format validation, serverKey expiry, API response validation

## Deployment & Distribution
- **GitHub Pages**: `index.html` serves as project homepage at `edge.jakeuj.com`
- **Release Process**: GitHub releases with downloadable extension packages
- **Documentation**: Multi-level docs (`README.md`, `DEVELOPMENT.md`, `QUICK_START.md`)
- **CORS Handling**: Extension permissions for `geip.gigabyte.com.tw` and `eipapi.gigabyte.com.tw`

## Corporate Integration Specifics
- **Chinese Localization**: All UI text in Traditional Chinese, date formats include weekday names
- **Domain Requirements**: Windows domain authentication mandatory (`gigabyte\\username`)
- **Time Zone**: Taiwan Standard Time (UTC+8) assumed throughout
- **Session Management**: 8-hour auto-logout for security compliance