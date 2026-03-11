<script setup>
import { computed, onMounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';
import { getAchievementIconById } from '../utils/achievement-icons.js';

const DAILY_GOAL = 10;
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

const user = GameState.user;
const state = GameState;
const reviewCount = ref(0);
const { t } = useI18n();

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return DEFAULT_AVATAR;
  return avatar.startsWith('http') ? avatar : DEFAULT_AVATAR;
};

const stats = computed(() => {
  const totalCorrect = Number(user.totalCorrect) || 0;
  const totalLearned = Number(user.totalLearned ?? Math.floor(totalCorrect * 0.7)) || 0;
  return {
    totalCorrect,
    totalLearned,
    todayLearned: Number(state.game.todayLearned) || 0,
    streak: Number(user.streak) || 0
  };
});

const progressPercent = computed(() => Math.min((stats.value.todayLearned / DAILY_GOAL) * 100, 100));
const pkEnabled = computed(() => state.system?.modules?.pk_arena_enabled !== false);
const dashboardClass = computed(() => state.settings.language === 'en-US' ? 'lang-en' : 'lang-zh');

const unlockedAchievementIds = computed(() => {
  const list = Array.isArray(user.achievements) ? user.achievements : [];
  const ids = list
    .map((item) => item?.achievementId || item?.id)
    .filter((id) => typeof id === 'string' && id.trim().length > 0);
  return [...new Set(ids)];
});

const focusMode = computed(() => {
  if (stats.value.todayLearned >= DAILY_GOAL && reviewCount.value > 0) return 'review';
  return 'learn';
});

const focusTitle = computed(() =>
  t(focusMode.value === 'review' ? 'dashboard_focus_title_review' : 'dashboard_focus_title_learn', { count: DAILY_GOAL })
);

const focusSubtitle = computed(() =>
  t(focusMode.value === 'review' ? 'dashboard_focus_sub_review' : 'dashboard_focus_sub_learn')
);

const focusSummarySubtitle = computed(() =>
  t(focusMode.value === 'review' ? 'dashboard_focus_summary_review' : 'dashboard_focus_summary_learn')
);

const primaryActionLabel = computed(() =>
  t(focusMode.value === 'review' ? 'dashboard_focus_cta_review' : 'dashboard_focus_cta_learn')
);

const ctaSubLabel = computed(() => {
  if (state.settings.language === 'en-US') {
    return stats.value.streak > 0 ? `Learning streak ${stats.value.streak} days` : 'Start your streak today';
  }
  return stats.value.streak > 0 ? `已持续学习 ${stats.value.streak} 天` : '从今天开始连续学习';
});

const reviewCardSubtitle = computed(() =>
  reviewCount.value > 0 ? t('dashboard_review_card_sub_due') : t('dashboard_review_card_sub_empty')
);

const arenaPillLabel = computed(() =>
  pkEnabled.value ? t('dashboard_arena_cta') : t('dashboard_pk_off')
);
const achievementSlots = computed(() => {
  const maxSlots = 12;
  const ids = ['default', ...unlockedAchievementIds.value.slice(0, maxSlots - 1)];
  return Array.from({ length: maxSlots }, (_, idx) => ids[idx] || '');
});
const achievementRows = computed(() => [
  achievementSlots.value.slice(0, 6),
  achievementSlots.value.slice(6, 12)
]);
const getAchievementIcon = (achievementId) => getAchievementIconById(achievementId);

const startLearning = () => {
  GameEngine.startSession(DAILY_GOAL);
};

const startReview = async () => {
  if (!user.id && !user._id && !user.openid) {
    uni.showToast({ title: t('dashboard_login_first'), icon: 'none' });
    return;
  }
  const started = await GameEngine.startReview(user.id || user._id || user.openid);
  if (!started) {
    uni.showToast({ title: t('dashboard_no_reviews'), icon: 'none' });
  }
};

const runPrimaryAction = () => {
  if (focusMode.value === 'review') {
    return startReview();
  }
  return startLearning();
};

