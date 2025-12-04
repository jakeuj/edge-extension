<template>
  <div class="home-view">
    <div class="home-header">
      <h1>{{ t('home.title') }}</h1>
      <div class="header-actions">
        <button
          class="btn-refresh"
          :disabled="isRefreshing"
          @click="handleRefresh"
        >
          <span class="icon">🔄</span>
          {{ isRefreshing ? t('home.refreshing') : t('common.refresh') }}
        </button>
      </div>
    </div>

    <div class="home-content">
      <AttendanceCard />
      
      <div class="info-section">
        <p class="last-update">
          {{ t('home.lastUpdate') }}: {{ lastUpdateTime }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAttendanceStore } from '@/stores'
import AttendanceCard from '@/components/AttendanceCard.vue'

const { t } = useI18n()
const attendanceStore = useAttendanceStore()

const isRefreshing = ref(false)

const lastUpdateTime = computed(() => {
  if (!attendanceStore.lastUpdateTime) return t('home.notClockedIn')
  return new Date(attendanceStore.lastUpdateTime).toLocaleTimeString('zh-TW')
})

const handleRefresh = async () => {
  isRefreshing.value = true
  try {
    await attendanceStore.fetchTodayAttendance()
  } finally {
    isRefreshing.value = false
  }
}

// 自動更新
let autoRefreshTimer: number | null = null

const startAutoRefresh = () => {
  // 每 60 秒自動更新一次
  autoRefreshTimer = window.setInterval(() => {
    handleRefresh()
  }, 60000)
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

onMounted(async () => {
  await handleRefresh()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.home-view {
  padding: var(--spacing-lg);
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-size: var(--font-size-md);
  }
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-section {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--border-radius-md);

  .last-update {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}
</style>

