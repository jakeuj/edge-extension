<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth, useTheme } from '@/composables'
import Header from './components/common/Header.vue'
import LoginForm from './components/LoginForm.vue'
import AttendanceView from './components/AttendanceView.vue'
import SettingsView from './components/SettingsView.vue'
import LoadingOverlay from './components/common/LoadingOverlay.vue'
import ErrorMessage from './components/common/ErrorMessage.vue'

const { isLoggedIn, init: initAuth } = useAuth()
const { init: initTheme } = useTheme()

const currentView = ref<'login' | 'attendance' | 'settings'>('login')
const isLoading = ref(true)
const errorMsg = ref<string | null>(null)

onMounted(async () => {
  try {
    // 初始化主題
    await initTheme()
    
    // 初始化認證
    const loggedIn = await initAuth()
    
    if (loggedIn) {
      currentView.value = 'attendance'
    } else {
      currentView.value = 'login'
    }
  } catch (error) {
    console.error('初始化失敗:', error)
    errorMsg.value = '初始化失敗，請重新載入'
  } finally {
    isLoading.value = false
  }
})

const handleLoginSuccess = () => {
  currentView.value = 'attendance'
}

const handleLogout = () => {
  currentView.value = 'login'
}

const handleShowSettings = () => {
  currentView.value = 'settings'
}

const handleBackFromSettings = () => {
  currentView.value = 'attendance'
}

const hideError = () => {
  errorMsg.value = null
}
</script>

<template>
  <div class="container">
    <Header
      :show-back="currentView === 'settings'"
      :show-logout="isLoggedIn"
      :show-settings="isLoggedIn && currentView === 'attendance'"
      @logout="handleLogout"
      @back="handleBackFromSettings"
      @settings="handleShowSettings"
    />

    <LoginForm
      v-if="currentView === 'login'"
      @login-success="handleLoginSuccess"
    />

    <AttendanceView
      v-if="currentView === 'attendance'"
    />

    <SettingsView
      v-if="currentView === 'settings'"
    />

    <LoadingOverlay v-if="isLoading" />
    
    <ErrorMessage
      v-if="errorMsg"
      :message="errorMsg"
      @close="hideError"
    />
  </div>
</template>

<style scoped>
.container {
  width: 400px;
  height: 500px;
  overflow: hidden;
  background: var(--theme-background);
  color: var(--theme-textPrimary);
}
</style>