const gotoVocabulary = () => Actions.setView('vocabulary');
const gotoPK = () => {
  if (!pkEnabled.value) {
    uni.showToast({ title: t('dashboard_pk_closed'), icon: 'none' });
    return;
  }
  Actions.setView('pk');
};
const gotoSettings = () => Actions.setView('settings');
const gotoSocial = () => Actions.setView('social');
const gotoAchievement = () => Actions.setView('achievement-wall');

const loadDashboard = async () => {
  try {
    const uid = user.id || user._id || user.openid;
    const statsData = await API.getStats(uid);
    if (statsData && statsData.user) Actions.setUser(statsData.user);

    const allAchievements = await API.getAchievements();
    if (Array.isArray(allAchievements)) {
      state.system.achievements = allAchievements;
    }

    const reviews = await API.getReviews(uid);
    reviewCount.value = Array.isArray(reviews) ? reviews.length : 0;
  } catch (e) {
    console.error('Dashboard load failed', e);
  }
};

onMounted(loadDashboard);
</script>

<template>
  <view :class="['dashboard', 'app-page', dashboardClass]">
    <view class="focus-card animate-slide-in-down">
      <view class="focus-orb"></view>
      <view class="focus-glow"></view>
      <view class="focus-avatar" @click="gotoSettings" hover-class="avatar-press">
        <image class="avatar-image" :src="getAvatarUrl(user.avatar)" />
        <view class="avatar-core"></view>
      </view>

      <text class="focus-kicker">{{ t('dashboard_focus_kicker') }}</text>

      <view class="focus-grid">
        <view class="focus-main">
          <text class="focus-title">{{ focusTitle }}</text>
          <text class="focus-subtitle">{{ focusSubtitle }}</text>

          <view class="focus-actions">
            <view class="primary-cta" hover-class="button-press" @click="runPrimaryAction">
              <view class="primary-cta-copy">
                <text class="primary-cta-text">{{ primaryActionLabel }}</text>
                <text class="primary-cta-sub">{{ ctaSubLabel }}</text>
              </view>
              <view class="primary-cta-icon">
                <text class="primary-cta-icon-text">▶</text>
              </view>
            </view>
          </view>
        </view>

        <view class="focus-summary">
          <text class="focus-summary-kicker">{{ t('dashboard_focus_progress') }}</text>
          <text class="focus-summary-value">{{ stats.todayLearned }} / {{ DAILY_GOAL }}</text>
          <text class="focus-summary-sub">学完本轮后&#10;解锁奖励</text>
          <view class="focus-summary-track">
            <view class="focus-summary-fill" :style="{ width: progressPercent + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <view class="core-row">
      <view class="info-card review-card animate-slide-in-up delay-100" @click="startReview">
        <text class="info-kicker review-kicker">{{ t('dashboard_review_kicker') }}</text>
        <text class="info-value">{{ reviewCount }}</text>
        <text class="info-title">{{ t('dashboard_review_title') }}</text>
      </view>

      <view class="info-card wordbook-card animate-slide-in-up delay-200" @click="gotoVocabulary">
        <text class="info-kicker wordbook-kicker">{{ t('dashboard_vocab_kicker') }}</text>
        <text class="info-value">{{ stats.totalLearned }}</text>
        <text class="info-title">{{ t('dashboard_vocab_title_card') }}</text>
      </view>
    </view>

    <view class="social-card animate-slide-in-up delay-300">
      <view class="social-actions">
        <view class="social-pill rank-pill" hover-class="button-press" @click="gotoSocial">
          <text class="social-pill-text">{{ t('dashboard_rank_cta') }}</text>
        </view>
        <view
          class="social-pill arena-pill"
          :class="{ disabled: !pkEnabled }"
          hover-class="button-press"
          @click="gotoPK"
        >
          <text class="social-pill-text">{{ arenaPillLabel }}</text>
        </view>
      </view>
    </view>

    <view class="achievement-rail animate-fade-in delay-400" @click="gotoAchievement">
      <view class="achievement-copy">
        <text class="achievement-title">{{ t('dashboard_achievement') }}</text>
        <text class="achievement-count">{{ t('dashboard_achievement_lit', { count: unlockedAchievementIds.length }) }}</text>
      </view>
      <view class="achievement-track-grid">
        <view v-for="(row, rowIndex) in achievementRows" :key="rowIndex" class="achievement-row">
          <view
            v-for="(achievementId, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            class="achievement-chip"
            :class="{
              filled: !!achievementId,
              highlighted: rowIndex === 0 && colIndex === 0
            }"
          >
            <image v-if="achievementId" class="achievement-icon-image" :src="getAchievementIcon(achievementId)" mode="aspectFit" />
          </view>
        </view>
      </view>
      <view class="achievement-arrow-button">
        <text class="achievement-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.dashboard {
  min-height: 100%;
  box-sizing: border-box;
  padding: calc(var(--header-height, 88px) + 62rpx) 24rpx calc(env(safe-area-inset-bottom, 0px) + 16rpx);
  background: #f6f1e8;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  font-family: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.dashboard.lang-en {
  gap: 14rpx;
  font-family: "Inter", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.focus-card,
