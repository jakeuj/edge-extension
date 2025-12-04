<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1>{{ t('common.appName') }}</h1>
        <p class="subtitle">{{ t('login.title') }}</p>
      </div>

      <LoginForm />

      <div class="login-footer">
        <ThemeToggle />
        <LanguageSelector />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoginForm from '@/components/LoginForm.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'

const { t } = useI18n()
</script>

<style scoped lang="scss">
// 匹配原始版本的 login-section 樣式
.login-view {
  padding: 16px 20px; // 原始版本使用 16px 20px
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-background);
}

.login-container {
  width: 100%;
}

.login-header {
  margin-bottom: 12px; // 原始版本使用 12px

  h1 {
    font-size: var(--font-size-lg); // 16px，匹配原始版本 h2
    font-weight: var(--font-weight-normal);
    color: var(--color-text-primary);
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}

.login-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: 20px; // 原始版本 checkbox-group margin-bottom: 20px
}
</style>

