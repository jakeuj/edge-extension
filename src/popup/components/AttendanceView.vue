<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth, useAttendance, useStorage } from '@/composables'
import TodayTab from './TodayTab.vue'
import AbnormalTab from './AbnormalTab.vue'

const { getServerKey } = useAuth()
const { loadTodayAttendance, loadAbnormalAttendance, updateRemainingTime, abnormalCount } = useAttendance()
const { getSettings } = useStorage()

const currentTab = ref<'today' | 'abnormal'>('today')
const isLoading = ref(false)
const autoRefreshInterval = ref<number | null>(null)

onMounted(async () => {
  await loadData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

const loadData = async () => {
  const serverKey = getServerKey.value
  if (!serverKey) return

  isLoading.value = true

  try {
    // 載入今日出勤
    await loadTodayAttendance(serverKey)

    // 載入異常記錄
    const settings = await getSettings()
    const days = settings.data?.abnormalSearchDays || 45
    await loadAbnormalAttendance(serverKey, days)
  } catch (error) {
    console.error('載入出勤資料失敗:', error)
  } finally {
    isLoading.value = false
  }
}

const startAutoRefresh = async () => {
  const settings = await getSettings()
  const autoRefresh = settings.data?.autoRefresh ?? true
  const refreshInterval = settings.data?.refreshInterval || 60000

  if (autoRefresh) {
    // 每分鐘更新剩餘時間
    autoRefreshInterval.value = window.setInterval(() => {
      updateRemainingTime()
    }, 1000) // 每秒更新

    // 定期重新載入資料
    window.setInterval(() => {
      loadData()
    }, refreshInterval)
  }
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

const switchTab = (tab: 'today' | 'abnormal') => {
  currentTab.value = tab
}
</script>

<template>
  <div class="attendance-section">
    <!-- 選項卡導航 -->
    <div class="tab-navigation">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'today' }"
        @click="switchTab('today')"
      >
        <span class="tab-text">今日出勤</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'abnormal' }"
        @click="switchTab('abnormal')"
      >
        <span class="tab-text">出勤異常</span>
        <span v-if="abnormalCount > 0" class="badge">
          <span class="badge-count">{{ abnormalCount }}</span>
        </span>
      </button>
    </div>

    <!-- 今日出勤內容 -->
    <TodayTab v-if="currentTab === 'today'" :is-loading="isLoading" />

    <!-- 出勤異常內容 -->
    <AbnormalTab v-if="currentTab === 'abnormal'" :is-loading="isLoading" />
  </div>
</template>

<style scoped lang="scss">
.attendance-section {
  display: flex;
  flex-direction: column;
  height: calc(100% - 66px); // 扣除 header 高度
}

.tab-navigation {
  display: flex;
  background: var(--theme-backgroundSecondary);
  border-bottom: 2px solid var(--theme-border);
}

.tab-btn {
  flex: 1;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .tab-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--theme-textSecondary);
    transition: color 0.3s ease;
  }

  &.active {
    background: var(--theme-background);

    .tab-text {
      color: var(--theme-primary);
      font-weight: 600;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--theme-primary);
    }
  }

  &:hover:not(.active) {
    background: var(--theme-hover);
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--theme-error);
  border-radius: 10px;

  .badge-count {
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
}
</style>

