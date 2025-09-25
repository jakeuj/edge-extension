// 主題管理模組 - 處理主題切換、配置和持久化儲存

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: '白色主題',
                id: 'light',
                description: '明亮清爽的白色主題',
                colors: {
                    // 主要顏色
                    primary: '#667eea',
                    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    
                    // 背景顏色
                    background: '#ffffff',
                    backgroundSecondary: '#f5f5f5',
                    backgroundCard: '#f8f9fa',
                    
                    // 文字顏色
                    textPrimary: '#333333',
                    textSecondary: '#666666',
                    textMuted: '#999999',
                    textInverse: '#ffffff',
                    
                    // 邊框顏色
                    border: '#ddd',
                    borderLight: '#e9ecef',
                    
                    // 狀態顏色
                    success: '#28a745',
                    warning: '#ffc107',
                    error: '#dc3545',
                    info: '#17a2b8',
                    
                    // 互動顏色
                    hover: 'rgba(102, 126, 234, 0.1)',
                    active: 'rgba(102, 126, 234, 0.2)',
                    
                    // 陰影
                    shadow: 'rgba(0, 0, 0, 0.1)',
                    shadowHover: 'rgba(102, 126, 234, 0.3)'
                }
            },
            dark: {
                name: '黑夜模式',
                id: 'dark',
                description: '護眼的深色主題',
                colors: {
                    // 主要顏色
                    primary: '#7c3aed',
                    primaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',

                    // 背景顏色
                    background: '#1a1a1a',
                    backgroundSecondary: '#2d2d2d',
                    backgroundCard: '#333333',

                    // 文字顏色
                    textPrimary: '#ffffff',
                    textSecondary: '#cccccc',
                    textMuted: '#888888',
                    textInverse: '#1a1a1a',

                    // 邊框顏色
                    border: '#444444',
                    borderLight: '#555555',

                    // 狀態顏色
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    info: '#06b6d4',

                    // 互動顏色
                    hover: 'rgba(124, 58, 237, 0.2)',
                    active: 'rgba(124, 58, 237, 0.3)',

                    // 陰影
                    shadow: 'rgba(0, 0, 0, 0.3)',
                    shadowHover: 'rgba(124, 58, 237, 0.4)'
                }
            },
            morandi: {
                name: '莫蘭迪色系',
                id: 'morandi',
                description: '柔和優雅的低飽和度主題',
                colors: {
                    // 主要顏色 - 柔和的藍灰色
                    primary: '#8b9dc3',
                    primaryGradient: 'linear-gradient(135deg, #8b9dc3 0%, #a8b5d1 100%)',

                    // 背景顏色 - 溫暖的米白色調
                    background: '#f7f5f3',
                    backgroundSecondary: '#f0ede8',
                    backgroundCard: '#faf8f5',

                    // 文字顏色 - 深灰色而非純黑
                    textPrimary: '#4a4a4a',
                    textSecondary: '#6b6b6b',
                    textMuted: '#9a9a9a',
                    textInverse: '#f7f5f3',

                    // 邊框顏色 - 柔和的灰色調
                    border: '#d4cfc7',
                    borderLight: '#e6e1d8',

                    // 狀態顏色 - 莫蘭迪風格的柔和色彩
                    success: '#a8c4a2',
                    warning: '#d4b896',
                    error: '#c4a2a2',
                    info: '#a2b8c4',

                    // 互動顏色 - 柔和的藍灰色調
                    hover: 'rgba(139, 157, 195, 0.15)',
                    active: 'rgba(139, 157, 195, 0.25)',

                    // 陰影 - 柔和的陰影效果
                    shadow: 'rgba(74, 74, 74, 0.08)',
                    shadowHover: 'rgba(139, 157, 195, 0.2)'
                }
            }
        };
        
        this.currentTheme = 'light';
        this.storageKey = 'selectedTheme';
        this.isInitialized = false;
    }

    // 初始化主題管理器
    async init() {
        try {
            // 從儲存中載入主題設定
            await this.loadThemeFromStorage();

            // 應用當前主題
            this.applyTheme(this.currentTheme);

            this.isInitialized = true;
            
            return true;
        } catch (error) {
            console.error('主題管理器初始化失敗:', error);
            // 使用預設主題
            this.currentTheme = 'light';
            this.applyTheme(this.currentTheme);
            return false;
        }
    }

    // 從儲存中載入主題設定
    async loadThemeFromStorage() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const data = await chrome.storage.local.get([this.storageKey]);
                const savedTheme = data[this.storageKey];
                
                if (savedTheme && this.themes[savedTheme]) {
                    this.currentTheme = savedTheme;
                }
            } else {
                // 開發環境，使用 localStorage
                const savedTheme = localStorage.getItem(this.storageKey);
                if (savedTheme && this.themes[savedTheme]) {
                    this.currentTheme = savedTheme;
                }
            }
        } catch (error) {
            console.error('載入主題設定失敗:', error);
        }
    }

    // 儲存主題設定
    async saveThemeToStorage(themeId) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({
                    [this.storageKey]: themeId
                });
            } else {
                // 開發環境，使用 localStorage
                localStorage.setItem(this.storageKey, themeId);
            }
        } catch (error) {
            console.error('儲存主題設定失敗:', error);
        }
    }

    // 切換主題
    async switchTheme(themeId) {
        if (!this.themes[themeId]) {
            console.error('未知的主題ID:', themeId);
            return false;
        }

        try {
            // 更新當前主題
            this.currentTheme = themeId;
            
            // 應用新主題
            this.applyTheme(themeId);
            
            // 儲存設定
            await this.saveThemeToStorage(themeId);
            
            // 觸發主題變更事件
            this.dispatchThemeChangeEvent(themeId);
            
            return true;
        } catch (error) {
            console.error('切換主題失敗:', error);
            return false;
        }
    }

    // 應用主題
    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) {
            console.error('主題不存在:', themeId);
            return;
        }

        const root = document.documentElement;
        
        // 設定主題ID到根元素
        root.setAttribute('data-theme', themeId);
        
        // 設定CSS變數
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });
    }

    // 取得當前主題
    getCurrentTheme() {
        return {
            id: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }

    // 取得所有可用主題
    getAllThemes() {
        return Object.values(this.themes);
    }

    // 檢查主題是否存在
    hasTheme(themeId) {
        return !!this.themes[themeId];
    }

    // 觸發主題變更事件
    dispatchThemeChangeEvent(themeId) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                themeId: themeId,
                theme: this.themes[themeId]
            }
        });
        document.dispatchEvent(event);
    }

    // 監聽主題變更事件
    onThemeChange(callback) {
        document.addEventListener('themeChanged', (event) => {
            callback(event.detail);
        });
    }

    // 取得主題預覽資訊
    getThemePreview(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return null;
        
        return {
            id: themeId,
            name: theme.name,
            description: theme.description,
            primaryColor: theme.colors.primary,
            backgroundColor: theme.colors.background,
            textColor: theme.colors.textPrimary
        };
    }

    // 重置為預設主題
    async resetToDefault() {
        return await this.switchTheme('light');
    }

    // 取得主題統計資訊
    getThemeStats() {
        return {
            totalThemes: Object.keys(this.themes).length,
            currentTheme: this.currentTheme,
            availableThemes: Object.keys(this.themes),
            isInitialized: this.isInitialized
        };
    }
}

// 全域主題管理器實例
window.themeManager = new ThemeManager();

// 確保在 DOM 載入後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager.init();
    });
} else {
    window.themeManager.init();
}
