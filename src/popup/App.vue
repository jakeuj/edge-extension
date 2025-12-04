<template>
  <div id="app" :class="`theme-${currentTheme}`">
    <div v-if="isAuthenticated" class="app-layout">
      <!-- 導航欄 -->
      <nav class="app-nav">
        <router-link to="/home" class="nav-item" active-class="active">
          <span class="icon">🏠</span>
          <span class="label">{{ t('nav.home') }}</span>
        </router-link>
        <router-link to="/history" class="nav-item" active-class="active">
          <span class="icon">📊</span>
          <span class="label">{{ t('nav.history') }}</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="active">
          <span class="icon">⚙️</span>
          <span class="label">{{ t('nav.settings') }}</span>
        </router-link>
        <button class="nav-item logout-btn" @click="handleLogout">
          <span class="icon">🚪</span>
          <span class="label">{{ t('nav.logout') }}</span>
        </button>
      </nav>

      <!-- 主要內容區 -->
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 登入頁面 -->
    <div v-else class="app-login">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth, useTheme } from '@/composables'

const router = useRouter()
const { t } = useI18n()
const { isAuthenticated, logout } = useAuth()
const { currentTheme } = useTheme()

const handleLogout = async () => {
  await logout()
  router.push({ name: 'Login' })
}

onMounted(() => {
  // 應用初始化邏輯
  console.log('App mounted')
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

#app {
  width: 400px;
  height: 500px; // 固定高度，匹配原始版本
  min-height: 500px;
  max-height: 500px;
  overflow: hidden;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  border-radius: 0 0 8px 8px; // 匹配原始版本 container
  box-shadow: 0 2px 10px var(--theme-shadow);
  position: relative;
  display: flex;
  flex-direction: column;
}

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.app-nav {
  display: flex;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--spacing-sm);
    background: transparent;
    border: none;
    border-radius: var(--border-radius-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;

    .icon {
      font-size: var(--font-size-lg);
    }

    .label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    &:hover {
      background: var(--color-background);
      color: var(--color-text-primary);
    }

    &.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: var(--font-weight-semibold);
    }

    &.logout-btn {
      color: var(--color-error);

      &:hover {
        background: var(--color-error-light);
      }
    }
  }
}

.app-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-login {
  width: 100%;
  height: 100%;
}

// 路由過渡動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

