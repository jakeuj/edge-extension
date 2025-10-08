<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme, useStorage } from '@/composables'
import type { ThemeId } from '@/types'

const { currentTheme, switchTheme, getAllThemes } = useTheme()
const { getSettings, saveSettings } = useStorage()

const autoRefresh = ref(true)
const refreshInterval = ref(60)
const abnormalSearchDays = ref(45)
const notifications = ref(true)

const themes = getAllThemes()

onMounted(async () => {
  const settings = await getSettings()
  if (settings.success && settings.data) {
    autoRefresh.value = settings.data.autoRefresh
    refreshInterval.value = settings.data.refreshInterval / 1000 // 轉換為秒
    abnormalSearchDays.value = settings.data.abnormalSearchDays
    notifications.value = settings.data.notifications
  }
})

const handleThemeChange = async (themeId: ThemeId) => {
  await switchTheme(themeId)
}

const handleSaveSettings = async () => {
  await saveSettings({
    autoRefresh: autoRefresh.value,
    refreshInterval: refreshInterval.value * 1000, // 轉換為毫秒
    abnormalSearchDays: abnormalSearchDays.value,
    notifications: notifications.value
  })
  
  alert('設定已儲存')
}
</script>

<template>
  <div class="settings-section">
    <div class="settings-content">
      <!-- 主題設定 -->
      <div class="settings-group">
        <h3 class="settings-title">主題設定</h3>
        <div class="theme-selector">
          <div
            v-for="theme in themes"
            :key="theme.id"
            class="theme-option"
            :class="{ active: currentTheme === theme.id }"
            @click="handleThemeChange(theme.id)"
          >
            <div class="theme-preview" :style="{ background: theme.colors.primaryGradient }"></div>
            <div class="theme-info">
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-description">{{ theme.description }}</div>
            </div>
            <div v-if="currentTheme === theme.id" class="theme-check">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 自動重新整理設定 -->
      <div class="settings-group">
        <h3 class="settings-title">自動重新整理</h3>
        <div class="setting-item">
          <label class="setting-label">
            <input
              v-model="autoRefresh"
              type="checkbox"
              class="setting-checkbox"
            >
            <span>啟用自動重新整理</span>
          </label>
        </div>
        <div v-if="autoRefresh" class="setting-item">
          <label class="setting-label">重新整理間隔（秒）:</label>
          <input
            v-model.number="refreshInterval"
            type="number"
            min="10"
            max="300"
            class="setting-input"
          >
        </div>
      </div>

      <!-- 異常記錄查詢設定 -->
      <div class="settings-group">
        <h3 class="settings-title">異常記錄查詢</h3>
        <div class="setting-item">
          <label class="setting-label">查詢天數:</label>
          <input
            v-model.number="abnormalSearchDays"
            type="number"
            min="7"
            max="90"
            class="setting-input"
          >
        </div>
      </div>

      <!-- 通知設定 -->
      <div class="settings-group">
        <h3 class="settings-title">通知設定</h3>
        <div class="setting-item">
          <label class="setting-label">
            <input
              v-model="notifications"
              type="checkbox"
              class="setting-checkbox"
            >
            <span>啟用通知</span>
          </label>
        </div>
      </div>

      <!-- 儲存按鈕 -->
      <div class="settings-actions">
        <button class="btn-primary" @click="handleSaveSettings">
          儲存設定
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-group {
  background: var(--theme-backgroundCard);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--theme-shadow);
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--theme-textPrimary);
}

.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--theme-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--theme-primary);
    background: var(--theme-hover);
  }

  &.active {
    border-color: var(--theme-primary);
    background: var(--theme-hover);
  }
}

.theme-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--theme-shadow);
}

.theme-info {
  flex: 1;

  .theme-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-textPrimary);
    margin-bottom: 4px;
  }

  .theme-description {
    font-size: 12px;
    color: var(--theme-textSecondary);
  }
}

.theme-check {
  color: var(--theme-primary);
  font-size: 20px;
}

.setting-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-textSecondary);
  margin-bottom: 8px;
  cursor: pointer;
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--theme-border);
  border-radius: 6px;
  font-size: 14px;
  background: var(--theme-background);
  color: var(--theme-textPrimary);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--theme-primary);
    box-shadow: 0 0 0 3px var(--theme-hover);
  }
}

.settings-actions {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.btn-primary {
  padding: 12px 32px;
  background: var(--theme-primaryGradient);
  color: var(--theme-textInverse);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--theme-shadowHover);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>

