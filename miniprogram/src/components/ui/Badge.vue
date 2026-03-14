<template>
  <view 
    class="ui-badge"
    :class="[variant, size]"
  >
    <text class="badge-text">{{ text }}</text>
    <view v-if="dot" class="badge-dot"></view>
  </view>
</template>

<script setup>
defineProps({
  text: String,
  variant: {
    type: String,
    default: 'default', // default, primary, success, warning, danger
  },
  size: {
    type: String,
    default: 'medium', // small, medium
  },
  dot: Boolean,
});
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  font-weight: 600;
}

.ui-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
}

.ui-badge.medium {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Variants */
.ui-badge.default {
  background: #f1f5f9;
  color: #64748b;
}

.ui-badge.primary {
  background: rgba(43, 173, 238, 0.1);
  color: #2badee;
}

.ui-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.ui-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.ui-badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
