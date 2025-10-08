<script setup lang="ts">
import { computed } from 'vue'
import { useAttendance, useTimeCalculator } from '@/composables'
import FlipClock from './FlipClock.vue'

interface Props {
  isLoading?: boolean
}

defineProps<Props>()

const { todayData, expectedClockOut, remainingTime } = useAttendance()
const { getTodayInfo } = useTimeCalculator()

const todayInfo = getTodayInfo()

const displayDate = computed(() => {
  if (todayData.value?.date) {
    return todayData.value.date
  }
  return todayInfo.dateString
})

const displayClockIn = computed(() => {
  return todayData.value?.punchIn || '--:--'
})

const displayExpectedClockOut = computed(() => {
  return expectedClockOut.value || '--:--'
})
</script>

<template>
  <div class="tab-content active">
    <div class="info-card">
      <h3>今日出勤資訊</h3>

      <!-- 基本出勤資訊區塊 -->
      <div class="info-section basic-attendance">
        <div class="info-row">
          <span class="label">日期:</span>
          <span class="value">{{ displayDate }}</span>
        </div>
        <div class="info-row">
          <span class="label">上班時間:</span>
          <span class="value">{{ displayClockIn }}</span>
        </div>
        <div class="info-row">
          <span class="label">預計下班:</span>
          <span class="value">{{ displayExpectedClockOut }}</span>
        </div>
      </div>

      <!-- 剩餘時間區塊 -->
      <div class="remaining-time-section">
        <div class="remaining-time-label">剩餘時間</div>
        <FlipClock :time="remainingTime" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &.active {
    display: block;
  }
}

.info-card {
  background: var(--theme-backgroundCard);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px var(--theme-shadow);

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--theme-textPrimary);
    text-align: center;
  }
}

.info-section {
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--theme-borderLight);

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-textSecondary);
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-primary);
  }
}

.remaining-time-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--theme-borderLight);

  .remaining-time-label {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-textPrimary);
    text-align: center;
    margin-bottom: 16px;
  }
}
</style>

