<script setup>
import { computed, watch, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { GameState } from '../state.js';
import { GameEngine } from '../engine.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const session = GameEngine.session;
const uiIcons = UI_ICONS;
const isFlipped = ref(false);
const { t } = useI18n();

const PHONETIC_DEBUG = true;

// Auto-play audio when word changes
watch(() => session.currentWord, (newWord) => {
  if (newWord) {
    if (PHONETIC_DEBUG) {
      console.log('[PhoneticDebug] word fields', {
        text: newWord.word,
        phonetic: newWord.phonetic,
        pronunciation: newWord.pronunciation,
        phoneticAm: newWord.phoneticAm,
        phoneticBr: newWord.phoneticBr,
        usphone: newWord.usphone,
        ukphone: newWord.ukphone,
        phonetics: newWord.phonetics
      });
    }
    // Select random example if available
    if (newWord.examples && newWord.examples.length > 0) {
      const ex = newWord.examples[Math.floor(Math.random() * newWord.examples.length)];
      // Mask the word (case insensitive)
      const escaped = String(newWord.word || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      session.currentExample = {
        original: ex,
        masked: ex.replace(regex, '______')
      };
    } else {
      session.currentExample = null;
    }
    
    // Reset flip state
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
  if (!session.isAnswered) {
    return 'option-default';
  }
  
  // 1. Correct Option (Always Green)
  if (option === session.correctOption) {
    return 'option-correct';
  }
  
  // 2. User Selected Wrong Option (Red)
  if (option === session.selectedOption && option !== session.correctOption) {
    return 'option-wrong';
  }
  
  // 3. Other distractors (Faded)
  return 'option-faded';
};

watch(() => session.isAnswered, (answered) => {
  if (answered) {
    // Answer result is shown on back side via auto flip.
    isFlipped.value = true;
  }
});

onMounted(() => {
  nextTick(() => {
    if (!session.currentWord?.word) return;
    if (session.currentIndex !== 0) return;
    if (session.isAnswered) return;
    GameEngine.playAudio(session.currentWord.word, { dedupeWindowMs: 800 });
  });
});

onUnmounted(() => {
  GameEngine.stopAudio();
});
</script>

<template>
  <view class="game-arena">
    <!-- 顶部导航 -->
    <view class="arena-header">
      <view class="back-btn" @click="GameEngine.quitSession()">
        <text class="back-icon">←</text>
      </view>
      <text class="progress-text">{{ progressLabel }}</text>
      <view class="header-placeholder"></view>
    </view>
    
    <!-- 单词卡片 -->
    <view class="card-container">
      <view 
        class="word-card"
        :class="{ flipped: isFlipped }"
      >
        <!-- 正面：单词 -->
        <view class="card-front">
          <text class="word-text">{{ session.currentWord?.word }}</text>
          <text class="example-text">{{ session.currentExample?.masked || t('arena_no_example') }}</text>
        </view>
        
        <!-- 背面：答题反馈 -->
        <view class="card-back">
          <view class="card-label">{{ t('arena_label_result') }}</view>
          <view class="result-icon">{{ session.isCorrect ? '✓' : '✗' }}</view>
          <text class="result-title">{{ session.isCorrect ? t('arena_correct') : t('arena_wrong') }}</text>
          <text class="meaning-text">{{ session.currentWord?.meanings?.[0] || session.correctOption }}</text>
          <view class="divider"></view>
          <view v-if="session.isCorrect" class="rewards">
            <text class="reward">+{{ session.lastAwardXP }} XP</text>
            <text class="reward">+{{ session.lastAwardCoins }} 金币</text>
          </view>
          <text v-else class="result-hint">{{ t('arena_wrong_hint') }}</text>
        </view>
      </view>
    </view>
    
    <!-- 选项按钮 - 答题后自动隐藏 -->
    <view class="options-container" v-if="!isFlipped && !session.isAnswered">
      <view class="options-row">
        <view 
          v-for="(option, index) in session.options.slice(0, 2)"
          :key="index"
          class="option-btn"
          :class="getOptionClass(option)"
          @click="handleAnswer(option)"
        >
          <text class="option-text">{{ String.fromCharCode(65 + index) }} {{ option }}</text>
        </view>
      </view>
      <view class="options-row">
        <view 
          v-for="(option, index) in session.options.slice(2, 4)"
          :key="index + 2"
          class="option-btn"
          :class="getOptionClass(option)"
          @click="handleAnswer(option)"
        >
          <text class="option-text">{{ String.fromCharCode(65 + index + 2) }} {{ option }}</text>
        </view>
      </view>
    </view>

  </view>
</template>

<style scoped>
/* 页面容器 - Pencil 对齐 */
.game-arena {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 34.9rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 20.9rpx;
}

/* 顶部导航 */
.arena-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104.7rpx;
}

.back-btn {
  width: 76.7rpx;
  height: 76.7rpx;
  background: #ffffff;
  border-radius: 38.4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 31.4rpx;
  color: #111111;
  font-weight: 600;
}

.progress-text {
  font-size: 24.4rpx;
  color: #6b7280;
  font-weight: 500;
}

.life-text {
  font-size: 24.4rpx;
  color: #6b7280;
  font-weight: 600;
}

.header-placeholder {
  width: 76.7rpx;
  height: 76.7rpx;
}

/* 单词卡片容器 */
.card-container {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  margin-top: 10.5rpx;
}

/* 3D 翻转卡片 */
.word-card {
  width: 100%;
  height: 592rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.word-card.flipped {
  transform: rotateY(180deg);
}

/* 卡片正反面通用样式 */
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fcecc7;
  border-radius: 48.8rpx;
  box-shadow: none;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 27.9rpx;
}

.card-label {
  display: none;
}

/* 卡片正面 */
.card-front {
  justify-content: center;
}

.word-text {
  font-size: 59.3rpx;
  font-weight: 500;
  font-family: Georgia, "Times New Roman", serif;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.example-text {
  font-size: 26.2rpx;
  color: #6b6b6b;
  text-align: center;
  line-height: 1.45;
}

/* 卡片背面 */
.card-back {
  transform: rotateY(180deg);
  justify-content: center;
}

.meaning-text {
  font-size: 52rpx;
  font-weight: 600;
  color: #5A459D;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.4;
}

.divider {
  width: 80rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #5A459D, transparent);
  border-radius: 2rpx;
  margin-bottom: 40rpx;
}

/* 选项按钮区域 */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  height: 382rpx;
  justify-content: flex-start;
}

.options-row {
  display: flex;
  gap: 14rpx;
}

.option-btn {
  flex: 1;
  height: 170rpx;
  background: #ffffff;
  border-radius: 38.4rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.option-text {
  font-size: 27.9rpx;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: center;
}

/* 答题状态样式 */
.option-correct {
  background: #A8F0C6 !important;
  animation: correctPulse 0.5s ease;
}

.option-wrong {
  background: #FFB5D0 !important;
  animation: wrongShake 0.5s ease;
}

.option-faded {
  opacity: 0.5;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5rpx); }
  75% { transform: translateX(5rpx); }
}

/* 反馈遮罩 */
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.feedback-content {
  background: white;
  border-radius: 40rpx;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.feedback-content.correct {
  background: linear-gradient(135deg, #A8F0C6 0%, #7EE0A8 100%);
}

.feedback-content.wrong {
  background: linear-gradient(135deg, #FFB5D0 0%, #FF8AB3 100%);
}

.feedback-icon {
  font-size: 80rpx;
}

.feedback-text {
  font-size: 40rpx;
  font-weight: 800;
  color: white;
}

.rewards {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.reward {
  background: linear-gradient(135deg, #efe9ff 0%, #e1d7ff 100%);
  border: 2rpx solid rgba(90, 69, 157, 0.18);
  box-shadow: 0 6rpx 14rpx rgba(90, 69, 157, 0.12);
  padding: 14rpx 26rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #3f2f75;
  letter-spacing: 0.4rpx;
}
</style>
