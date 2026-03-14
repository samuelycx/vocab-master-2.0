<script setup>
import { computed, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { getAchievementIconById } from '../utils/achievement-icons.js';

const props = defineProps({ onClose: Function });
const activeTab = ref('all');

const categories = {
  GROWTH: { label: '成长', en: 'Growth', icon: '🌱' },
  CONSISTENCY: { label: '坚持', en: 'Consistency', icon: '🔥' },
  PRECISION: { label: '精准', en: 'Precision', icon: '🎯' },
  VOLUME: { label: '词量', en: 'Volume', icon: '📚' },
  WEALTH: { label: '财富', en: 'Wealth', icon: '💰' },
  SPECIAL: { label: '特殊', en: 'Special', icon: '✨' },
};

const achievements = computed(() => Array.isArray(GameState.system?.achievements) ? GameState.system.achievements : []);
const achievementIds = computed(() => new Set(achievements.value.map((item) => item?.id).filter(Boolean)));
const unlockedIds = computed(() => {
  const list = Array.isArray(GameState.user?.achievements) ? GameState.user.achievements : [];
  return list
    .map((item) => item?.achievementId || item?.id)
    .filter((id) => Boolean(id) && achievementIds.value.has(id));
});
const unlockedCount = computed(() => unlockedIds.value.length);
const isUnlocked = (achievementId) => unlockedIds.value.includes(achievementId);
const hiddenIds = new Set(['spec_night', 'spec_morning']);
const visibleAchievements = computed(() => achievements.value.filter((item) => item?.id && (!hiddenIds.has(item.id) || isUnlocked(item.id))));
const filteredAchievements = computed(() => {
  if (activeTab.value === 'unlocked') return visibleAchievements.value.filter((item) => isUnlocked(item.id));
  if (activeTab.value === 'locked') return visibleAchievements.value.filter((item) => !isUnlocked(item.id));
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

const handleBack = () => {
  if (props.onClose) {
    props.onClose();
    return;
  }
  Actions.setView('dashboard');
};
</script>

<template>
  <div class="achievement-page">
    <header class="header">
      <button class="back-btn" @click="handleBack">
        <span class="back-icon">←</span>
      </button>
      <div class="header-content">
        <div class="header-title">成就墙</div>
        <div class="header-sub">已点亮 {{ unlockedCount }} / {{ visibleAchievements.length }}</div>
      </div>
      <div class="header-placeholder"></div>
    </header>

    <section class="summary-card">
      <div class="summary-left">
        <div class="summary-kicker">进度总览</div>
        <div class="summary-main">{{ unlockedCount }} / {{ visibleAchievements.length }}</div>
        <div class="summary-note">继续学习解锁更多徽章</div>
      </div>
      <div class="summary-badge">
        <img class="summary-badge-image" :src="getAchievementIconById('default')" alt="badge" />
      </div>
    </section>

    <section class="tabs">
      <button class="tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部</button>
      <button class="tab" :class="{ active: activeTab === 'unlocked' }" @click="activeTab = 'unlocked'">已点亮</button>
      <button class="tab" :class="{ active: activeTab === 'locked' }" @click="activeTab = 'locked'">未点亮</button>
    </section>

    <div class="achievement-list">
      <section v-for="item in visibleCategories" :key="item.categoryKey" class="category-section">
        <div class="category-heading">
          <div class="category-title">{{ item.meta.label }}</div>
          <div class="category-title-en">{{ item.meta.en }}</div>
        </div>

        <div class="grid">
          <article v-for="ach in filteredAchievements.filter((achItem) => achItem.category === item.categoryKey)" :key="ach.id" class="card" :class="{ locked: !isUnlocked(ach.id) }">
            <div class="icon-wrap">
              <img class="icon-image" :src="getAchievementIconById(ach.id)" :alt="ach.name" />
            </div>
            <div class="name">{{ ach.name }}</div>
          </article>
        </div>
      </section>

      <div v-if="filteredAchievements.length === 0" class="empty">当前筛选条件下还没有成就</div>
    </div>
  </div>
</template>

<style scoped>
.achievement-page { min-height: 100vh; background: #f6f1e8; padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.header { display: flex; align-items: center; gap: 10px; }
.back-btn { width: 44px; height: 44px; border-radius: 999px; border: none; background: #fff; }
.back-icon { font-size: 22px; font-weight: 600; }
.header-content { flex: 1; }
.header-title { font-size: 28px; font-weight: 700; color: #111; }
.header-sub { font-size: 14px; color: #7b758b; font-weight: 600; }
.header-placeholder { width: 44px; }
.summary-card { border-radius: 28px; padding: 18px; background: #f2c15a; display: flex; align-items: center; justify-content: space-between; min-height: 140px; box-shadow: 0 12px 28px rgba(122,90,0,.14); }
.summary-left { display: flex; flex-direction: column; gap: 6px; }
.summary-kicker { color: #7a5a00; font-size: 14px; font-weight: 700; }
.summary-main { color: #1a1a1a; font-size: 38px; font-weight: 700; line-height: 1.05; }
.summary-note { color: #6b5a35; font-size: 14px; font-weight: 600; }
.summary-badge { width: 56px; height: 56px; border-radius: 16px; background: #fde68a; display:flex; align-items:center; justify-content:center; }
.summary-badge-image { width: 32px; height: 32px; object-fit: contain; }
.tabs { display: flex; gap: 8px; }
.tab { flex: 1; min-height: 44px; border-radius: 22px; border: none; background: #ede7dd; color: #1a1a1a; font-size: 16px; font-weight: 700; }
.tab.active { background: #6f58d9; color: #fff; }
.achievement-list { display: flex; flex-direction: column; gap: 18px; padding-bottom: 10px; }
.category-section { display: flex; flex-direction: column; gap: 10px; }
.category-heading { display: flex; align-items: baseline; gap: 8px; }
.category-title { font-size: 22px; font-weight: 800; color: #111; }
.category-title-en { font-size: 13px; color: #8d8694; font-weight: 600; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.card { min-height: 128px; border-radius: 24px; background: #fff; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 10px; padding: 12px; box-shadow: 0 12px 24px rgba(17,17,17,.04); transition: transform .18s ease, box-shadow .18s ease; }
.card:active { transform: scale(.98); }
.card.locked { opacity: .36; filter: grayscale(1); }
.icon-wrap { width: 54px; height: 54px; border-radius: 18px; background: #f6f1e8; display:flex; align-items:center; justify-content:center; }
.icon-image { width: 30px; height: 30px; object-fit: contain; }
.name { font-size: 17px; font-weight: 700; color: #111; text-align: center; }
.empty { padding: 60px 0; text-align: center; font-size: 15px; color: #918b95; font-weight: 600; }
</style>
