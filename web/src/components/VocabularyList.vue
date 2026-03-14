<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Actions, GameState } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';

const props = defineProps({
  onBack: Function,
});

const words = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);
const search = ref('');
const serverTotal = ref(0);

const totalCount = computed(() => {
  if (search.value.trim()) return words.value.length;
  const n = Number(serverTotal.value || GameState.user.totalLearned || 0);
  return Number.isFinite(n) && n >= 0 ? n : words.value.length;
});

const statusPriority = (status) => {
  if (status === 'LEARNING') return 1;
  if (status === 'MASTERED') return 2;
  return 3;
};

const displayWords = computed(() => {
  return [...words.value].sort((a, b) => {
    const ap = statusPriority(a?.status);
    const bp = statusPriority(b?.status);
    if (ap !== bp) return ap - bp;
    return Number(b?.repetition || 0) - Number(a?.repetition || 0);
  });
});

const parseMeaningList = (meanings) => {
  if (Array.isArray(meanings)) return meanings;
  if (typeof meanings === 'string') {
    try {
      const parsed = JSON.parse(meanings);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return [meanings];
    }
    return [meanings];
  }
  return [];
};

const detectPosFromMeanings = (meanings) => {
  const list = parseMeaningList(meanings);
  const hit = list.find((item) => typeof item === 'string' && /^[a-z]+\./i.test(item.trim()));
  return hit?.trim().match(/^([a-z]+\.)/i)?.[1]?.toLowerCase() || '';
};

const normalizePartOfSpeech = (pos, meanings) => String(pos || '').trim().toLowerCase() || detectPosFromMeanings(meanings) || 'n.';

const cleanMeaningText = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/^\s*[a-z]+\.\s*/i, '').replace(/示意[:：]?\s*/g, '').replace(/\s+/g, ' ').trim();
};

const safeParseMeanings = (meanings) => parseMeaningList(meanings).map(cleanMeaningText).filter(Boolean).join('；');

const getStatusLabel = (status, repetition) => {
  if (status === 'MASTERED') return '已掌握';
  if (status === 'LEARNING') return '学习中';
  if ((repetition || 0) > 0) return '待巩固';
  return '新词';
};

const getStatusClass = (status, repetition) => {
  if (status === 'MASTERED') return 'bg-mint';
  if (status === 'LEARNING') return 'bg-sky';
  if ((repetition || 0) > 0) return 'bg-lemon';
  return 'bg-pink';
};

const getMasteryLevel = (status, repetition) => {
  if (status === 'MASTERED') return { color: '#A8F0C6', label: '熟练', percent: 100 };
  const r = Number(repetition || 0);
  if (r >= 5) return { color: '#A0D8F1', label: '稳定', percent: 85 };
  if (r >= 3) return { color: '#A0D8F1', label: '进阶', percent: 65 };
  if (r >= 1) return { color: '#F9E975', label: '入门', percent: 35 };
  return { color: '#FFB5D0', label: '新词', percent: 15 };
};

const loadMore = async () => {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const data = await API.getLearnedWords(page.value, 20, search.value);
    const list = Array.isArray(data?.data) ? data.data : [];
    if (page.value === 1) {
      serverTotal.value = Number(data?.total) || list.length;
    }
    words.value = page.value === 1 ? list : [...words.value, ...list];
    const lastPage = Number(data?.lastPage) || 1;
    hasMore.value = page.value < lastPage;
    page.value += 1;
  } catch (error) {
    console.error('Load vocabulary failed', error);
  } finally {
    loading.value = false;
  }
};

watch(search, () => {
  page.value = 1;
  hasMore.value = true;
  words.value = [];
  serverTotal.value = 0;
  loadMore();
});

onMounted(loadMore);

const handleBack = () => {
  if (props.onBack) {
    props.onBack();
    return;
  }
  Actions.setView('dashboard');
};
</script>