.info-card,
.social-card,
.achievement-rail {
  border: 2rpx solid #e7ddd0;
  box-shadow: 0 16rpx 28rpx rgba(32, 24, 14, 0.08);
}

.focus-card {
  position: relative;
  overflow: hidden;
  border-radius: 30rpx;
  background: #fff9f1;
  padding: 20rpx;
  height: 292rpx;
}

.focus-orb {
  position: absolute;
  top: -44rpx;
  right: 6rpx;
  width: 170rpx;
  height: 170rpx;
  border-radius: 50%;
  background: #ff8a5b;
  pointer-events: none;
}

.focus-glow {
  position: absolute;
  top: 120rpx;
  right: 24rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #ffd8c3;
  pointer-events: none;
}

.focus-avatar {
  position: absolute;
  top: 18rpx;
  right: 66rpx;
  z-index: 5;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  padding: 0;
  background: #efe7dd;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-press,
.button-press {
  transform: scale(0.98);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-core {
  position: absolute;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #d2c7b8;
}

.focus-kicker {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  height: 30rpx;
  padding: 0 12rpx;
  border-radius: 15rpx;
  background: #ffe5d6;
  color: #9a4f2e;
  font-size: 12rpx;
  font-weight: 800;
}

.focus-grid {
  position: relative;
  z-index: 2;
  margin-top: 14rpx;
  display: flex;
  align-items: flex-end;
  gap: 10rpx;
}

.focus-main {
  min-width: 0;
  flex: 1;
}

.focus-title {
  display: block;
  color: #1a1a1a;
  font-size: 34rpx;
  line-height: 1.1;
  font-weight: 800;
}

.dashboard.lang-en .focus-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 700;
}

.focus-subtitle {
  display: block;
  margin-top: 12rpx;
  color: #3d3d3d;
  font-size: 14rpx;
  line-height: 1.4;
}

.dashboard.lang-en .focus-subtitle {
  font-size: 22rpx;
}

.focus-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 18rpx;
}

.primary-cta,
.social-pill,
.achievement-arrow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-cta {
  width: 183rpx;
  height: 63rpx;
  padding: 10rpx 14rpx;
  border-radius: 24rpx;
  background: #6f58d9;
  justify-content: space-between;
}

.primary-cta-copy {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  min-width: 0;
}

.primary-cta-text {
  color: #ffffff;
  font-size: 18rpx;
  font-weight: 800;
}

.primary-cta-sub {
  color: #e9deff;
  font-size: 10rpx;
  line-height: 1.2;
  font-weight: 700;
}

