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

const categoryOrder = [
  { id: 'GROWTH', title: '成长 Growth' },
  { id: 'CONSISTENCY', title: '毅力 Consistency' },
  { id: 'PRECISION', title: '技巧 Precision' },
  { id: 'VOLUME', title: '博学 Volume' },
  { id: 'WEALTH', title: '财富 Wealth' },
  { id: 'SPECIAL', title: '特殊 Special' }
];

const groupedAchievements = computed(() => {
  const groups = {
    GROWTH: [],
    CONSISTENCY: [],
    PRECISION: [],
    VOLUME: [],
    WEALTH: [],
    SPECIAL: []
  };
  visibleAchievements.value.forEach((item) => {
    const key = String(item?.category || '').toUpperCase();
    if (groups[key]) groups[key].push(item);
  });
  return groups;
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
        <text class="summary-kicker">荣誉进度</text>
        <text class="summary-main">{{ unlockedCount }} 枚已点亮</text>
        <text class="summary-note">继续学习解锁更多徽章</text>
      </view>
      <view class="summary-badge">
        <view class="badge-core"></view>
        <view class="badge-ribbon"></view>
        <view class="badge-ribbon"></view>
      </view>
    </view>

    <view class="tabs">
      <view class="tab active">全部</view>
      <view class="tab">已解锁</view>
      <view class="tab">未解锁</view>
    </view>

    <scroll-view scroll-y class="achievement-list">
      <view class="category-card" v-if="visibleAchievements.length" v-for="cat in categoryOrder" :key="cat.id">
        <text class="category-title">{{ cat.title }}</text>
        <view class="category-grid">
          <view
            class="category-item"
            :class="{ unlocked: isUnlocked(ach.id), locked: !isUnlocked(ach.id) }"
            v-for="ach in groupedAchievements[cat.id]"
            :key="ach.id"
          >
            <view class="badge-wrap" :class="{ locked: !isUnlocked(ach.id) }">
              <image class="badge-icon" :class="{ locked: !isUnlocked(ach.id) }" :src="getIcon(ach.id)" mode="aspectFit" />
            </view>
            <text class="item-text" :class="{ locked: !isUnlocked(ach.id) }">{{ isUnlocked(ach.id) ? ach.name : '待解锁' }}</text>
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
  background: #F6F1E8;
  padding: calc(var(--header-height, 88px) + 108.1rpx) 41.9rpx 34.9rpx;
  display: flex;
  flex-direction: column;
  gap: 24.4rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104.7rpx;
}

.back-btn {
  width: 76.7rpx;
  height: 76.7rpx;
  background: #fff;
  border-radius: 38.4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 41.9rpx;
  color: #111111;
  font-weight: 700;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 48.8rpx;
  font-weight: 900;
  color: #111111;
  display: block;
}

.header-sub {
  font-size: 24.4rpx;
  color: #7B758B;
  font-weight: 600;
}

.header-placeholder {
  width: 76.7rpx;
}

.summary-card {
  border-radius: 41.9rpx;
  padding: 0 27.9rpx;
  height: 195.3rpx;
  background: #16171B;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-kicker {
  color: #C9F86A;
  font-size: 24.4rpx;
  font-weight: 700;
}

.summary-main {
  color: #fff;
  font-size: 55.8rpx;
  font-weight: 900;
}

.summary-note {
  color: #9CA3AF;
  font-size: 24.4rpx;
  font-weight: 600;
}

.summary-badge {
  width: 90.7rpx;
  height: 90.7rpx;
  border-radius: 27.9rpx;
  background: #FDE68A;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10.5rpx;
  flex-direction: column;
}

.badge-core {
  width: 48.8rpx;
  height: 48.8rpx;
  border-radius: 24.4rpx;
  background: #7C2D12;
}

.badge-ribbon {
  width: 10.5rpx;
  height: 17.4rpx;
  border-radius: 5.2rpx;
  background: #B45309;
}

.achievement-list {
  flex: 1;
}

.tabs {
  display: flex;
  gap: 14rpx;
  height: 73.3rpx;
}

.tab {
  flex: 0 0 auto;
  min-width: 164rpx;
  padding: 0 18rpx;
  border-radius: 36.6rpx;
  background: #EDE7DD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24.4rpx;
  font-weight: 700;
  color: #6B7280;
}

.tabs .tab:nth-child(2),
.tabs .tab:nth-child(3) {
  min-width: 181.4rpx;
}

.tab.active {
  background: #ffffff;
  color: #111111;
  font-weight: 800;
}

.category-card {
  border-radius: 34.9rpx;
  background: #ffffff;
  padding: 24.4rpx;
  height: 331.4rpx;
  display: flex;
  flex-direction: column;
  gap: 17.4rpx;
  margin-bottom: 17.4rpx;
}

.category-title {
  font-size: 34.9rpx;
  font-weight: 800;
  color: #111111;
}

.category-grid {
  display: flex;
  gap: 17.4rpx;
  flex-wrap: wrap;
}

.category-item {
  flex: 1 1 calc(50% - 8.7rpx);
  border-radius: 27.9rpx;
  background: #F4F4F5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10.5rpx;
}

.category-item.unlocked {
  background: #F3EDFF;
}

.category-item.locked {
  background: #F4F4F5;
}

.badge-wrap {
  width: 76.7rpx;
  height: 76.7rpx;
  border-radius: 24.4rpx;
  background: #DDD6FE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-wrap.locked {
  background: #E5E7EB;
}

.badge-icon {
  width: 48.8rpx;
  height: 48.8rpx;
}

.badge-icon.locked {
  filter: grayscale(1);
  opacity: 0.35;
}

.item-text {
  font-size: 24.4rpx;
  font-weight: 700;
  color: #111111;
}

.item-text.locked {
  color: #6B7280;
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
  color: #94A3B8;
  font-size: 24.4rpx;
}
</style>
