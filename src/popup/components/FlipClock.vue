<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  time: string
}

const props = defineProps<Props>()

const timeComponents = computed(() => {
  const parts = props.time.split(':')
  
  if (parts.length === 2) {
    // MM:SS 格式
    return {
      hours: '00',
      minutes: parts[0].padStart(2, '0'),
      seconds: parts[1].padStart(2, '0')
    }
  } else if (parts.length === 3) {
    // HH:MM:SS 格式
    return {
      hours: parts[0].padStart(2, '0'),
      minutes: parts[1].padStart(2, '0'),
      seconds: parts[2].padStart(2, '0')
    }
  }
  
  return {
    hours: '00',
    minutes: '00',
    seconds: '00'
  }
})

const isOvertime = computed(() => {
  return props.time === '00:00' || props.time === '00:00:00'
})
</script>

<template>
  <div class="flip-clock-container" :class="{ overtime: isOvertime }">
    <div class="flip-clock">
      <!-- 小時 -->
      <div v-if="timeComponents.hours !== '00'" class="time-group">
        <div class="time-digit">{{ timeComponents.hours[0] }}</div>
        <div class="time-digit">{{ timeComponents.hours[1] }}</div>
        <div class="time-separator">:</div>
      </div>

      <!-- 分鐘 -->
      <div class="time-group">
        <div class="time-digit">{{ timeComponents.minutes[0] }}</div>
        <div class="time-digit">{{ timeComponents.minutes[1] }}</div>
        <div class="time-separator">:</div>
      </div>

      <!-- 秒數 -->
      <div class="time-group">
        <div class="time-digit">{{ timeComponents.seconds[0] }}</div>
        <div class="time-digit">{{ timeComponents.seconds[1] }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flip-clock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  &.overtime {
    .time-digit {
      background: var(--theme-error);
      animation: pulse 1s infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.flip-clock {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-digit {
  width: 50px;
  height: 70px;
  background: var(--theme-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 8px var(--theme-shadow);
  position: relative;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
  }
}

.time-separator {
  font-size: 32px;
  font-weight: 700;
  color: var(--theme-primary);
  margin: 0 4px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0.3;
  }
}
</style>

