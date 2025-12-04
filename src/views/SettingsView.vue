<template>
  <div class="settings-view">
    <div class="settings-header">
      <h1>{{ t('settings.title') }}</h1>
    </div>

    <div class="settings-content">
      <!-- 外觀設定 -->
      <section class="settings-section">
        <h2>{{ t('settings.appearance') }}</h2>
        
        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.theme') }}</label>
          </div>
          <div class="setting-control">
            <select v-model="selectedTheme" @change="handleThemeChange">
              <option value="light">{{ t('settings.themeLight') }}</option>
              <option value="dark">{{ t('settings.themeDark') }}</option>
              <option value="morandi">{{ t('settings.themeMorandi') }}</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.language') }}</label>
          </div>
          <div class="setting-control">
            <select v-model="selectedLanguage" @change="handleLanguageChange">
              <option value="zh-TW">{{ t('settings.languageZhTW') }}</option>
              <option value="en-US">{{ t('settings.languageEnUS') }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 一般設定 -->
      <section class="settings-section">
        <h2>{{ t('settings.general') }}</h2>
        
        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.autoRefresh') }}</label>
            <p class="setting-desc">{{ t('settings.autoRefreshDesc') }}</p>
          </div>
          <div class="setting-control">
            <input
              v-model="localSettings.autoRefresh"
              type="checkbox"
              @change="handleSettingsChange"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.refreshInterval') }}</label>
            <p class="setting-desc">{{ t('settings.refreshIntervalDesc') }}</p>
          </div>
          <div class="setting-control">
            <input
              v-model.number="localSettings.refreshInterval"
              type="number"
              min="10"
              max="300"
              @change="handleSettingsChange"
            />
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.autoLogin') }}</label>
            <p class="setting-desc">{{ t('settings.autoLoginDesc') }}</p>
          </div>
          <div class="setting-control">
            <input
              v-model="localSettings.autoLogin"
              type="checkbox"
              @change="handleSettingsChange"
            />
          </div>
        </div>
      </section>

      <!-- 進階設定 -->
      <section class="settings-section">
        <h2>{{ t('settings.advanced') }}</h2>
        
        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.clearCache') }}</label>
            <p class="setting-desc">{{ t('settings.clearCacheDesc') }}</p>
          </div>
          <div class="setting-control">
            <button class="btn-danger" @click="handleClearCache">
              {{ t('settings.clearCache') }}
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <label>{{ t('settings.resetSettings') }}</label>
            <p class="setting-desc">{{ t('settings.resetSettingsDesc') }}</p>
          </div>
          <div class="setting-control">
            <button class="btn-danger" @click="handleResetSettings">
              {{ t('settings.resetSettings') }}
            </button>
          </div>
        </div>
      </section>

      <!-- 關於 -->
      <section class="settings-section">
        <h2>{{ t('settings.about') }}</h2>
        
        <div class="about-info">
          <p><strong>{{ t('settings.version') }}:</strong> 2.0.0</p>
          <p><strong>{{ t('settings.developer') }}:</strong> Gigabyte</p>
          <p><strong>{{ t('settings.license') }}:</strong> MIT</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore, useThemeStore } from '@/stores'
import type { UserSettings, ThemeType, LanguageType } from '@/types'

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()
const themeStore = useThemeStore()

const selectedTheme = ref<ThemeType>('light')
const selectedLanguage = ref<LanguageType>('zh-TW')
const localSettings = ref<UserSettings>({ ...settingsStore.settings })

const handleThemeChange = () => {
  themeStore.setTheme(selectedTheme.value)
}

const handleLanguageChange = () => {
  locale.value = selectedLanguage.value
  localSettings.value.language = selectedLanguage.value
  handleSettingsChange()
}

const handleSettingsChange = async () => {
  await settingsStore.updateSettings(localSettings.value)
}

const handleClearCache = () => {
  if (confirm(t('settings.clearCacheConfirm'))) {
    // TODO: 實作清除快取
    alert(t('success.cacheCleared'))
  }
}

const handleResetSettings = async () => {
  if (confirm(t('settings.resetSettingsConfirm'))) {
    await settingsStore.resetToDefaults()
    localSettings.value = { ...settingsStore.settings }
    alert(t('success.settingsReset'))
  }
}

onMounted(async () => {
  await settingsStore.init()
  localSettings.value = { ...settingsStore.settings }
  selectedTheme.value = themeStore.currentTheme
  selectedLanguage.value = settingsStore.settings.language
})
</script>

<style scoped lang="scss">
.settings-view {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.settings-section {
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);

  h2 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-border);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  flex: 1;

  label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .setting-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-xs);
  }
}

.setting-control {
  select,
  input[type="number"] {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    background: var(--color-background);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.btn-danger {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;

  &:hover {
    background: var(--color-error-dark);
  }
}

.about-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.8;

  p {
    margin-bottom: var(--spacing-sm);
  }

  strong {
    color: var(--color-text-primary);
  }
}
</style>

