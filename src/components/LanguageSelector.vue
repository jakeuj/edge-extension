<template>
  <button
    class="language-selector"
    :title="t('components.languageSelector.tooltip')"
    @click="handleToggle"
  >
    <span class="icon">{{ languageIcon }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores'
import type { LanguageType } from '@/types'

const { t, locale } = useI18n()
const settingsStore = useSettingsStore()

const languageIcon = computed(() => {
  return locale.value === 'zh-TW' ? '🇹🇼' : '🇺🇸'
})

const handleToggle = async () => {
  const newLanguage: LanguageType = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'
  locale.value = newLanguage
  
  await settingsStore.updateSettings({
    ...settingsStore.settings,
    language: newLanguage,
  })
}
</script>

<style scoped lang="scss">
.language-selector {
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

