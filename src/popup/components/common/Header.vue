<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  showBack?: boolean
  showLogout?: boolean
  showSettings?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  showLogout: false,
  showSettings: false
})

const emit = defineEmits<{
  logout: []
  back: []
  settings: []
}>()

const showConfirmDialog = ref(false)

const handleLogoutClick = () => {
  showConfirmDialog.value = true
}

const confirmLogout = () => {
  showConfirmDialog.value = false
  emit('logout')
}

const cancelLogout = () => {
  showConfirmDialog.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-buttons-left">
      <button
        v-if="showLogout"
        class="header-btn logout-btn"
        title="登出"
        @click="handleLogoutClick"
      >
        <i class="fas fa-sign-out-alt"></i>
      </button>
      <button
        v-if="showBack"
        class="header-btn back-btn"
        title="返回"
        @click="emit('back')"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
    </div>
    
    <div class="header-content">
      <h1>技嘉出勤追蹤器</h1>
    </div>
    
    <div class="header-buttons-right">
      <button
        v-if="showSettings"
        class="header-btn settings-btn"
        title="設定"
        @click="emit('settings')"
      >
        <i class="fas fa-cog"></i>
      </button>
    </div>

    <!-- 確認對話框 -->
    <div v-if="showConfirmDialog" class="confirm-overlay" @click.self="cancelLogout">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <i class="fas fa-question-circle confirm-icon"></i>
          <h3 class="confirm-title">確認登出</h3>
        </div>
        <div class="confirm-content">
          <p class="confirm-message">您確定要登出嗎？</p>
        </div>
        <div class="confirm-actions">
          <button class="btn-secondary confirm-cancel" @click="cancelLogout">取消</button>
          <button class="btn-secondary confirm-ok" @click="confirmLogout">確定登出</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: var(--theme-primaryGradient);
  color: var(--theme-textInverse);
  box-shadow: 0 2px 8px var(--theme-shadow);
}

.header-buttons-left,
.header-buttons-right {
  display: flex;
  gap: 8px;
  min-width: 40px;
}

.header-content {
  flex: 1;
  text-align: center;

  h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
}

.header-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: var(--theme-textInverse);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 16px;
  }
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: var(--theme-background);
  border-radius: 12px;
  padding: 24px;
  min-width: 300px;
  box-shadow: 0 8px 32px var(--theme-shadow);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .confirm-icon {
    font-size: 24px;
    color: var(--theme-warning);
  }

  .confirm-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: var(--theme-textPrimary);
  }
}

.confirm-content {
  margin-bottom: 20px;

  .confirm-message {
    color: var(--theme-textSecondary);
    margin: 0;
  }
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .confirm-cancel {
    background: var(--theme-backgroundSecondary);
    color: var(--theme-textPrimary);

    &:hover {
      background: var(--theme-border);
    }
  }

  .confirm-ok {
    background: var(--theme-primary);
    color: var(--theme-textInverse);

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>

