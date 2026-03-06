<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';

const props = defineProps({
  onClose: Function
});

const handleBack = () => {
  if (props.onClose) {
    props.onClose();
  } else {
    Actions.setView('dashboard');
  }
};

const categories = {
  GROWTH: { label: '成长', icon: '🌱' },
  CONSISTENCY: { label: '毅力', icon: '🛡️' },
  PRECISION: { label: '技巧', icon: '🎯' },
  VOLUME: { label: '博学', icon: '📚' },
  WEALTH: { label: '财富', icon: '💰' },
  SPECIAL: { label: '特殊', icon: '🌟' }
};

const achievements = computed(() => {
  return Array.isArray(GameState.system?.achievements) ? GameState.system.achievements : [];
});

const unlockedIds = computed(() => {
  const list = Array.isArray(GameState.user?.achievements) ? GameState.user.achievements : [];
  return list
    .map((item) => item?.achievementId || item?.id)
    .filter(Boolean);
});

const isUnlocked = (achievementId) => unlockedIds.value.includes(achievementId);
const unlockedCount = computed(() => unlockedIds.value.length);
</script>

<template>
  <view class="achievement-page">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-content">
        <text class="header-title">成就墙</text>
        <text class="header-sub">已解锁 {{ unlockedCount }} / {{ achievements.length }}</text>
      </view>
      <view class="header-placeholder"></view>
    </view>

    <view class="summary-card">
      <view class="summary-left">
        <text class="summary-kicker">荣誉进度</text>
        <text class="summary-main">{{ unlockedCount }} / {{ achievements.length }} Badges</text>
      </view>
      <text class="summary-icon">🏅</text>
    </view>

    <scroll-view scroll-y class="achievement-list">
      <view v-for="(meta, categoryKey) in categories" :key="categoryKey" class="category-section">
        <view class="category-head">
          <text class="category-icon">{{ meta.icon }}</text>
          <text class="category-title">{{ meta.label }}</text>
        </view>

        <view class="grid">
          <view
            v-for="ach in achievements.filter((item) => item.category === categoryKey)"
            :key="ach.id"
            class="card"
            :class="{ locked: !isUnlocked(ach.id) }"
          >
            <view class="icon-wrap">
              <text class="icon">{{ ach.icon || '🏆' }}</text>
            </view>
            <text class="name">{{ ach.name }}</text>
            <text class="desc">{{ ach.description }}</text>
            <text class="state" :class="{ on: isUnlocked(ach.id) }">{{ isUnlocked(ach.id) ? '已解锁' : '未解锁' }}</text>
          </view>
        </view>
      </view>

      <view v-if="achievements.length === 0" class="empty">
        <text class="empty-text">暂无成就数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.achievement-page {
  min-height: 100vh;
  background: #f7f7f2;
  padding: calc(var(--header-height, 88px) + 16rpx) 28rpx 28rpx;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 36rpx;
  color: #334155;
  font-weight: 700;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #1a1a1a;
  display: block;
}

.header-sub {
  font-size: 24rpx;
  color: #64748b;
}

.header-placeholder {
  width: 72rpx;
}

.summary-card {
  border-radius: 28rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #5a459d 0%, #7b66c5 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12rpx 28rpx rgba(90, 69, 157, 0.28);
  margin-bottom: 20rpx;
}

.summary-kicker {
  color: rgba(255, 255, 255, 0.75);
  font-size: 20rpx;
  display: block;
  margin-bottom: 6rpx;
}

.summary-main {
  color: #fff;
  font-size: 34rpx;
  font-weight: 900;
}

.summary-icon {
  font-size: 52rpx;
}

.achievement-list {
  flex: 1;
}

.category-section {
  margin-bottom: 24rpx;
}

.category-head {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.category-icon {
  font-size: 30rpx;
}

.category-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #1f2937;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
}

.card {
  border-radius: 22rpx;
  background: #fff;
  border: 2rpx solid #ebe4da;
  box-shadow: 0 8rpx 16rpx rgba(20, 18, 34, 0.06);
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8rpx;
}

.card.locked {
  opacity: 0.5;
  filter: grayscale(1);
}

.icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  background: #f3edff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 46rpx;
}

.name {
  font-size: 26rpx;
  font-weight: 800;
  color: #111827;
}

.desc {
  font-size: 20rpx;
  line-height: 1.35;
  color: #64748b;
}

.state {
  margin-top: 2rpx;
  font-size: 20rpx;
  color: #94a3b8;
  font-weight: 700;
}

.state.on {
  color: #16a34a;
}

.empty {
  padding: 36rpx 0;
  text-align: center;
}

.empty-text {
  color: #94a3b8;
  font-size: 24rpx;
}
</style>
