<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { GameEngine } from '../engine.js';

const session = GameEngine.session;
const isFlipped = ref(false);

watch(() => session.currentWord, (newWord) => {
  if (newWord) {
    if (newWord.examples && newWord.examples.length > 0) {
      const ex = newWord.examples[Math.floor(Math.random() * newWord.examples.length)];
      const escaped = String(newWord.word || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      session.currentExample = {
        original: ex,
        masked: ex.replace(regex, '______'),
      };
    } else {
      session.currentExample = null;
    }
    isFlipped.value = false;
  }
}, { immediate: true });

const progressLabel = computed(() => `第 ${session.currentIndex + 1} / ${session.queue.length} 题`);

const handleAnswer = (option) => {
  if (session.isAnswered) return;
  GameEngine.submitAnswer(option);
};

const playAudio = () => {
  if (session.currentWord) {
    GameEngine.playAudio(session.currentWord.word);
  }
};

const getOptionClass = (option) => {
  if (!session.isAnswered) return 'option-default';
  if (option === session.correctOption) return 'option-correct';
  if (option === session.selectedOption && option !== session.correctOption) return 'option-wrong';
  return 'option-faded';
};

watch(() => session.isAnswered, (answered) => {
  if (answered) {
    isFlipped.value = true;
  }
});

onUnmounted(() => {
  GameEngine.stopAudio();
});
</script>

<template>
  <div class="game-arena">
    <div data-test="arena-header" class="arena-header">
      <button class="back-btn" @click="GameEngine.quitSession()">
        <span class="back-icon">←</span>
      </button>
      <div class="progress-text">{{ progressLabel }}</div>
      <div class="header-placeholder"></div>
    </div>

    <div class="card-container">
      <div data-test="arena-card" class="word-card" :class="{ flipped: isFlipped }">
        <div class="card-front">
          <div class="word-text">{{ session.currentWord?.word }}</div>
          <div class="example-text">{{ session.currentExample?.masked || '暂无例句' }}</div>
          <button class="audio-btn" @click="playAudio">🔊</button>
        </div>

        <div class="card-back">
          <div class="result-icon">{{ session.isCorrect ? '✓' : '✗' }}</div>
          <div class="result-title">{{ session.isCorrect ? '回答正确' : '回答错误' }}</div>
          <div class="meaning-text">{{ session.currentWord?.meanings?.[0] || session.correctOption }}</div>
          <div class="divider"></div>
          <div v-if="session.isCorrect" class="rewards">
            <span class="reward">+{{ session.lastAwardXP || 10 }} XP</span>
            <span class="reward">+{{ session.lastAwardCoins || 1 }} 金币</span>
          </div>
          <div v-else class="result-hint">记住正确释义，下一题继续加油</div>
        </div>
      </div>
    </div>

    <div v-if="!isFlipped && !session.isAnswered" data-test="arena-options" class="options-container">
      <div class="options-row">
        <button
          v-for="(option, index) in session.options.slice(0, 2)"
          :key="index"
          :data-test="`arena-option-${index}`"
          class="option-btn"
          :class="getOptionClass(option)"
          @click="handleAnswer(option)"
        >
          <span class="option-text">{{ String.fromCharCode(65 + index) }} {{ option }}</span>
        </button>
      </div>
      <div class="options-row">
        <button
          v-for="(option, index) in session.options.slice(2, 4)"
          :key="index + 2"
          :data-test="`arena-option-${index + 2}`"
          class="option-btn"
          :class="getOptionClass(option)"
          @click="handleAnswer(option)"
        >
          <span class="option-text">{{ String.fromCharCode(65 + index + 2) }} {{ option }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-arena {
  min-height: 100vh;
  background: #f6f1e8;
  padding: 108px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.arena-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.back-btn {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  transform: scale(0.96);
}

.back-icon {
  font-size: 18px;
  color: #111111;
  font-weight: 600;
}

.progress-text {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
}

.header-placeholder {
  width: 44px;
  height: 44px;
}

.card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  margin-top: 6px;
}

.word-card {
  width: 100%;
  height: 352px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.word-card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fcecc7;
  border-radius: 28px;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.card-front {
  justify-content: center;
}

.word-text {
  font-size: 38px;
  font-weight: 600;
  font-family: Georgia, "Times New Roman", serif;
  color: #1a1a1a;
  margin-bottom: 16px;
  text-align: center;
}

.example-text {
  font-size: 17px;
  color: #6b6b6b;
  text-align: center;
  line-height: 1.45;
}

.audio-btn {
  margin-top: 28px;
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  font-size: 22px;
}

.card-back {
  transform: rotateY(180deg);
}

.result-icon {
  font-size: 44px;
  margin-bottom: 12px;
}

.result-title {
  font-size: 26px;
  font-weight: 800;
  color: #1a1a1a;
}

.meaning-text {
  font-size: 30px;
  font-weight: 700;
  color: #5A459D;
  text-align: center;
  margin: 18px 0 24px;
  line-height: 1.35;
}

.divider {
  width: 52px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #5A459D, transparent);
  border-radius: 999px;
  margin-bottom: 20px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.options-row {
  display: flex;
  gap: 10px;
}

.option-btn {
  flex: 1;
  min-height: 88px;
  background: #ffffff;
  border: none;
  border-radius: 24px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-text {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: center;
}

.option-correct {
  background: #A8F0C6 !important;
}

.option-wrong {
  background: #FFB5D0 !important;
}

.option-faded {
  opacity: 0.5;
}

.rewards {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.reward {
  background: linear-gradient(135deg, #efe9ff 0%, #e1d7ff 100%);
  border: 1px solid rgba(90, 69, 157, 0.18);
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #3f2f75;
}

.result-hint {
  font-size: 16px;
  font-weight: 600;
  color: #6b6b6b;
}
</style>
