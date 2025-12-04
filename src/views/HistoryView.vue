<template>
  <div class="history-view">
    <div class="history-header">
      <h1>{{ t('history.title') }}</h1>
    </div>

    <div class="history-content">
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'abnormal' }]"
          @click="activeTab = 'abnormal'"
        >
          {{ t('history.abnormalRecords') }}
        </button>
        <button
          :class="['tab', { active: activeTab === 'all' }]"
          @click="activeTab = 'all'"
        >
          {{ t('history.allRecords') }}
        </button>
      </div>

      <div class="records-list">
        <div v-if="isLoading" class="loading">
          {{ t('common.loading') }}
        </div>

        <div v-else-if="displayRecords.length === 0" class="no-records">
          {{ t('history.noRecords') }}
        </div>

        <div v-else class="records">
          <div
            v-for="record in displayRecords"
            :key="record.date"
            class="record-item"
          >
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-details">
              <div class="detail-row">
                <span class="label">{{ t('history.clockIn') }}:</span>
                <span class="value">{{ record.clockIn || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('history.clockOut') }}:</span>
                <span class="value">{{ record.clockOut || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">{{ t('history.workHours') }}:</span>
                <span class="value">{{ record.workHours || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAttendanceStore } from '@/stores'
import type { AttendanceRecord } from '@/types'

const { t } = useI18n()
const attendanceStore = useAttendanceStore()

const activeTab = ref<'abnormal' | 'all'>('abnormal')
const isLoading = ref(false)

const displayRecords = computed<AttendanceRecord[]>(() => {
  return attendanceStore.attendanceHistory || []
})

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
}

const loadRecords = async () => {
  isLoading.value = true
  try {
    if (activeTab.value === 'abnormal') {
      await attendanceStore.fetchAbnormalAttendance()
    } else {
      // 取得最近 30 天的記錄
      const endDate = new Date().toISOString().split('T')[0] || ''
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || ''
      await attendanceStore.fetchHistoryAttendance(startDate, endDate)
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
.history-view {
  padding: var(--spacing-lg);
}

.history-header {
  margin-bottom: var(--spacing-lg);

  h1 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
}

.tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);

  .tab {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: var(--font-size-md);
    transition: all 0.2s;
    margin-bottom: -2px;

    &:hover {
      color: var(--color-text-primary);
    }

    &.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
      font-weight: var(--font-weight-semibold);
    }
  }
}

.records-list {
  min-height: 200px;
}

.loading,
.no-records {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.records {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.record-item {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-primary);
}

.record-date {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);

  .label {
    color: var(--color-text-secondary);
  }

  .value {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }
}
</style>

