<script setup>
import { computed, onMounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import { getAchievementIconById } from '../utils/achievement-icons.js';
import { resolveAvatarUrl } from '../avatar.js';

const DAILY_GOAL = 30;

const user = GameState.user;
const state = GameState;
const reviewCount = ref(0);
const loading = ref(true);

const stats = computed(() => {
  const totalCorrect = Number(user.totalCorrect) || 0;
  const totalLearned = Number(user.totalLearned || user.wordsLearned) || 0;
  return {
    totalCorrect,
    totalLearned,
    todayLearned: Number(state.game.todayLearned) || 0,
    streak: Number(user.streak) || 0,
  };
});

const progressPercent = computed(() => Math.min((stats.value.todayLearned / DAILY_GOAL) * 100, 100));
const pkEnabled = computed(() => state.system?.modules?.pk_arena_enabled !== false);
const systemAchievementIds = computed(() => new Set(
  (Array.isArray(state.system?.achievements) ? state.system.achievements : [])
    .map((item) => item?.id)
    .filter(Boolean),
));
const unlockedAchievementIds = computed(() => {
  const list = Array.isArray(user.achievements) ? user.achievements : [];
  return [...new Set(
    list
      .map((item) => item?.achievementId || item?.id)
      .filter((id) => Boolean(id) && systemAchievementIds.value.has(id))
  )];
});

const focusMode = computed(() => {
  if (stats.value.todayLearned >= DAILY_GOAL && reviewCount.value > 0) return 'review';
  return 'learn';
});

const focusTitle = computed(() => focusMode.value === 'review' ? `先学完今天的\n${DAILY_GOAL} 词挑战` : `开始今天的\n${DAILY_GOAL} 词挑战`);
const focusSubtitle = computed(() => focusMode.value === 'review'
  ? '先学完本轮，再清空复习队列'
  : '先学完本轮，再清空复习队列');
const focusSummarySubtitle = computed(() => focusMode.value === 'review' ? '学完本轮后清空复习' : '学完本轮后解锁奖励');
const primaryActionLabel = computed(() => focusMode.value === 'review' ? '开始复习' : '开始学习');
const ctaSubLabel = computed(() => stats.value.streak > 0 ? `已持续学习 ${stats.value.streak} 天` : '从今天开始连续学习');
const achievementCountText = computed(() => `${unlockedAchievementIds.value.length} 已点亮`);
const achievementSlots = computed(() => {
  const maxSlots = 12;
  const ids = ['default', ...unlockedAchievementIds.value.slice(0, maxSlots - 1)];
  return Array.from({ length: maxSlots }, (_, idx) => ids[idx] || '');
});
const achievementRows = computed(() => [
  achievementSlots.value.slice(0, 6),
  achievementSlots.value.slice(6, 12),
]);

const startLearning = () => GameEngine.startSession(DAILY_GOAL);
const startReview = async () => {
  if (reviewCount.value <= 0) {
    alert('目前没有待复习单词。系统会根据记忆曲线为您安排复习时间，请继续学习新词！');
    return;
  }

  const started = await GameEngine.startReview();
  if (!started) {
    console.warn('Review count > 0 but review session returned empty.');
  }
};
const runPrimaryAction = () => focusMode.value === 'review' ? startReview() : startLearning();
const gotoVocabulary = () => Actions.setView('vocabulary');
const gotoPK = () => {
  if (!pkEnabled.value) {
    alert('竞技场暂未开放');
    return;
  }
  Actions.setView('pk');
};
const gotoSettings = () => Actions.setView('settings');
const gotoSocial = () => Actions.setView('social');
const gotoAchievement = () => Actions.setView('achievement-wall');

const loadDashboard = async () => {
  try {
    if (user.id) {
      const statsData = await API.getStats();
    if (statsData?.user) {
        Actions.setUser({
          ...statsData.user,
          totalLearned: statsData.mastered ?? statsData.user.totalLearned,
        });
      }

      reviewCount.value = await API.getReviewCount();
    }

    const allAchievements = await API.getAchievements();
    if (Array.isArray(allAchievements)) {
      state.system.achievements = allAchievements;
    }
  } catch (e) {
    console.error('Dashboard load failed', e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<template>
  <div class="dashboard app-page">
    <div v-if="loading" class="mobile-page animate-pulse space-y-5 pt-4">
      <div class="h-[270px] rounded-[32px] bg-stone-200"></div>
      <div class="grid grid-cols-2 gap-4">
        <div class="h-[140px] rounded-[28px] bg-stone-200"></div>
        <div class="h-[140px] rounded-[28px] bg-stone-200"></div>
      </div>
      <div class="h-[76px] rounded-[28px] bg-stone-200"></div>
      <div class="h-[132px] rounded-[28px] bg-stone-200"></div>
    </div>

    <div v-else class="mobile-page space-y-4 pt-4 pb-8">
      <section data-test="dashboard-hero" class="focus-card">
        <div class="focus-orb"></div>
        <div class="focus-glow"></div>
        <button class="focus-avatar" @click="gotoSettings">
          <img class="avatar-image" :src="resolveAvatarUrl(user.avatar)" alt="avatar" />
          <div class="avatar-core"></div>
        </button>

        <div class="focus-kicker">今日任务</div>

        <div class="focus-grid">
          <div class="focus-main">
            <h1 class="focus-title">{{ focusTitle }}</h1>
            <p class="focus-subtitle">{{ focusSubtitle }}</p>

            <div class="focus-actions">
              <button data-test="start-learn" class="primary-cta button-press" @click="runPrimaryAction">
                <div class="primary-cta-copy">
                  <span class="primary-cta-text">{{ primaryActionLabel }}</span>
                  <span class="primary-cta-sub">{{ ctaSubLabel }}</span>
                </div>
                <div class="primary-cta-icon">
                  <span class="primary-cta-icon-text">▶</span>
                </div>
              </button>
            </div>
          </div>

          <div class="focus-summary">
            <span class="focus-summary-kicker">今日进度</span>
            <span class="focus-summary-value">{{ stats.todayLearned }} / {{ DAILY_GOAL }}</span>
            <span class="focus-summary-sub">{{ focusSummarySubtitle }}</span>
            <div class="focus-summary-track">
              <div class="focus-summary-fill" :style="{ width: `${progressPercent}%` }"></div>
            </div>
          </div>
        </div>
      </section>

      <div data-test="dashboard-stats" class="core-row">
        <button class="info-card review-card button-press" data-test="start-review" @click="startReview">
          <span class="info-kicker review-kicker">优先处理</span>
          <span class="info-value">{{ reviewCount }}</span>
          <span class="info-title">待复习词</span>
        </button>

        <button class="info-card wordbook-card button-press" @click="gotoVocabulary">
          <span class="info-kicker wordbook-kicker">词库状态</span>
          <span class="info-value">{{ stats.totalLearned }}</span>
          <span class="info-title">已掌握词</span>
        </button>
      </div>

      <section data-test="dashboard-actions" class="social-card">
        <div class="social-actions">
          <button class="social-pill rank-pill button-press" @click="gotoSocial">
            <span class="social-pill-text">查看排行</span>
          </button>
          <button class="social-pill arena-pill button-press" :class="{ disabled: !pkEnabled }" @click="gotoPK">
            <span class="social-pill-text">{{ pkEnabled ? '进入竞技' : '竞技未开放' }}</span>
          </button>
        </div>
      </section>

      <section class="achievement-rail button-press" @click="gotoAchievement">
        <div class="achievement-copy">
          <span class="achievement-title">成就墙</span>
          <span class="achievement-count">{{ achievementCountText }}</span>
        </div>

        <div class="achievement-track-grid">
          <div v-for="(row, rowIndex) in achievementRows" :key="rowIndex" class="achievement-row">
            <div
              v-for="(achievementId, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="achievement-chip"
              :class="{ filled: !!achievementId, highlighted: rowIndex === 0 && colIndex === 0 }"
            >
              <img
                v-if="achievementId"
                class="achievement-chip-image"
                :src="getAchievementIconById(achievementId)"
                alt="achievement icon"
              />
            </div>
          </div>
        </div>

        <div class="achievement-arrow-button">
          <span class="achievement-arrow">→</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100%;
  background: #f6f1e8;
}

.focus-card {
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  background: #fff9f1;
  height: 305px;
}

.focus-orb {
  position: absolute;
  top: -36px;
  right: 14px;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #ff8a5b;
}

.focus-glow {
  position: absolute;
  top: 136px;
  right: 48px;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #ffd8c3;
}

.focus-avatar {
  position: absolute;
  top: 23px;
  right: 46px;
  z-index: 5;
  width: 68px;
  height: 68px;
  border-radius: 999px;
  background: #efe7dd;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-core {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #d2c7b8;
}

.button-press:active {
  transform: scale(0.98);
}

.focus-kicker {
  position: absolute;
  left: 21px;
  top: 21px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 5px 12px;
  border-radius: 16px;
  background: #ffe5d6;
  color: #9a4f2e;
  font-size: 13px;
  font-weight: 800;
}

.focus-title {
  position: absolute;
  left: 21px;
  top: 68px;
  width: 208px;
  color: #1a1a1a;
  font-size: 36px;
  line-height: 1.05;
  font-weight: 600;
  white-space: pre-line;
}

.focus-subtitle {
  position: absolute;
  left: 21px;
  top: 186px;
  width: 228px;
  color: #3d3d3d;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 600;
}

.focus-actions {
  position: absolute;
  left: 21px;
  top: 224px;
}

.primary-cta {
  width: 192px;
  height: 66px;
  padding: 12px 15px;
  border-radius: 24px;
  background: #6f58d9;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: none;
}

.primary-cta-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.primary-cta-text {
  color: #ffffff;
  font-size: 19px;
  font-weight: 700;
}

.primary-cta-sub {
  color: #e9deff;
  font-size: 11px;
  font-weight: 700;
}

.primary-cta-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-cta-icon-text {
  color: #fff9f1;
  font-size: 12px;
  font-weight: 800;
}

.focus-summary {
  position: absolute;
  left: 244px;
  top: 146px;
  width: 138px;
  height: 142px;
  padding: 14px;
  border-radius: 28px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.focus-summary-kicker {
  color: #c9f66c;
  font-size: 11px;
  font-weight: 800;
}

.focus-summary-value {
  color: #fff9f1;
  font-size: 31px;
  line-height: 1;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.focus-summary-sub {
  color: #d8d2c8;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 600;
}

.focus-summary-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

.focus-summary-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #a0ff9f 0%, #c9f66c 100%);
}

.core-row {
  display: flex;
  gap: 14px;
}

.info-card {
  flex: 1;
  min-width: 0;
  height: 180px;
  border-radius: 28px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
}

.review-card {
  background: #dcd3ff;
}

.wordbook-card {
  background: #cdead7;
}

.info-kicker {
  font-size: 12px;
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
  font-size: 48px;
  line-height: 1;
  font-weight: 800;
}

.info-title {
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 600;
  line-height: 1.06;
  text-align: center;
}

.social-card {
  border-radius: 28px;
  background: #ffffff;
  padding: 14px 18px;
  height: 98px;
}

.social-actions {
  display: flex;
  gap: 12px;
  height: 100%;
}

.social-pill {
  flex: 1;
  min-width: 0;
  border-radius: 22px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
}

.rank-pill {
  background: #fff3e6;
}

.arena-pill {
  background: #f4f0ea;
}

.arena-pill.disabled {
  opacity: 0.55;
}

.social-pill-text {
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 600;
}

.achievement-rail {
  border-radius: 28px;
  background: #ffffff;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  height: 144px;
}

.achievement-copy {
  width: 76px;
  min-width: 76px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievement-title {
  color: #1a1a1a;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.1;
}

.achievement-count {
  color: #4f4a43;
  font-size: 15px;
  font-weight: 700;
}

.achievement-track-grid {
  width: 230px;
  min-width: 230px;
  height: 92px;
  border-radius: 22px;
  background: #f7f0e7;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achievement-row {
  width: 100%;
  height: 31px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.achievement-chip {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-chip.highlighted {
  background: #f7d463;
}

.achievement-chip-image {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.achievement-arrow-button {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: #1a1a1a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-arrow {
  color: #fff9f1;
  font-size: 20px;
  font-weight: 800;
}
</style>
