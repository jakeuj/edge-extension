<template>
  <button
    class="theme-toggle"
    :title="t('components.themeToggle.tooltip')"
    @click="handleToggle"
  >
    <span class="icon">{{ themeIcon }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables'

const { t } = useI18n()
const { currentTheme, toggleTheme } = useTheme()

const themeIcon = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return '☀️'
    case 'dark':
      return '🌙'
    case 'morandi':
      return '🎨'
    default:
      return '☀️'
  }
})

const handleToggle = () => {
  toggleTheme()
}
</script>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--color-background);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  .icon {
    font-size: var(--font-size-xl);
  }
}
</style>

