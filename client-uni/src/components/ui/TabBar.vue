<template>
  <view class="tab-bar">
    <view class="tab-bar-container">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: activeIndex === index }"
        @click="handleTabClick(index)"
      >
        <text class="tab-icon">
          <text>{{ activeIndex === index ? tab.activeIcon : tab.icon }}</text>
        </view>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
      
      <!-- 中央悬浮按钮 -->
      <view v-if="showCenterButton" class="center-button" @click="handleCenterClick">
        <text class="center-icon">▶</text>
      </view>
    </view>
    <view class="safe-area"></view>
  </view>
</template>

<script setup>
const props = defineProps({
  active: {
    type: Number,
    default: 0,
  },
  showCenterButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['change', 'centerClick']);

const tabs = [
  { label: '学习', icon: 'S', activeIcon: 'S' },
  { label: '排行榜', icon: 'L', activeIcon: 'L' },
  { label: '', icon: '', activeIcon: '' }, // 中央按钮占位
  { label: '社区', icon: 'C', activeIcon: 'C' },
  { label: '我的', icon: 'M', activeIcon: 'M' },
];

const activeIndex = props.active;

const handleTabClick = (index) => {
  if (index === 2) return; // 跳过中央按钮位置
  emit('change', index > 2 ? index - 1 : index);
};

const handleCenterClick = () => {
  emit('centerClick');
};
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.tab-bar-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  position: relative;
  max-width: 440px;
  margin: 0 auto;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-item.active .tab-label {
  color: #2badee;
  font-weight: 600;
}

.tab-icon {
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.tab-label {
  font-size: 0.625rem;
  color: #94a3b8;
  transition: color 0.2s ease;
}

/* 中央悬浮按钮 */
.center-button {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #2badee, #5bcbf5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px -3px rgba(43, 173, 238, 0.4);
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 4px solid white;
}

.center-button:active {
  transform: translateX(-50%) scale(0.95);
}

.center-icon {
  font-size: 1.25rem;
  color: white;
}

.safe-area {
  height: env(safe-area-inset-bottom, 0px);
}
</style>
