<script setup lang="ts">
interface Props {
  message: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="error-message">
    <span class="error-text">{{ message }}</span>
    <button class="btn-close" @click="emit('close')">×</button>
  </div>
</template>

<style scoped lang="scss">
.error-message {
  position: fixed;
  top: 70px;
  left: 20px;
  right: 20px;
  background: var(--theme-error);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}
</style>

