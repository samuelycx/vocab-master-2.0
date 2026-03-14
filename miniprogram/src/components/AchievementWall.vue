<script setup>
import { computed, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { CATEGORY_ICON_MAP, getAchievementIconById } from '../utils/achievement-icons.js';
import { useI18n } from '../i18n.js';

const props = defineProps({
  onClose: Function
});
const { t } = useI18n();
const activeTab = ref('all');

const handleBack = () => {
  if (props.onClose) {
    props.onClose();
  } else {
    Actions.setView('dashboard');
  }
};

const categories = {
  GROWTH: { key: 'achievement_category_growth', label: 'Growth', icon: CATEGORY_ICON_MAP.GROWTH },
  CONSISTENCY: { key: 'achievement_category_consistency', label: 'Consistency', icon: CATEGORY_ICON_MAP.CONSISTENCY },
  PRECISION: { key: 'achievement_category_precision', label: 'Precision', icon: CATEGORY_ICON_MAP.PRECISION },
  VOLUME: { key: 'achievement_category_volume', label: 'Volume', icon: CATEGORY_ICON_MAP.VOLUME },
  WEALTH: { key: 'achievement_category_wealth', label: 'Wealth', icon: CATEGORY_ICON_MAP.WEALTH },
  SPECIAL: { key: 'achievement_category_special', label: 'Special', icon: CATEGORY_ICON_MAP.SPECIAL }
};

const achievements = computed(() => {
  return Array.isArray(GameState.system?.achievements) ? GameState.system.achievements : [];
});

const isEn = computed(() => GameState.settings?.language === 'en-US');

const unlockedIds = computed(() => {
  const list = Array.isArray(GameState.user?.achievements) ? GameState.user.achievements : [];
  return list
    .map((item) => item?.achievementId || item?.id)
    .filter(Boolean);
});

const isUnlocked = (achievementId) => unlockedIds.value.includes(achievementId);
const unlockedCount = computed(() => unlockedIds.value.length);
const getIcon = (achievementId) => getAchievementIconById(achievementId);

const hiddenIds = new Set(['spec_night', 'spec_morning']);
const visibleAchievements = computed(() => achievements.value.filter((item) => {
  if (!item?.id) return false;
  if (hiddenIds.has(item.id) && !isUnlocked(item.id)) return false;
  return true;
}));
const filteredAchievements = computed(() => {
  if (activeTab.value === 'unlocked') {
    return visibleAchievements.value.filter((item) => isUnlocked(item.id));
  }
  if (activeTab.value === 'locked') {
    return visibleAchievements.value.filter((item) => !isUnlocked(item.id));
  }
  return visibleAchievements.value;
});

const visibleCategories = computed(() => {
  const grouped = {};
  filteredAchievements.value.forEach((item) => {
    if (!item?.category) return;
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  return Object.entries(categories)
    .filter(([categoryKey]) => Array.isArray(grouped[categoryKey]) && grouped[categoryKey].length > 0)
    .map(([categoryKey, meta]) => ({ categoryKey, meta }));
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
        <text class="summary-note">继续学习解锁更多徽章</text>
      </view>
      <view class="summary-badge">
        <image class="summary-icon-image" :src="getIcon('default')" mode="aspectFit" />
      </view>
    </view>

    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        <text class="tab-text" :class="{ on: activeTab === 'all' }">{{ t('achievement_wall_tab_all') }}</text>
      </view>
      <view class="tab" :class="{ active: activeTab === 'unlocked' }" @click="activeTab = 'unlocked'">
        <text class="tab-text" :class="{ on: activeTab === 'unlocked' }">{{ t('achievement_wall_state_on') }}</text>
      </view>
      <view class="tab" :class="{ active: activeTab === 'locked' }" @click="activeTab = 'locked'">
        <text class="tab-text" :class="{ on: activeTab === 'locked' }">{{ t('achievement_wall_state_off') }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="achievement-list">
      <view v-for="item in visibleCategories" :key="item.categoryKey" class="category-section">
        <view class="category-heading">
          <text class="category-title">{{ t(item.meta.key) }}</text>
          <text v-if="!isEn" class="category-title-en">{{ item.meta.label }}</text>
        </view>

        <view class="grid">
          <view
            v-for="ach in filteredAchievements.filter((achItem) => achItem.category === item.categoryKey)"
            :key="ach.id"
            class="card"
            :class="{ locked: !isUnlocked(ach.id) }"
          >
            <view class="icon-wrap">
              <image class="icon-image" :src="getIcon(ach.id)" mode="aspectFit" />
            </view>
            <text class="name">{{ ach.name }}</text>
          </view>
        </view>
      </view>

      <view v-if="filteredAchievements.length === 0" class="empty">
        <text class="empty-text">{{ t('achievement_wall_empty') }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.achievement-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 34.9rpx;
  display: flex;
  flex-direction: column;
  gap: 24.4rpx;
}

.header {
  display: flex;
  align-items: center;
  gap: 20rpx;
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
  transform: scale(0.96);
}

.back-icon {
  font-size: 31.4rpx;
  color: #111111;
  font-weight: 600;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 48.8rpx;
  font-weight: 600;
  color: #111111;
  display: block;
}

.header-sub {
  font-size: 24.4rpx;
  color: #7b758b;
  font-weight: 600;
}

.header-placeholder {
  width: 72rpx;
}

.summary-card {
  border-radius: 41.9rpx;
  padding: 0 27.9rpx;
  background: #f2c15a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 195.3rpx;
}

.summary-left {
  display: flex;
  flex-direction: column;
  gap: 10.5rpx;
}

.summary-kicker {
  color: #7a5a00;
  font-size: 24.4rpx;
  font-weight: 600;
  display: block;
}

.summary-main {
  color: #1a1a1a;
  font-size: 55.8rpx;
  font-weight: 500;
  line-height: 1.1;
}

.summary-note {
  color: #6b5a35;
  font-size: 24.4rpx;
  font-weight: 600;
}

.summary-badge {
  width: 90.7rpx;
  height: 90.7rpx;
  border-radius: 27.9rpx;
  background: #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon-image {
  width: 48.8rpx;
  height: 48.8rpx;
}

.tabs {
  display: flex;
  gap: 14rpx;
  height: 73.3rpx;
}

.tab {
  flex: 1;
  border-radius: 36.6rpx;
  background: #ede7dd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.active {
  background: #ffffff;
}

.tab-text {
  font-size: 24.4rpx;
  font-weight: 500;
  color: #6b7280;
}

.tab-text.on {
  color: #111111;
}

.achievement-list {
  flex: 1;
}

.category-section {
  margin-bottom: 24.4rpx;
  background: #ffffff;
  border-radius: 34.9rpx;
  padding: 27.9rpx 24.4rpx 24.4rpx;
  box-shadow: 0 12rpx 30rpx rgba(26, 26, 26, 0.04);
}

.category-heading {
  display: flex;
  align-items: baseline;
  gap: 10.5rpx;
  margin-bottom: 24.4rpx;
}

.category-title {
  font-size: 34.9rpx;
  font-weight: 600;
  color: #111111;
  display: block;
}

.category-title-en {
  font-size: 27.9rpx;
  font-weight: 400;
  color: #8f8a96;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17.4rpx;
}

.card {
  border-radius: 27.9rpx;
  background: linear-gradient(180deg, #f6f0ff 0%, #f1ebff 100%);
  padding: 20.9rpx 16rpx 17.4rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14rpx;
  min-height: 188.4rpx;
}

.card.locked {
  background: #f4f3f1;
}

.icon-wrap {
  width: 76.7rpx;
  height: 76.7rpx;
  border-radius: 24.4rpx;
  background: #efe8ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card.locked .icon-wrap {
  background: #ebebe8;
}

.icon-image {
  width: 52rpx;
  height: 52rpx;
}

.card.locked .icon-image {
  opacity: 0.24;
  filter: grayscale(1);
}

.name {
  font-size: 24.4rpx;
  font-weight: 500;
  color: #111111;
  line-height: 1.2;
}

.card.locked .name {
  color: #b7b3bc;
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