<template>
  <div class="vocab-page">
    <header class="header">
      <button class="back-btn" @click="handleBack">
        <span class="back-icon">←</span>
      </button>
      <div class="header-content">
        <div class="header-title">我的词库</div>
        <div class="header-sub">已记录 {{ totalCount }} 个单词</div>
      </div>
      <div class="header-icon">📘</div>
    </header>

    <section class="search-section">
      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input v-model="search" class="search-input" placeholder="搜索单词" type="text">
      </div>
    </section>

    <section class="stats-section">
      <div class="stat-card mint">
        <div class="stat-value">{{ totalCount }}</div>
        <div class="stat-label">词条总数</div>
      </div>
      <div class="stat-card sky">
        <div class="stat-value">{{ GameState.user.level || 1 }}</div>
        <div class="stat-label">当前等级</div>
      </div>
    </section>

    <div class="word-list" @scroll.passive="(e) => { const el = e.target; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) loadMore(); }">
      <div v-if="(!displayWords || displayWords.length === 0) && !loading" class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-title">还没有词汇记录</div>
        <div class="empty-sub">完成学习后，这里会逐渐积累你的个人词库。</div>
      </div>

      <div class="word-cards">
        <article v-for="record in displayWords" :key="record.id" class="word-card">
          <div class="word-header">
            <div class="word-main">
              <div class="word-text">{{ record.word.text || record.word.word }}</div>
              <div class="word-tags">
                <span class="word-tag" :class="getStatusClass(record.status, record.repetition)">{{ getStatusLabel(record.status, record.repetition) }}</span>
                <span class="word-pos">{{ normalizePartOfSpeech(record.word.partOfSpeech, record.word.meanings) }}</span>
              </div>
            </div>
            <button class="sound-btn" @click="GameEngine.playAudio(record.word.text || record.word.word)">🔊</button>
          </div>

          <div class="word-meaning">{{ safeParseMeanings(record.word.meanings) }}</div>

          <div class="mastery-section">
            <div class="mastery-header">
              <span class="mastery-label">掌握度</span>
              <span class="mastery-level" :style="{ color: getMasteryLevel(record.status, record.repetition).color }">{{ getMasteryLevel(record.status, record.repetition).label }}</span>
            </div>
            <div class="mastery-bar">
              <div class="mastery-fill" :style="{ width: getMasteryLevel(record.status, record.repetition).percent + '%', background: getMasteryLevel(record.status, record.repetition).color }"></div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!hasMore && displayWords.length > 0" class="no-more">已经到底了</div>
    </div>
  </div>
</template>

<style scoped>
.vocab-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 62px;
}
.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: #fff;
}
.back-icon { font-size: 22px; font-weight: 600; }
.header-content { flex: 1; }
.header-title { font-size: 28px; font-weight: 700; color: #111111; }
.header-sub { font-size: 14px; color: #7b758b; font-weight: 600; }
.header-icon {
  width: 44px; height: 44px; border-radius: 14px; background: #a0d8f1; display:flex; align-items:center; justify-content:center; font-size: 22px;
}
.search-box {
  background: #fff;
  border-radius: 22px;
  min-height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-input { flex: 1; border: none; outline: none; background: transparent; font-size: 18px; font-weight: 600; color: #111; }
.search-input::placeholder { color: #bbb; }
.stats-section {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.stat-card { border-radius: 22px; padding: 18px; }
.stat-card.mint { background: #a8f0c6; }
.stat-card.sky { background: #a0d8f1; }
.stat-value { font-size: 34px; font-weight: 700; color: #111; }
.stat-label { font-size: 14px; color: #2d2b28; font-weight: 600; }
.word-list { flex: 1; overflow-y: auto; }
.word-cards { display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; }
.word-card { background: #fff; border-radius: 24px; padding: 18px; border: 1px solid #efe8de; box-shadow: 0 4px 10px rgba(26,26,26,.03); }
.word-card:nth-child(3n + 2) { background: #fffaf6; }
.word-card:nth-child(3n) { background: #fffdfb; }
.word-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.word-main { flex: 1; }
.word-text { font-size: 30px; font-weight: 700; color: #111; margin-bottom: 8px; font-family: var(--font-serif, Georgia, serif); }
.word-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.word-tag, .word-pos { padding: 4px 10px; border-radius: 10px; font-size: 13px; font-weight: 600; }
.word-tag.bg-mint { background: #a8f0c6; }
.word-tag.bg-sky { background: #a0d8f1; }
.word-tag.bg-lemon { background: #f9e975; }
.word-tag.bg-pink { background: #ffb5d0; }
.word-pos { background: #f7f3ee; color: #918b95; }
.sound-btn { width: 38px; height: 38px; border-radius: 999px; border: none; background: #f5f5f5; font-size: 16px; }
.word-meaning { font-size: 17px; color: #6b6b6b; line-height: 1.5; margin-bottom: 16px; }
.mastery-section { display: flex; flex-direction: column; gap: 8px; }
.mastery-header { display: flex; justify-content: space-between; align-items: center; }
.mastery-label { font-size: 13px; font-weight: 700; color: #918b95; }
.mastery-level { font-size: 13px; font-weight: 700; }
.mastery-bar { height: 10px; background: #f1ece5; border-radius: 999px; overflow: hidden; }
.mastery-fill { height: 100%; border-radius: 999px; }
.empty-state { padding: 72px 20px; text-align: center; color: #918b95; }
.empty-icon { font-size: 40px; margin-bottom: 10px; }
.empty-title { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 6px; }
.empty-sub { font-size: 14px; line-height: 1.6; }
.loading, .no-more { padding: 20px 0; text-align: center; font-size: 14px; color: #918b95; font-weight: 600; }
</style>
