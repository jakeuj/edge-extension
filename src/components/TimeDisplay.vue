<template>
  <div class="time-display" :class="{ urgent: isUrgent, blinking: isBlinking }">
    <span class="time-unit">
      <span class="time-value">{{ hours }}</span>
      <span class="time-label">{{ t('components.timeDisplay.hours') }}</span>
    </span>
    <span class="time-separator">:</span>
    <span class="time-unit">
      <span class="time-value">{{ minutes }}</span>
      <span class="time-label">{{ t('components.timeDisplay.minutes') }}</span>
    </span>
    <span class="time-separator">:</span>
    <span class="time-unit">
      <span class="time-value">{{ seconds }}</span>
      <span class="time-label">{{ t('components.timeDisplay.seconds') }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  time?: number | null // 時間（秒數）
  urgent?: boolean // 是否顯示緊急狀態
  blinking?: boolean // 是否閃爍
}

const props = withDefaults(defineProps<Props>(), {
  time: null,
  urgent: false,
  blinking: false,
})

const { t } = useI18n()

const currentTime = ref(props.time || 0)
let timer: number | null = null

const hours = computed(() => {
  const h = Math.floor(Math.abs(currentTime.value) / 3600)
  return String(h).padStart(2, '0')
})

const minutes = computed(() => {
  const m = Math.floor((Math.abs(currentTime.value) % 3600) / 60)
  return String(m).padStart(2, '0')
})

const seconds = computed(() => {
  const s = Math.abs(currentTime.value) % 60
  return String(s).padStart(2, '0')
})

const isUrgent = computed(() => {
  return props.urgent || (currentTime.value > 0 && currentTime.value < 1800) // 少於 30 分鐘
})

const isBlinking = computed(() => {
  return props.blinking || (currentTime.value > 0 && currentTime.value < 300) // 少於 5 分鐘
})

const startTimer = () => {
  timer = window.setInterval(() => {
    if (currentTime.value > 0) {
      currentTime.value--
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  currentTime.value = props.time || 0
  if (currentTime.value > 0) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped lang="scss">
.time-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: 'Courier New', monospace;
  font-weight: var(--font-weight-bold);

  &.urgent {
    .time-value {
      color: var(--color-warning);
    }
  }

  &.blinking {
    animation: blink 1s infinite;
  }
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.time-value {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  line-height: 1;
}

.time-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
}

.time-separator {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  margin: 0 var(--spacing-xs);
  line-height: 1;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>

