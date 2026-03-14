<script setup>
import { ref, onMounted, computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';

const user = GameState.user;
const activeTab = ref('leaderboard');
const loading = ref(false);
const leaderboard = ref([]);
const feed = ref([]);
const myRank = ref(null);

const myId = computed(() => user.id || user._id || user.openid || '');
const displayRank = computed(() => {
  const rank = Number(myRank.value);
  return Number.isFinite(rank) && rank > 0 ? String(rank) : '--';
});
const displayRankLabel = computed(() => {
  const rank = Number(myRank.value);
  return Number.isFinite(rank) && rank > 0 ? '名' : '未上榜';
});

onMounted(async () => {
  await Promise.all([loadLeaderboard(), loadFeed()]);
});

const loadLeaderboard = async () => {
  loading.value = true;
  try {
    leaderboard.value = await API.getLeaderboard();
    const index = leaderboard.value.findIndex((item) => item?.id === myId.value);
    myRank.value = index >= 0 ? index + 1 : null;
  } catch (error) {
    console.error('Load leaderboard failed', error);
    leaderboard.value = [];
    myRank.value = null;
  } finally {
    loading.value = false;
  }
};

const loadFeed = async () => {
  try {
    const data = await API.getSocialFeed();
    feed.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Load feed failed', error);
    feed.value = [];
  }
};

const goBack = () => Actions.setView('dashboard');

const getRankStyle = (index) => {
  if (index === 0) return { bg: '#F9E975', icon: '1' };
  if (index === 1) return { bg: '#A0D8F1', icon: '2' };
  if (index === 2) return { bg: '#FFB5D0', icon: '3' };
  return { bg: '#f0f0f0', icon: String(index + 1) };
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = typeof timestamp?.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getMonth() + 1}/${date.getDate()}`;
};
</script>

<template>
  <div class="social-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <div class="header-content">
        <div class="header-title">排行与动态</div>
        <div class="header-sub">看看大家最近的学习状态</div>
      </div>
      <div class="header-icon">🏆</div>
    </header>

    <section class="my-rank-card">
      <div class="rank-avatar">{{ user.nickname?.[0] || user.username?.[0] || 'U' }}</div>
      <div class="rank-info">
        <div class="rank-name">{{ user.nickname || user.username || '我' }}</div>
        <div class="rank-stats">
          <span class="rank-level">Lv.{{ user.level || 1 }}</span>
          <span class="rank-xp">{{ user.xp || 0 }} XP</span>
        </div>
      </div>
      <div class="rank-position">
        <div class="rank-number">{{ displayRank }}</div>
        <div class="rank-label">{{ displayRankLabel }}</div>
      </div>
    </section>

    <section class="tabs">
      <button class="tab" :class="{ active: activeTab === 'leaderboard' }" @click="activeTab = 'leaderboard'">排行榜</button>
      <button class="tab" :class="{ active: activeTab === 'feed' }" @click="activeTab = 'feed'">动态</button>
    </section>

    <div v-if="activeTab === 'leaderboard'" class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="rank-list">
        <article v-for="(u, index) in leaderboard" :key="u.id" class="rank-item" :class="{ 'is-me': u.id === myId }">
          <div class="rank-badge" :style="{ background: getRankStyle(index).bg }">
            <span class="rank-icon">{{ getRankStyle(index).icon }}</span>
          </div>
          <div class="rank-avatar-small">{{ u.username?.[0] || 'U' }}</div>
          <div class="rank-user-info">
            <div class="rank-username">
              {{ u.username }}
              <span v-if="u.id === myId" class="me-tag">我</span>
            </div>
            <div class="rank-level">Lv.{{ u.level || 1 }}</div>
          </div>
          <div class="rank-score">
            <div class="score-value">{{ u.xp || 0 }}</div>
            <div class="score-label">XP</div>
          </div>
        </article>
      </div>
      <div v-if="!loading && leaderboard.length === 0" class="empty">暂无排行榜数据</div>
    </div>

    <div v-else class="content">
      <div v-if="feed.length === 0" class="empty">还没有学习动态</div>
      <div v-else class="feed-list">
        <article v-for="item in feed" :key="item.id" class="feed-item">
          <div class="feed-avatar">{{ item.username?.[0] || 'U' }}</div>
          <div class="feed-content">
            <div class="feed-header">
              <div class="feed-name">{{ item.username }}</div>
              <div class="feed-time">{{ formatTime(item.timestamp) }}</div>
            </div>
            <div class="feed-text">{{ item.title }}</div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.header { display: flex; align-items: center; gap: 10px; min-height: 62px; }
.back-btn { width: 44px; height: 44px; border-radius: 999px; border: none; background: #fff; }
.back-icon { font-size: 22px; font-weight: 600; }
.header-content { flex: 1; }
.header-title { font-size: 28px; font-weight: 700; color: #111; }
.header-sub { font-size: 14px; color: #7b758b; font-weight: 600; }
.header-icon { width: 44px; height: 44px; background: #f9e975; border-radius: 14px; display:flex; align-items:center; justify-content:center; font-size: 22px; }
.my-rank-card { background: #fff9f1; border-radius: 24px; padding: 18px; display:flex; align-items:center; gap: 12px; box-shadow: 0 12px 28px rgba(17,17,17,.04); }
.rank-avatar { width: 52px; height: 52px; background: #fff; border-radius: 999px; display:flex; align-items:center; justify-content:center; font-size: 22px; font-weight: 700; color: #111; }
.rank-info { flex: 1; }
.rank-name { font-size: 20px; font-weight: 700; color: #111; }
.rank-stats { display: flex; gap: 12px; }
.rank-level, .rank-xp, .rank-label { font-size: 14px; color: #6b7280; font-weight: 600; }
.rank-position { text-align: center; }
.rank-number { font-size: 34px; font-weight: 700; color: #111; line-height: 1; }
.tabs { display: flex; gap: 8px; }
.tab { flex: 1; min-height: 44px; border-radius: 22px; border: none; background: #fff; color: #1a1a1a; font-size: 18px; font-weight: 700; box-shadow: 0 8px 16px rgba(17,17,17,.03); }
.tab.active { background: #6f58d9; color: #fff; }
.content { flex: 1; overflow-y: auto; }
.rank-list, .feed-list { display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; }
.rank-item, .feed-item { background: #fff; border-radius: 24px; padding: 18px; display:flex; align-items:center; gap: 12px; box-shadow: 0 12px 24px rgba(17,17,17,.04); }
.rank-item.is-me { background: #dcd3ff; }
.rank-badge { width: 36px; height: 36px; border-radius: 999px; display:flex; align-items:center; justify-content:center; }
.rank-icon { font-size: 16px; font-weight: 800; }
.rank-avatar-small { width: 44px; height: 44px; background: #f0f0f0; border-radius: 999px; display:flex; align-items:center; justify-content:center; font-size: 18px; font-weight: 700; color: #6b7280; }
.rank-user-info, .feed-content { flex: 1; }
.rank-username { font-size: 18px; font-weight: 700; color: #111; }
.me-tag { margin-left: 8px; font-size: 12px; background: #5a459d; color: white; padding: 2px 8px; border-radius: 8px; }
.rank-score { text-align: right; }
.score-value { font-size: 22px; font-weight: 700; color: #111; }
.score-label { font-size: 12px; color: #999; }
.feed-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, #a0d8f1 0%, #7bc8e8 100%); border-radius: 999px; display:flex; align-items:center; justify-content:center; font-size: 18px; font-weight: 700; color: white; flex-shrink: 0; }
.feed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 8px; }
.feed-name { font-size: 17px; font-weight: 700; color: #111; }
.feed-time { font-size: 12px; color: #999; }
.feed-text { font-size: 15px; color: #555; line-height: 1.5; }
.empty, .loading { padding: 60px 0; text-align: center; color: #918b95; font-size: 15px; font-weight: 600; }
</style>
