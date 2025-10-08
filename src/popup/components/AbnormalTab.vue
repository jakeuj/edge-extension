<script setup lang="ts">
import { computed } from 'vue'
import { useAttendance, useStorage } from '@/composables'

interface Props {
  isLoading?: boolean
}

defineProps<Props>()

const { abnormalData, abnormalCount } = useAttendance()
const { getSettings } = useStorage()

const infoText = computed(async () => {
  const settings = await getSettings()
  const days = settings.data?.abnormalSearchDays || 45
  return `自動查詢過去${days}天內的出勤異常記錄`
})
</script>

<template>
  <div class="tab-content active">
    <div class="abnormal-info">
      <p class="info-text">自動查詢過去45天內的出勤異常記錄</p>
    </div>

    <div v-if="abnormalCount === 0" class="no-data">
      <i class="fas fa-check-circle"></i>
      <p>太棒了！沒有異常記錄</p>
    </div>

    <div v-else class="abnormal-list">
      <div
        v-for="(record, index) in abnormalData"
        :key="index"
        class="abnormal-item"
      >
        <div class="abnormal-header">
          <span class="abnormal-date">{{ record.date }}</span>
          <span class="abnormal-status">{{ record.status }}</span>
        </div>
        <div class="abnormal-details">
          <div class="detail-row">
            <span class="detail-label">上班:</span>
            <span class="detail-value">{{ record.punchIn }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">下班:</span>
            <span class="detail-value">{{ record.punchOut }}</span>
          </div>
          <div v-if="record.workHours !== '--:--'" class="detail-row">
            <span class="detail-label">工時:</span>
            <span class="detail-value">{{ record.workHours }}</span>
          </div>
        </div>
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

.abnormal-info {
  background: var(--theme-info);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;

  .info-text {
    margin: 0;
    font-size: 14px;
    text-align: center;
  }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--theme-success);

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
}

.abnormal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.abnormal-item {
  background: var(--theme-backgroundCard);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid var(--theme-error);
  box-shadow: 0 2px 4px var(--theme-shadow);
}

.abnormal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--theme-borderLight);

  .abnormal-date {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-textPrimary);
  }

  .abnormal-status {
    font-size: 12px;
    font-weight: 600;
    color: white;
    background: var(--theme-error);
    padding: 4px 12px;
    border-radius: 12px;
  }
}

.abnormal-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .detail-label {
    font-size: 13px;
    color: var(--theme-textSecondary);
  }

  .detail-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-textPrimary);
  }
}
</style>

