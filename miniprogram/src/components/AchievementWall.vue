<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { CATEGORY_ICON_MAP, getAchievementIconById } from '../utils/achievement-icons.js';
import { useI18n } from '../i18n.js';

const props = defineProps({
  onClose: Function
});
const { t } = useI18n();

const handleBack = () => {
  if (props.onClose) {
    props.onClose();
  } else {
    Actions.setView('dashboard');
  }
};

const categories = {
  GROWTH: { key: 'achievement_category_growth', icon: CATEGORY_ICON_MAP.GROWTH },
  CONSISTENCY: { key: 'achievement_category_consistency', icon: CATEGORY_ICON_MAP.CONSISTENCY },
  PRECISION: { key: 'achievement_category_precision', icon: CATEGORY_ICON_MAP.PRECISION },
  VOLUME: { key: 'achievement_category_volume', icon: CATEGORY_ICON_MAP.VOLUME },
  WEALTH: { key: 'achievement_category_wealth', icon: CATEGORY_ICON_MAP.WEALTH },
  SPECIAL: { key: 'achievement_category_special', icon: CATEGORY_ICON_MAP.SPECIAL }
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
const getIcon = (achievementId) => getAchievementIconById(achievementId);

const HIDDEN_ACHIEVEMENTS = new Set(['spec_night', 'spec_morning']);
const visibleAchievements = computed(() => {
  return achievements.value.filter((item) => {
    if (!item || !item.id) return false;
    return !HIDDEN_ACHIEVEMENTS.has(item.id) || isUnlocked(item.id);
  });
});
</script>

<template>
  <view class="achievement-page">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-content">
        <text class="header-title">{{ t('achievement_wall_title') }}</text>
        <text class="header-sub">{{ t('achievement_wall_unlocked', { count: unlockedCount, total: visibleAchievements.length }) }}</text>
      </view>
      <view class="header-placeholder"></view>
    </view>

    <view class="summary-card">
      <view class="summary-left">
        <text class="summary-kicker">{{ t('achievement_wall_progress') }}</text>
        <text class="summary-main">{{ t('achievement_wall_badges', { count: unlockedCount, total: visibleAchievements.length }) }}</text>
      </view>
      <image class="summary-icon-image" :src="getIcon('default')" mode="aspectFit" />
    </view>

    <scroll-view scroll-y class="achievement-list">
      <view v-for="(meta, categoryKey) in categories" :key="categoryKey" class="category-section">
        <view class="category-head">
          <image class="category-icon-image" :src="meta.icon" mode="aspectFit" />
          <text class="category-title">{{ t(meta.key) }}</text>
        </view>

        <view class="grid">
          <view
            v-for="ach in visibleAchievements.filter((item) => item.category === categoryKey)"
            :key="ach.id"
            class="card"
            :class="{ locked: !isUnlocked(ach.id) }"
          >
            <view class="icon-wrap">
              <image class="icon-image" :src="getIcon(ach.id)" mode="aspectFit" />
            </view>
            <text class="name">{{ ach.name }}</text>
            <text class="desc">{{ ach.description }}</text>
            <text class="state" :class="{ on: isUnlocked(ach.id) }">{{ isUnlocked(ach.id) ? t('achievement_wall_state_on') : t('achievement_wall_state_off') }}</text>
          </view>
        </view>
      </view>

      <view v-if="visibleAchievements.length === 0" class="empty">
        <text class="empty-text">{{ t('achievement_wall_empty') }}</text>
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

.summary-icon-image {
  width: 72rpx;
  height: 72rpx;
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

.category-icon-image {
  width: 34rpx;
  height: 34rpx;
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

.icon-image {
  width: 64rpx;
  height: 64rpx;
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
