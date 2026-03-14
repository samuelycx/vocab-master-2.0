<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';

const DEFAULT_LEARN_COUNT = 30;
const lastSession = computed(() => GameState.game.lastSession || { xp: 0, coins: 0, correct: 0, total: 0 });

const accuracy = computed(() => {
  if (!lastSession.value.total) return 0;
  return Math.round((lastSession.value.correct / lastSession.value.total) * 100);
});

const goHome = () => {
  Actions.setView('dashboard');
};

const learnAgain = () => {
  GameEngine.startSession(DEFAULT_LEARN_COUNT);
};
</script>

<template>
  <div class="result-page">
    <header class="result-header">
      <button class="back-btn" @click="goHome">
        <span class="back-icon">←</span>
      </button>
      <div class="header-title">学习总结</div>
      <div class="header-spacer"></div>
    </header>

    <section class="hero-card">
      <div class="hero-icon">🎉</div>
      <div class="hero-title">完成挑战</div>
      <div class="hero-sub">今天也稳稳推进了一步</div>
    </section>

    <section class="reward-row">
      <div class="reward-card xp">
        <div class="reward-value">+{{ lastSession.xp }}</div>
        <div class="reward-label">XP</div>
      </div>
      <div class="reward-card coin">
        <div class="reward-value">+{{ lastSession.coins }}</div>
        <div class="reward-label">COIN</div>
      </div>
    </section>

    <section class="stats-card">
      <div class="stats-title">本轮数据</div>
      <div class="stat-row">
        <span class="stat-label">答对题数</span>
        <span class="stat-value">{{ lastSession.correct }} / {{ lastSession.total }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">正确率</span>
        <span class="stat-value">{{ accuracy }}%</span>
      </div>
    </section>

    <section class="actions-row">
      <button class="btn-primary" @click="learnAgain">再学一轮</button>
      <button class="btn-secondary" @click="goHome">回到首页</button>
    </section>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}

.back-btn,
.header-spacer {
  width: 44px;
  height: 44px;
  border-radius: 999px;
}

.back-btn {
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 22px;
  font-weight: 600;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #111111;
}

.hero-card {
  min-height: 180px;
  border-radius: 28px;
  background: #fff9f1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 12px 28px rgba(17, 17, 17, 0.05);
  animation: cardRise .38s cubic-bezier(.22,1,.36,1);
}

.hero-icon {
  font-size: 42px;
}

.hero-title {
  font-size: 34px;
  font-weight: 700;
  color: #111111;
}

.hero-sub {
  font-size: 15px;
  color: #6b6b6b;
}

.reward-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.reward-card {
  border-radius: 24px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 10px 20px rgba(17, 17, 17, 0.04);
}

.reward-card.xp {
  background: #dcd3ff;
}

.reward-card.coin {
  background: #fcecc7;
}

.reward-value {
  font-size: 34px;
  font-weight: 800;
  color: #111111;
}

.reward-label {
  font-size: 13px;
  font-weight: 700;
  color: #111111;
}

.stats-card {
  border-radius: 26px;
  background: #ffffff;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 10px 20px rgba(17, 17, 17, 0.04);
}

.stats-title {
  font-size: 14px;
  font-weight: 700;
  color: #6b6b6b;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  color: #6b6b6b;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #111111;
}

.actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  min-height: 58px;
  border-radius: 24px;
  border: none;
  font-size: 18px;
  font-weight: 700;
}

.btn-primary {
  background: #6f58d9;
  color: #ffffff;
}

.btn-secondary {
  background: #ffffff;
  color: #111111;
}

@keyframes cardRise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
