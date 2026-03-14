<template>
  <view 
    class="ui-card"
    :class="[
      variant,
      { 
        'hoverable': hoverable,
        'clickable': clickable,
        'padding-none': noPadding
      }
    ]"
    @click="handleClick"
  >
    <view v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <text class="card-title">{{ title }}</text>
      </slot>
    </view>
    <view class="card-body" :class="{ 'no-padding': noPadding }">
      <slot />
    </view>
    <view v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup>
defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default', // default, elevated, outlined
  },
  hoverable: Boolean,
  clickable: Boolean,
  noPadding: Boolean,
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.ui-card {
  background: var(--surface, #ffffff);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.ui-card.default {
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.05);
}

.ui-card.elevated {
  box-shadow: 0 4px 20px -2px rgba(43, 173, 238, 0.1);
}

.ui-card.outlined {
  border: 1px solid rgba(43, 173, 238, 0.2);
}

.ui-card.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.12);
}

.ui-card.clickable:active {
  transform: scale(0.98);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
}

.card-body {
  padding: 1.25rem;
}

.card-body.no-padding {
  padding: 0;
}

.card-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
</style>
