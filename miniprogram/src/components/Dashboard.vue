<script setup>
import { computed, onMounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';
import { DEFAULT_LEARN_COUNT } from '../constants.js';
import { getAchievementIconById } from '../utils/achievement-icons.js';

const DAILY_GOAL = DEFAULT_LEARN_COUNT;
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
  const totalLearned = Number(user.totalLearned) || 0;
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
const achievementCountText = computed(() =>
  state.settings.language === 'en-US'
    ? `${unlockedAchievementIds.value.length} unlocked`
    : `${unlockedAchievementIds.value.length} 已点亮`
);
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
        <text class="achievement-count">{{ achievementCountText }}</text>
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
  padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 27.9rpx;
  background: #f6f1e8;
  display: flex;
  flex-direction: column;
  gap: 24.4rpx;
  font-family: "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.dashboard.lang-en {
  gap: 14rpx;
  font-family: "Inter", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.focus-card {
  position: relative;
  overflow: hidden;
  border-radius: 52.3rpx;
  background: #fff9f1;
  padding: 0;
  height: 509.3rpx;
}

.focus-orb {
  position: absolute;
  top: -59.3rpx;
  right: 22.4rpx;
  width: 278.6rpx;
  height: 278.6rpx;
  border-radius: 50%;
  background: #ff8a5b;
  pointer-events: none;
}

.focus-glow {
  position: absolute;
  top: 226.7rpx;
  right: 83.7rpx;
  width: 139.5rpx;
  height: 139.5rpx;
  border-radius: 50%;
  background: #ffd8c3;
  pointer-events: none;
}

.focus-avatar {
  position: absolute;
  top: 38.4rpx;
  right: 76.7rpx;
  z-index: 5;
  width: 111.6rpx;
  height: 111.6rpx;
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
  width: 52.3rpx;
  height: 52.3rpx;
  border-radius: 50%;
  background: #d2c7b8;
}

.focus-kicker {
  position: absolute;
  left: 34.9rpx;
  top: 34.9rpx;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  width: 191.9rpx;
  min-height: 52.3rpx;
  padding: 8.7rpx 20.9rpx;
  border-radius: 26.2rpx;
  background: #ffe5d6;
  color: #9a4f2e;
  font-size: 20.9rpx;
  font-weight: 800;
}

.focus-grid {
  position: relative;
  z-index: 2;
  margin-top: 0;
}

.focus-main {
  min-width: 0;
}

.focus-title {
  position: absolute;
  left: 34.9rpx;
  top: 111.6rpx;
  width: 347.2rpx;
  display: block;
  color: #1a1a1a;
  font-size: 59.3rpx;
  line-height: 1.1;
  font-weight: 500;
}

.focus-subtitle {
  position: absolute;
  left: 34.9rpx;
  top: 307rpx;
  width: 364.9rpx;
  display: block;
  margin-top: 0;
  color: #3d3d3d;
  font-size: 24.4rpx;
  line-height: 1.4;
}

.focus-actions {
  position: absolute;
  left: 34.9rpx;
  top: 368rpx;
  display: flex;
  align-items: center;
  gap: 17.4rpx;
  margin-top: 0;
}

.primary-cta,
.social-pill,
.achievement-arrow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-cta {
  width: 319.2rpx;
  height: 109.9rpx;
  padding: 17.4rpx 24.4rpx;
  border-radius: 41.9rpx;
  background: #6f58d9;
  justify-content: space-between;
}

.primary-cta-copy {
  display: flex;
  flex-direction: column;
  gap: 3.5rpx;
  min-width: 0;
}

.primary-cta-text {
  color: #ffffff;
  font-size: 31.4rpx;
  font-weight: 600;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.primary-cta-sub {
  color: #e9deff;
  font-size: 17.4rpx;
  line-height: 1.2;
  font-weight: 700;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.primary-cta-icon {
  width: 48.8rpx;
  height: 48.8rpx;
  border-radius: 24.4rpx;
  background: rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.primary-cta-icon-text {
  color: #fff9f1;
  font-size: 20.9rpx;
  font-weight: 800;
}

.focus-summary {
  position: absolute;
  left: 404.7rpx;
  top: 244.2rpx;
  width: 223.3rpx;
  height: 232.6rpx;
  padding: 20.9rpx;
  border-radius: 41.9rpx;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 10.5rpx;
  box-shadow: none;
}

.focus-summary-kicker {
  color: #c9f66c;
  font-size: 17.4rpx;
  font-weight: 800;
}

.focus-summary-value {
  color: #fff9f1;
  font-size: 48.8rpx;
  line-height: 1;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: "SF Pro", "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.focus-summary-sub {
  color: #d8d2c8;
  font-size: 20.9rpx;
  line-height: 1.3;
  letter-spacing: -0.2rpx;
  white-space: normal;
}

.focus-summary-track {
  width: 100%;
  height: 17.4rpx;
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

.core-row {
  display: flex;
  gap: 24.4rpx;
}

.social-actions {
  display: flex;
  gap: 17.4rpx;
}

.info-card {
  flex: 1;
  min-width: 0;
  height: 300rpx;
  border-radius: 41.9rpx;
  padding: 31.4rpx;
  display: flex;
  flex-direction: column;
  gap: 17.4rpx;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.review-card {
  background: #dcd3ff;
}

.wordbook-card {
  background: #cdead7;
}

.info-kicker {
  font-size: 19.2rpx;
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
  font-size: 87.2rpx;
  line-height: 1;
  font-weight: 800;
  margin-top: 7rpx;
  font-variant-numeric: tabular-nums;
  font-family: "SF Pro", "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.info-title {
  color: #1a1a1a;
  font-size: 52.3rpx;
  font-weight: 500;
  line-height: 1.12;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  text-align: center;
}

.info-sub {
  margin-top: auto;
  color: #5a534c;
  font-size: 24.4rpx;
  line-height: 1.35;
}

.social-card {
  border-radius: 38.4rpx;
  background: #ffffff;
  padding: 24.4rpx 27.9rpx;
  display: flex;
  flex-direction: column;
  height: 164rpx;
}

.social-pill {
  flex: 1;
  min-width: 0;
  height: 129.1rpx;
  border-radius: 31.4rpx;
  padding: 0 24.4rpx;
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
  font-size: 45.3rpx;
  font-weight: 500;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.achievement-rail {
  border-radius: 38.4rpx;
  background: #ffffff;
  padding: 27.9rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20.9rpx;
  height: 247.7rpx;
}

.achievement-copy {
  width: 125.6rpx;
  min-width: 125.6rpx;
  display: flex;
  flex-direction: column;
  gap: 10.5rpx;
}

.achievement-title {
  color: #1a1a1a;
  font-size: 31.4rpx;
  font-weight: 500;
  line-height: 1.1;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  white-space: nowrap;
}

.achievement-count {
  color: #4f4a43;
  font-size: 24.4rpx;
  font-weight: 700;
  line-height: 1.1;
  font-family: "PingFang SC", "Inter", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.achievement-track-grid {
  width: 383.7rpx;
  min-width: 383.7rpx;
  height: 153.5rpx;
  border-radius: 31.4rpx;
  background: #f7f0e7;
  padding: 17.4rpx;
  display: flex;
  flex-direction: column;
  gap: 10.5rpx;
}

.achievement-row {
  width: 100%;
  height: 52.3rpx;
  display: flex;
  align-items: center;
  gap: 10.5rpx;
}

.achievement-chip {
  width: 48.8rpx;
  height: 48.8rpx;
  border-radius: 17.4rpx;
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
  width: 34.9rpx;
  height: 34.9rpx;
}

.achievement-arrow-button {
  width: 73.3rpx;
  height: 73.3rpx;
  border-radius: 36.6rpx;
  background: #1a1a1a;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
}

.achievement-arrow {
  color: #fff9f1;
  font-size: 31.4rpx;
  font-weight: 800;
}

</style>
