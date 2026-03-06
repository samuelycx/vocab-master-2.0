<template>
  <button
    class="ui-button"
    :class="[
      variant,
      size,
      { 
        'block': block,
        'loading': loading,
        'disabled': disabled
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <view v-if="loading" class="loading-spinner">
      <view class="spinner"></view>
    </view>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, outline, ghost
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
  },
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.ui-button:active:not(:disabled) {
  transform: scale(0.95);
}

.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.ui-button.primary {
  background: linear-gradient(135deg, #2badee, #5bcbf5);
  color: white;
  box-shadow: 0 4px 15px -3px rgba(43, 173, 238, 0.3);
}

.ui-button.secondary {
  background: #f1f5f9;
  color: #475569;
}

.ui-button.outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #64748b;
}

.ui-button.ghost {
  background: transparent;
  color: #64748b;
}

/* Sizes */
.ui-button.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.ui-button.medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.ui-button.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.ui-button.block {
  width: 100%;
}

/* Loading */
.loading-spinner {
  margin-right: 0.5rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
