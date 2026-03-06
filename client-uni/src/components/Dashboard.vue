<script setup>
import { computed, onMounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';

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

const unlockedAchievementIcons = computed(() => {
  const list = Array.isArray(user.achievements) ? user.achievements : [];
  return list
    .map((item) => item?.achievement?.icon || item?.icon)
    .filter((icon) => typeof icon === 'string' && icon.trim().length > 0)
    .slice(0, 8);
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

const streakLabel = computed(() =>
  stats.value.streak > 0
    ? t('dashboard_streak_chip', { count: stats.value.streak })
    : t('dashboard_streak_chip_start')
);

const reviewCardSubtitle = computed(() =>
  reviewCount.value > 0 ? t('dashboard_review_card_sub_due') : t('dashboard_review_card_sub_empty')
);

const arenaPillLabel = computed(() =>
  pkEnabled.value ? t('dashboard_arena_cta') : t('dashboard_pk_off')
);

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
      <view class="focus-avatar" @click="gotoSettings" hover-class="avatar-press">
        <image class="avatar-image" :src="getAvatarUrl(user.avatar)" />
      </view>

      <text class="focus-kicker">{{ t('dashboard_focus_kicker') }}</text>

      <view class="focus-grid">
        <view class="focus-main">
          <text class="focus-title">{{ focusTitle }}</text>
          <text class="focus-subtitle">{{ focusSubtitle }}</text>

          <view class="focus-actions">
            <view class="primary-cta" hover-class="button-press" @click="runPrimaryAction">
              <text class="primary-cta-text">{{ primaryActionLabel }}</text>
            </view>
            <view class="streak-chip">
              <text class="streak-chip-text">{{ streakLabel }}</text>
            </view>
          </view>
        </view>

        <view class="focus-summary">
          <text class="focus-summary-kicker">{{ t('dashboard_focus_progress') }}</text>
          <text class="focus-summary-value">{{ stats.todayLearned }} / {{ DAILY_GOAL }}</text>
          <text class="focus-summary-sub">{{ focusSummarySubtitle }}</text>
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
        <text class="info-sub">{{ reviewCardSubtitle }}</text>
      </view>

      <view class="info-card wordbook-card animate-slide-in-up delay-200" @click="gotoVocabulary">
        <text class="info-kicker wordbook-kicker">{{ t('dashboard_vocab_kicker') }}</text>
        <text class="info-value">{{ stats.totalLearned }}</text>
        <text class="info-title">{{ t('dashboard_vocab_title_card') }}</text>
        <text class="info-sub">{{ t('dashboard_vocab_sub_card') }}</text>
      </view>
    </view>

    <view class="social-card animate-slide-in-up delay-300">
      <text class="social-kicker">{{ t('dashboard_social_kicker') }}</text>
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
        <text class="achievement-title">{{ t('dashboard_achievement_progress') }}</text>
        <text class="achievement-count">{{ t('dashboard_achievement_lit', { count: unlockedAchievementIcons.length }) }}</text>
      </view>
      <view class="achievement-track">
        <view v-if="unlockedAchievementIcons.length > 0" class="achievement-icons">
          <view v-for="(icon, index) in unlockedAchievementIcons" :key="index" class="achievement-chip">
            <text class="achievement-icon">{{ icon }}</text>
          </view>
        </view>
        <view v-else class="achievement-empty">
          <text class="achievement-empty-text">{{ t('dashboard_achievement_empty') }}</text>
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
  padding: calc(var(--header-height, 88px) + 16rpx) 28rpx calc(env(safe-area-inset-bottom, 0px) + 10rpx);
  background: #f7f3ec;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.dashboard.lang-en {
  gap: 16rpx;
  font-family: "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
  border-radius: 28rpx;
  background: #fff8f0;
  padding: 22rpx;
  min-height: 446rpx;
}

.focus-orb {
  position: absolute;
  top: 18rpx;
  right: 32rpx;
  width: 176rpx;
  height: 176rpx;
  border-radius: 50%;
  background: #f58652;
}

.focus-avatar {
  position: absolute;
  top: 52rpx;
  right: 66rpx;
  z-index: 2;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  padding: 10rpx;
  background: rgba(255, 248, 238, 0.9);
  border: 2rpx solid rgba(224, 212, 199, 0.9);
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

.focus-kicker {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #efe1d4;
  color: #7f5b46;
  font-size: 22rpx;
  font-weight: 700;
}

.focus-grid {
  position: relative;
  z-index: 2;
  margin-top: 22rpx;
  display: flex;
  align-items: flex-end;
  gap: 18rpx;
}

.focus-main {
  min-width: 0;
  flex: 1;
}

.focus-title {
  display: block;
  color: #1a1a1a;
  font-size: 62rpx;
  line-height: 1.08;
  font-weight: 800;
}

.dashboard.lang-en .focus-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56rpx;
  font-weight: 700;
}

.focus-subtitle {
  display: block;
  margin-top: 18rpx;
  color: #5a534c;
  font-size: 24rpx;
  line-height: 1.45;
}

.dashboard.lang-en .focus-subtitle {
  font-size: 22rpx;
}

.focus-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 28rpx;
}

.primary-cta,
.streak-chip,
.social-pill,
.achievement-arrow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-cta {
  min-width: 180rpx;
  height: 76rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #151515;
}

.primary-cta-text {
  color: #fff9f1;
  font-size: 28rpx;
  font-weight: 800;
}

.streak-chip {
  min-width: 152rpx;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f3e4b6;
}

.streak-chip-text {
  color: #7d5a12;
  font-size: 24rpx;
  font-weight: 700;
}

.focus-summary {
  width: 250rpx;
  min-height: 224rpx;
  padding: 22rpx;
  border-radius: 24rpx;
  background: #191816;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 14rpx 26rpx rgba(18, 14, 10, 0.2);
}

.focus-summary-kicker {
  color: #c9f66c;
  font-size: 20rpx;
  font-weight: 700;
}

.focus-summary-value {
  color: #fff9f1;
  font-size: 48rpx;
  line-height: 1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.focus-summary-sub {
  color: #d8d2c8;
  font-size: 20rpx;
  line-height: 1.35;
}

.focus-summary-track {
  width: 100%;
  height: 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
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
  min-height: 312rpx;
  border-radius: 24rpx;
  padding: 26rpx 24rpx;
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
  font-size: 20rpx;
  font-weight: 700;
}

.review-kicker {
  color: #6e5fb4;
}

.wordbook-kicker {
  color: #46745b;
}

.info-value {
  color: #1a1a1a;
  font-size: 68rpx;
  line-height: 1;
  font-weight: 800;
  margin-top: 4rpx;
  font-variant-numeric: tabular-nums;
}

.info-title {
  color: #1a1a1a;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.12;
}

.info-sub {
  margin-top: auto;
  color: #5a534c;
  font-size: 22rpx;
  line-height: 1.35;
}

.social-card {
  border-radius: 22rpx;
  background: #ffffff;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  min-height: 132rpx;
}

.social-kicker {
  color: #6b6b6b;
  font-size: 20rpx;
  font-weight: 700;
}

.social-pill {
  flex: 1;
  min-width: 0;
  height: 70rpx;
  border-radius: 999rpx;
  padding: 0 24rpx;
  border: 2rpx solid transparent;
}

.rank-pill {
  background: #f7eee1;
  border-color: #e6d8c4;
}

.arena-pill {
  background: #f5f0e7;
  border-color: #e4ddd2;
}

.arena-pill.disabled {
  opacity: 0.55;
}

.social-pill-text {
  color: #1a1a1a;
  font-size: 24rpx;
  font-weight: 700;
}

.achievement-rail {
  border-radius: 22rpx;
  background: #fff8f0;
  padding: 18rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 120rpx;
}

.achievement-copy {
  width: 168rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.achievement-title {
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 800;
}

.achievement-count {
  color: #6b6b6b;
  font-size: 20rpx;
}

.achievement-track {
  flex: 1;
  min-width: 0;
  height: 82rpx;
  border-radius: 18rpx;
  background: #f4ece4;
  padding: 12rpx;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.achievement-icons {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.achievement-chip {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  background: #f7e8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-icon {
  font-size: 28rpx;
}

.achievement-empty {
  width: 100%;
  display: flex;
  align-items: center;
}

.achievement-empty-text {
  color: #94a3b8;
  font-size: 20rpx;
  line-height: 1.35;
}

.achievement-arrow-button {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  background: #151515;
  flex-shrink: 0;
}

.achievement-arrow {
  color: #fff9f1;
  font-size: 28rpx;
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
