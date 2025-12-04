<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="account">{{ t('login.account') }}</label>
      <input
        id="account"
        v-model="formData.account"
        type="text"
        :placeholder="t('login.accountPlaceholder')"
        :disabled="isLoading"
        required
      />
      <span v-if="errors.account" class="error-message">
        {{ errors.account }}
      </span>
    </div>

    <div class="form-group">
      <label for="password">{{ t('login.password') }}</label>
      <input
        id="password"
        v-model="formData.password"
        type="password"
        :placeholder="t('login.passwordPlaceholder')"
        :disabled="isLoading"
        required
      />
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>

    <div class="form-group checkbox-group">
      <label>
        <input
          v-model="formData.rememberMe"
          type="checkbox"
          :disabled="isLoading"
        />
        <span>{{ t('login.rememberMe') }}</span>
      </label>
    </div>

    <div v-if="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <button
      type="submit"
      class="btn-login"
      :disabled="isLoading"
    >
      {{ isLoading ? t('login.loggingIn') : t('login.loginButton') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables'

const { t } = useI18n()
const router = useRouter()
const { login, isLoading, error } = useAuth()

const formData = reactive({
  account: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  account: '',
  password: '',
})

const errorMessage = ref('')

const validateForm = (): boolean => {
  errors.account = ''
  errors.password = ''
  errorMessage.value = ''

  if (!formData.account) {
    errors.account = t('login.accountRequired')
    return false
  }

  if (!formData.account.includes('\\')) {
    errors.account = t('login.accountFormatError')
    return false
  }

  if (!formData.password) {
    errors.password = t('login.passwordRequired')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const success = await login(
    formData.account,
    formData.password,
    formData.rememberMe
  )

  if (success) {
    router.push({ name: 'Home' })
  } else {
    errorMessage.value = error.value || t('login.loginFailed')
  }
}
</script>

<style scoped lang="scss">
// 匹配原始版本的樣式
.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 12px; // 原始版本 input-group margin-bottom

  label {
    display: block;
    margin-bottom: 4px; // 原始版本使用 4px
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary); // 原始版本使用 textSecondary
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 10px; // 原始版本使用 10px
    border: 1px solid var(--color-border);
    border-radius: 4px; // 原始版本使用 4px
    background: var(--color-background);
    color: var(--color-text-primary);
    font-size: var(--font-size-base); // 14px
    transition: all 0.3s ease; // 原始版本使用 0.3s

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-light); // 原始版本使用 2px
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &.checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px; // 原始版本使用 8px
    margin-bottom: 20px; // 原始版本使用 20px

    input[type="checkbox"] {
      width: auto;
    }

    label {
      color: var(--color-text-primary);
      margin-bottom: 0;
    }
  }
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

.error-banner {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-error-light);
  color: var(--color-error);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
}

// 匹配原始版本的 btn-primary 樣式
.btn-login {
  width: 100%; // 原始版本使用 100%
  padding: 12px; // 原始版本使用 12px
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); // 原始版本使用漸變
  color: white;
  border: none;
  border-radius: 4px; // 原始版本使用 4px
  font-size: var(--font-size-base); // 14px
  font-weight: var(--font-weight-medium); // 500
  cursor: pointer;
  transition: all 0.3s; // 原始版本使用 0.3s

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); // 原始版本的 shadowHover
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>

