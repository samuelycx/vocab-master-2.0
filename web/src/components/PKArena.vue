<script setup>
import { computed, watch, ref, onUnmounted } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { SocketManager } from '../socket.js';

const session = GameEngine.session;
const pk = computed(() => GameState.game.pk);
const user = GameState.user;
const isSearching = ref(false);
const isInLobby = ref(true);
const isFlipped = ref(false);

const formatTimeLeft = computed(() => {
  const totalSeconds = Math.max(Number(session.timeLeft) || 0, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const footerRewardText = computed(() => {
  if (!session.isAnswered) return '答对获得 XP';
  return `+${session.lastAwardXP || 0} XP`;
});

watch(() => session.currentWord, (newWord) => {
  if (!newWord) return;
  if (newWord.examples && newWord.examples.length > 0) {
    const ex = newWord.examples[Math.floor(Math.random() * newWord.examples.length)];
    const escaped = String(newWord.word || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    session.currentExample = {
      original: ex,
      masked: ex.replace(regex, '______')
    };
  } else {
    session.currentExample = null;
  }
  isFlipped.value = false;
  if (pk.value.isActive && !session.isAnswered && session.currentWord?.word) {
    setTimeout(() => {
      if (!session.isAnswered) {
        GameEngine.playAudio(session.currentWord.word);
      }
    }, 120);
  }
}, { immediate: true });

watch(() => session.isAnswered, (answered) => {
  if (answered) isFlipped.value = true;
});

watch(() => pk.value.isActive, (active) => {
  if (active) {
    isInLobby.value = false;
    isSearching.value = false;
  }
}, { immediate: true });

const startPK = (mode) => {
  GameState.game.pk.mode = mode;
  if (mode === 'bot') {
    isInLobby.value = false;
    GameEngine.startPKSession();
    return;
  }
  if (mode === 'online') {
    isInLobby.value = false;
    isSearching.value = true;
    try {
      SocketManager.joinQueue();
    } catch (err) {
      console.error('Failed to join queue:', err);
      isSearching.value = false;
      alert('连接对战服务失败');
    }
  }
};

const quitPK = () => {
  if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
  GameEngine.quitSession();
  SocketManager.disconnect();
  isSearching.value = false;
  isInLobby.value = true;
  Actions.setView('dashboard');
};

const playAgain = () => {
  GameState.game.pk.winner = null;
  GameState.game.pk.endReason = null;
  isInLobby.value = true;
  isSearching.value = false;
};

const handleAnswer = (option) => {
  GameEngine.submitAnswer(option);
};

const getOptionClass = (option) => {
  if (!session.isAnswered) return 'option-default';
  if (option === session.correctOption) return 'option-correct';
  if (option === session.selectedOption && option !== session.correctOption) return 'option-wrong';
  return 'option-faded';
};

const WIN_SCORE = 200;

onUnmounted(() => {
  SocketManager.disconnect();
});
</script>

<template>
  <div class="pk-page">
    <header class="pk-header">
      <button class="back-btn" @click="quitPK"><span class="back-icon">←</span></button>
      <div class="pk-title">PK 竞技场</div>
      <div class="placeholder"></div>
    </header>

    <section v-if="isInLobby" class="lobby">
      <div class="lobby-title">选择挑战模式</div>
      <div class="lobby-sub">匹配真人，或先和 AI 练练手</div>

      <div class="mode-cards">
        <button class="mode-card ranked" @click="startPK('online')">
          <div class="mode-icon">🏆</div>
          <div class="mode-info">
            <div class="mode-name">排位对战</div>
            <div class="mode-desc">与真实玩家实时对决</div>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card practice" @click="startPK('bot')">
          <div class="mode-icon practice-icon">🤖</div>
          <div class="mode-info">
            <div class="mode-name">人机练习</div>
            <div class="mode-desc">先和 Vocab Bot 热身一轮</div>
          </div>
          <div class="mode-arrow">→</div>
        </button>
      </div>
    </section>

    <section v-else-if="isSearching" class="searching">
      <div class="search-ring"><div class="search-icon">⟳</div></div>
      <div class="search-title">正在匹配对手</div>
      <div class="search-sub">请稍等，我们正在寻找水平接近的玩家</div>
      <button class="cancel-btn" @click="quitPK">取消匹配</button>
    </section>

    <section v-else-if="pk.isActive" class="pk-battle">
      <div class="score-board">
        <div class="player me">
          <div class="player-avatar">{{ user.username?.[0] || '我' }}</div>
          <div class="player-meta">
            <div class="player-name">{{ user.username || '我' }}</div>
            <div class="player-score">{{ pk.userScore }}</div>
          </div>
        </div>
        <div class="vs-badge">VS</div>
        <div class="player opponent">
          <div class="player-meta align-right">
            <div class="player-name">{{ pk.opponent?.name || 'AI' }}</div>
            <div class="player-score">{{ pk.opponent?.score || 0 }}</div>
          </div>
          <div class="player-avatar opponent-avatar">{{ pk.opponent?.name?.[0] || 'A' }}</div>
        </div>
      </div>

      <div class="battle-bars">
        <div class="battle-bar"><div class="battle-fill left" :style="{ width: Math.min((pk.userScore / WIN_SCORE) * 100, 100) + '%' }"></div></div>
        <div class="battle-bar"><div class="battle-fill right" :style="{ width: Math.min(((pk.opponent?.score || 0) / WIN_SCORE) * 100, 100) + '%' }"></div></div>
      </div>

      <div class="pkb-card-wrap">
        <div class="pkb-card" :class="{ flipped: isFlipped }">
          <div class="pkb-card-face pkb-card-front">
            <div class="pkb-word">{{ session.currentWord?.word }}</div>
            <div class="pkb-example">{{ session.currentExample?.masked || '暂无例句' }}</div>
          </div>

          <div class="pkb-card-face pkb-card-back">
            <div class="pkb-result-label">答题结果</div>
            <div class="pkb-result-icon">{{ session.isCorrect ? '✓' : '✗' }}</div>
            <div class="pkb-result-text">{{ session.isCorrect ? '回答正确' : '回答错误' }}</div>
            <div class="pkb-meaning">{{ session.currentWord?.meanings?.[0] || session.correctOption }}</div>
            <div class="pkb-divider"></div>
            <div v-if="session.isCorrect" class="pkb-rewards">
              <span class="pkb-reward">+{{ session.lastAwardXP || 0 }} XP</span>
              <span class="pkb-reward">+{{ session.lastAwardCoins || 0 }} Coin</span>
            </div>
            <div v-else class="pkb-result-hint">记住正确释义，下一题追回来。</div>
          </div>
        </div>
      </div>

      <div v-if="!isFlipped && !session.isAnswered" class="pkb-ops">
        <div class="pkb-row">
          <button
            v-for="(option, idx) in session.options.slice(0, 2)"
            :key="idx"
            class="pkb-op-btn"
            :class="getOptionClass(option)"
            @click="handleAnswer(option)"
          >
            <span class="pkb-op-index">{{ String.fromCharCode(65 + idx) }}</span>
            <span class="pkb-op-text">{{ option }}</span>
          </button>
        </div>
        <div class="pkb-row">
          <button
            v-for="(option, idx) in session.options.slice(2, 4)"
            :key="idx + 2"
            class="pkb-op-btn"
            :class="getOptionClass(option)"
            @click="handleAnswer(option)"
          >
            <span class="pkb-op-index">{{ String.fromCharCode(67 + idx) }}</span>
            <span class="pkb-op-text">{{ option }}</span>
          </button>
        </div>
      </div>

      <div class="pkb-foot">
        <span class="pkb-foot-left">剩余 {{ formatTimeLeft }}</span>
        <span class="pkb-foot-right">{{ footerRewardText }}</span>
      </div>
    </section>

    <div v-if="pk.winner" class="result-overlay">
      <div class="confetti-container">
        <span v-for="i in 20" :key="i" class="confetti" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 2 + 's' }"></span>
      </div>
      <div class="result-card" :class="{ winner: pk.winner === 'user' }">
        <div class="result-icon">{{ pk.winner === 'user' ? '🏆' : '⚔️' }}</div>
        <div class="result-title">{{ pk.winner === 'user' ? '你赢了' : '本轮惜败' }}</div>
        <div class="result-score">{{ pk.userScore }} - {{ pk.opponent?.score || 0 }}</div>
        <div class="result-desc">{{ pk.winner === 'user' ? '这场对局打得很稳，继续保持。' : '差一点就翻盘了，再来一局。' }}</div>
        <div class="result-actions">
          <button class="btn-primary" @click="playAgain">再来一局</button>
          <button class="btn-secondary" @click="quitPK">回到首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pk-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}
.pk-header { display: flex; align-items: center; justify-content: space-between; min-height: 56px; }
.back-btn, .placeholder { width: 44px; height: 44px; }
.back-btn { border: none; border-radius: 999px; background: #fff; }
.back-icon { font-size: 22px; font-weight: 600; }
.pk-title { font-size: 28px; font-weight: 700; color: #111; }
.lobby { flex: 1; display: flex; flex-direction: column; gap: 10px; padding-top: 24px; }
.lobby-title { font-size: 24px; font-weight: 700; color: #111; text-align: center; }
.lobby-sub { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 8px; }
.mode-cards { display: flex; flex-direction: column; gap: 12px; }
.mode-card { border: none; border-radius: 28px; padding: 18px; display: flex; align-items: center; gap: 12px; min-height: 94px; text-align: left; box-shadow: 0 14px 26px rgba(17,17,17,.06); }
.mode-card.ranked { background: #1a1a1a; color: #fff; }
.mode-card.practice { background: #fff; color: #111; }
.mode-icon { width: 52px; height: 52px; border-radius: 18px; background: rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size: 24px; }
.practice-icon { background: #f5f5f5; }
.mode-info { flex: 1; }
.mode-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.mode-desc { font-size: 14px; opacity: .7; }
.mode-arrow { font-size: 22px; font-weight: 700; }
.searching { flex: 1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
.search-ring { width: 120px; height: 120px; border: 5px solid rgba(255,255,255,.12); border-top-color: white; border-radius: 999px; display:flex; align-items:center; justify-content:center; animation: spin 1.4s linear infinite; margin-bottom: 20px; }
.search-icon { font-size: 34px; }
.search-title { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 8px; }
.search-sub { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
.cancel-btn { width: 100%; max-width: 320px; min-height: 58px; border-radius: 24px; border:none; background:#6e58d9; color:white; font-size:18px; font-weight:700; }
.pk-battle { flex: 1; display:flex; flex-direction:column; gap: 12px; }
.score-board { display:flex; align-items:center; justify-content:space-between; gap: 12px; background:#fff; border:1px solid #ebe4da; border-radius: 18px; padding: 14px; box-shadow: 0 12px 24px rgba(17,17,17,.04); }
.player { flex: 1; display:flex; align-items:center; gap: 10px; }
.player.opponent { justify-content: flex-end; }
.player-meta { display:flex; flex-direction:column; gap: 2px; }
.align-right { text-align: right; }
.player-avatar { width: 42px; height: 42px; border-radius: 999px; background:#dcd3ff; display:flex; align-items:center; justify-content:center; font-size: 18px; font-weight: 700; color:#111; }
.opponent-avatar { background:#fcecc7; }
.player-name { font-size: 15px; font-weight: 700; color:#111; }
.player-score { font-size: 22px; font-weight: 800; color:#111; }
.vs-badge { width: 44px; height: 44px; border-radius: 999px; background:#111; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; }
.battle-bars { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.battle-bar { height: 12px; background:#e8e1d7; border-radius: 999px; overflow:hidden; }
.battle-fill { height: 100%; border-radius: 999px; }
.battle-fill.left { background:#6f58d9; }
.battle-fill.right { background:#ff8a5b; }
.pkb-card-wrap { perspective: 1200px; }
.pkb-card { position: relative; min-height: 320px; transform-style: preserve-3d; transition: transform .55s ease; }
.pkb-card.flipped { transform: rotateY(180deg); }
.pkb-card-face { position:absolute; inset:0; border-radius: 32px; backface-visibility: hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 24px; text-align:center; }
.pkb-card-front { background:#f6e8c5; box-shadow: 0 18px 34px rgba(17,17,17,.06); }
.pkb-card-back { background:#fff; transform: rotateY(180deg); box-shadow: 0 18px 34px rgba(17,17,17,.06); }
.pkb-word { font-size: 54px; font-weight: 700; color:#111; font-family: var(--font-serif, Georgia, serif); margin-bottom: 20px; }
.pkb-example { font-size: 18px; line-height: 1.6; color:#616161; }
.pkb-result-label { font-size: 14px; color:#8d8694; font-weight: 700; margin-bottom: 12px; }
.pkb-result-icon { font-size: 44px; margin-bottom: 8px; }
.pkb-result-text { font-size: 28px; font-weight: 800; color:#111; margin-bottom: 8px; }
.pkb-meaning { font-size: 18px; color:#5c5867; margin-bottom: 16px; }
.pkb-divider { width: 100%; height: 1px; background:#efe8de; margin-bottom: 16px; }
.pkb-rewards { display:flex; gap: 10px; flex-wrap: wrap; justify-content:center; }
.pkb-reward { padding: 6px 10px; border-radius: 999px; background:#f4efe7; font-size: 14px; font-weight: 700; color:#111; }
.pkb-result-hint { font-size: 14px; color:#918b95; }
.pkb-ops { display:flex; flex-direction:column; gap: 12px; }
.pkb-row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pkb-op-btn { min-height: 92px; border-radius: 24px; border: none; padding: 16px; display:flex; align-items:flex-start; gap: 10px; text-align:left; box-shadow: 0 12px 20px rgba(17,17,17,.04); }
.pkb-op-index { width: 30px; height: 30px; border-radius: 10px; background:#f5f3ef; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; color:#6f58d9; flex-shrink:0; }
.pkb-op-text { font-size: 17px; font-weight: 700; color:#111; line-height: 1.4; }
.option-default { background:#fff; }
.option-correct { background:#a8f0c6; }
.option-wrong { background:#ffb5d0; }
.option-faded { background:#ede7dd; opacity:.72; }
.pkb-foot { margin-top: auto; display:flex; justify-content:space-between; align-items:center; padding: 14px 18px; border-radius: 18px; background:#111; color:#fff; font-size: 14px; font-weight: 700; }
.result-overlay { position: fixed; inset: 0; z-index: 60; background: rgba(13, 13, 13, .18); backdrop-filter: blur(6px); display:flex; align-items:center; justify-content:center; padding: 20px; }
.result-card { width: 100%; max-width: 360px; border-radius: 28px; background:#fff; padding: 24px; display:flex; flex-direction:column; align-items:center; text-align:center; gap: 12px; position:relative; z-index: 2; }
.result-card.winner { background:#fff9f1; }
.result-icon { font-size: 44px; }
.result-title { font-size: 30px; font-weight: 800; color:#111; }
.result-score { font-size: 34px; font-weight: 800; color:#6f58d9; }
.result-desc { font-size: 15px; line-height: 1.6; color:#5c5867; }
.result-actions { width: 100%; display:flex; flex-direction:column; gap: 10px; }
.btn-primary, .btn-secondary { width: 100%; min-height: 54px; border-radius: 20px; border:none; font-size:18px; font-weight:700; }
.btn-primary { background:#6f58d9; color:white; }
.btn-secondary { background:#efe7dd; color:#111; }
.confetti-container { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.confetti { position:absolute; top:-20px; width: 10px; height: 18px; background:#a8f0c6; animation: fall 2.2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes fall { from { transform: translateY(-30px) rotate(0deg); opacity: 1; } to { transform: translateY(100vh) rotate(240deg); opacity: 0; } }
</style>
