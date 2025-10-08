<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables'

const emit = defineEmits<{
  loginSuccess: []
}>()

const { login, validateAccountFormat, savedAccount } = useAuth()

const account = ref('')
const password = ref('')
const remember = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// 載入儲存的帳號
if (savedAccount.value) {
  account.value = savedAccount.value
  remember.value = true
}

const isFormValid = computed(() => {
  return account.value.trim() !== '' && password.value.trim() !== ''
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMessage.value = '請輸入帳號和密碼'
    return
  }

  // 驗證帳號格式
  const validation = validateAccountFormat(account.value)
  if (!validation.valid) {
    errorMessage.value = validation.error || '帳號格式錯誤'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await login(account.value, password.value, remember.value)

    if (result.success) {
      emit('loginSuccess')
    } else {
      errorMessage.value = result.error || '登入失敗'
    }
  } catch (error) {
    errorMessage.value = '登入時發生錯誤，請稍後再試'
    console.error('登入錯誤:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-section">
    <h2>登入系統</h2>
    <form @submit.prevent="handleSubmit">
      <div class="input-group">
        <label for="account">帳號 (域名\使用者名稱):</label>
        <input
          id="account"
          v-model="account"
          type="text"
          placeholder="gigabyte\your.username"
          required
          :disabled="isLoading"
        >
      </div>
      
      <div class="input-group">
        <label for="password">密碼:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          :disabled="isLoading"
        >
      </div>
      
      <div class="checkbox-group">
        <input
          id="remember"
          v-model="remember"
          type="checkbox"
          :disabled="isLoading"
        >
        <label for="remember">記住登入資訊</label>
      </div>

      <div v-if="errorMessage" class="error-text">
        {{ errorMessage }}
      </div>
      
      <button
        type="submit"
        class="btn-primary"
        :disabled="!isFormValid || isLoading"
      >
        {{ isLoading ? '登入中...' : '登入' }}
      </button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.login-section {
  padding: 30px 20px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    color: var(--theme-textPrimary);
    text-align: center;
  }
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-textSecondary);
  }

  input[type="text"],
  input[type="password"] {
    padding: 12px 16px;
    border: 2px solid var(--theme-border);
    border-radius: 8px;
    font-size: 14px;
    background: var(--theme-background);
    color: var(--theme-textPrimary);
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 3px var(--theme-hover);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--theme-textMuted);
    }
  }
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }

  label {
    font-size: 14px;
    color: var(--theme-textSecondary);
    cursor: pointer;
  }
}

.error-text {
  padding: 12px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid var(--theme-error);
  border-radius: 6px;
  color: var(--theme-error);
  font-size: 14px;
  text-align: center;
}

.btn-primary {
  padding: 14px 24px;
  background: var(--theme-primaryGradient);
  color: var(--theme-textInverse);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--theme-shadowHover);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>