.primary-cta-icon {
  width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.primary-cta-icon-text {
  color: #fff9f1;
  font-size: 12rpx;
  font-weight: 800;
}

.focus-summary {
  width: 136rpx;
  height: 142rpx;
  padding: 12rpx;
  border-radius: 24rpx;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  box-shadow: none;
}

.focus-summary-kicker {
  color: #c9f66c;
  font-size: 10rpx;
  font-weight: 800;
}

.focus-summary-value {
  color: #fff9f1;
  font-size: 28rpx;
  line-height: 1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.focus-summary-sub {
  color: #d8d2c8;
  font-size: 10rpx;
  line-height: 1.2;
}

.focus-summary-track {
  width: 100%;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.focus-summary-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #a0ff9f 0%, #c9f66c 100%);
  transition: width 0.6s ease;
}

.core-row,
.social-actions {
  display: flex;
  gap: 14rpx;
}

.info-card {
  flex: 1;
  min-width: 0;
  height: 172rpx;
  border-radius: 24rpx;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.review-card {
  background: #e2dbf6;
  border-color: #cfc2ec;
}

.wordbook-card {
  background: #dcebdd;
  border-color: #c7d9cc;
}

.info-kicker {
  font-size: 11rpx;
  font-weight: 800;
}

.review-kicker {
  color: #6e5fb4;
}

.wordbook-kicker {
  color: #46745b;
}

.info-value {
  color: #1a1a1a;
  font-size: 50rpx;
  line-height: 1;
  font-weight: 800;
  margin-top: 4rpx;
  font-variant-numeric: tabular-nums;
}

.info-title {
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.12;
}

.info-sub {
  margin-top: auto;
  color: #5a534c;
  font-size: 14rpx;
  line-height: 1.35;
}

.social-card {
  border-radius: 22rpx;
  background: #ffffff;
  padding: 14rpx 16rpx;
  display: flex;
  flex-direction: column;
  height: 94rpx;
}

.social-pill {
  flex: 1;
  min-width: 0;
  height: 74rpx;
  border-radius: 18rpx;
  padding: 0 14rpx;
  border: 2rpx solid transparent;
}

.rank-pill {
  background: #fff3e6;
  border-color: transparent;
}

.arena-pill {
  background: #f4f0ea;
  border-color: transparent;
}

.arena-pill.disabled {
  opacity: 0.55;
}

.social-pill-text {
  color: #1a1a1a;
  font-size: 26rpx;
  font-weight: 800;
}

.achievement-rail {
  border-radius: 22rpx;
  background: #ffffff;
  padding: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  height: 142rpx;
}

.achievement-copy {
  width: 50rpx;
  min-width: 50rpx;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.achievement-title {
  color: #1a1a1a;
  font-size: 18rpx;
  font-weight: 800;
  line-height: 1.1;
}

.achievement-count {
  color: #6b6b6b;
  font-size: 10rpx;
}

.achievement-track-grid {
  width: 220rpx;
  min-width: 220rpx;
  height: 88rpx;
  border-radius: 18rpx;
  background: #f3ebe2;
  padding: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.achievement-row {
  width: 100%;
  height: 30rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.achievement-chip {
  width: 28rpx;
  height: 28rpx;
  border-radius: 10rpx;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-chip.filled {
  background: #ffffff;
}

.achievement-chip.highlighted {
  background: #f7d463;
}

.achievement-icon-image {
  width: 20rpx;
  height: 20rpx;
}

.achievement-arrow-button {
  width: 42rpx;
  height: 42rpx;
  border-radius: 21rpx;
  background: #1a1a1a;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.achievement-arrow {
  color: #fff9f1;
  font-size: 18rpx;
  font-weight: 800;
}

.dashboard.lang-en .focus-card {
  background: #fff8f0;
}

.dashboard.lang-en .focus-kicker,
.dashboard.lang-en .social-kicker,
.dashboard.lang-en .info-kicker,
.dashboard.lang-en .focus-summary-kicker {
  letter-spacing: 0.02em;
}

.dashboard.lang-en .achievement-title {
  font-size: 28rpx;
}
</style>
