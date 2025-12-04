<template>
  <div class="attendance-card">
    <div class="card-header">
      <h2>{{ t('home.todayAttendance') }}</h2>
      <span v-if="isFlexTime" class="badge">{{ t('home.flexTimeMode') }}</span>
    </div>

    <div v-if="!todayAttendance" class="no-data">
      {{ t('home.notClockedIn') }}
    </div>

    <div v-else class="card-content">
      <!-- 上班打卡時間 -->
      <div class="info-row">
        <span class="label">{{ t('home.clockIn') }}</span>
        <span class="value time">{{ todayAttendance.clockIn || '-' }}</span>
      </div>

      <!-- 下班打卡時間 -->
      <div class="info-row">
        <span class="label">{{ t('home.clockOut') }}</span>
        <span class="value time">
          {{ todayAttendance.clockOut || t('home.notClockedOut') }}
        </span>
      </div>

      <!-- 預計下班時間 -->
      <div v-if="!todayAttendance.clockOut && expectedClockOut" class="info-row highlight">
        <span class="label">{{ t('home.expectedClockOut') }}</span>
        <span class="value time-large">{{ expectedClockOut }}</span>
      </div>

      <!-- 剩餘時間 -->
      <div v-if="!todayAttendance.clockOut && remainingTime" class="info-row">
        <span class="label">{{ t('home.remainingTime') }}</span>
        <TimeDisplay :time="remainingTime" />
      </div>

      <!-- 已下班提示 -->
      <div v-if="todayAttendance.clockOut" class="info-row success">
        <span class="label">{{ t('home.workHours') }}</span>
        <span class="value">{{ workHours }}</span>
      </div>

      <!-- 可以下班提示 -->
      <div v-if="canLeaveNow && !todayAttendance.clockOut" class="can-leave-banner">
        🎉 {{ t('home.canLeaveNow') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAttendanceStore } from '@/stores'
import { useTimeCalculator } from '@/composables'
import TimeDisplay from './TimeDisplay.vue'

const { t } = useI18n()
const attendanceStore = useAttendanceStore()
const { calculateExpectedClockOut } = useTimeCalculator()

const todayAttendance = computed(() => attendanceStore.todayAttendance)

const isFlexTime = computed(() => {
  if (!todayAttendance.value?.clockIn) return false
  const clockInTime = todayAttendance.value.clockIn
  const [hours, minutes] = clockInTime.split(':').map(Number)
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0)
  const flexStart = 8 * 60 + 30 // 8:30
  const flexEnd = 9 * 60 + 30 // 9:30
  return totalMinutes > flexStart && totalMinutes <= flexEnd
})

const expectedClockOut = computed<string | null>(() => {
  if (!todayAttendance.value?.clockIn) return null
  const result = calculateExpectedClockOut(todayAttendance.value.clockIn)
  return result ?? null
})

const remainingTime = computed<number | null>(() => {
  if (!expectedClockOut.value) return null

  const now = new Date()
  const [hours, minutes] = expectedClockOut.value.split(':').map(Number)
  const expected = new Date()
  expected.setHours(hours ?? 0, minutes ?? 0, 0, 0)

  const diff = expected.getTime() - now.getTime()
  if (diff <= 0) return null

  return Math.floor(diff / 1000) // 返回秒數
})

const canLeaveNow = computed(() => {
  return remainingTime.value !== null && remainingTime.value <= 0
})

const workHours = computed<string>(() => {
  if (!todayAttendance.value?.clockIn || !todayAttendance.value?.clockOut) {
    return '-'
  }

  const clockIn = todayAttendance.value.clockIn
  const clockOut = todayAttendance.value.clockOut

  const [inHours, inMinutes] = clockIn.split(':').map(Number)
  const [outHours, outMinutes] = clockOut.split(':').map(Number)

  const inTime = (inHours ?? 0) * 60 + (inMinutes ?? 0)
  const outTime = (outHours ?? 0) * 60 + (outMinutes ?? 0)

  const totalMinutes = outTime - inTime
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes}m`
})
</script>

<style scoped lang="scss">
.attendance-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);

  h2 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
  }
}

.no-data {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;

  .label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .value {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);

    &.time {
      font-family: 'Courier New', monospace;
      font-size: var(--font-size-lg);
    }

    &.time-large {
      font-family: 'Courier New', monospace;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
    }
  }

  &.highlight {
    padding: var(--spacing-md);
    background: var(--color-primary-light);
    border-radius: var(--border-radius-md);
  }

  &.success {
    color: var(--color-success);
  }
}

.can-leave-banner {
  padding: var(--spacing-md);
  background: var(--color-success-light);
  color: var(--color-success);
  border-radius: var(--border-radius-md);
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>

