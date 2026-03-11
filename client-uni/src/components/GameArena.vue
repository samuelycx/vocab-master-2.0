<script setup>
import { computed, watch, ref, onUnmounted } from 'vue';
import { GameState } from '../state.js';
import { GameEngine } from '../engine.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const session = GameEngine.session;
const uiIcons = UI_ICONS;
const isFlipped = ref(false);
const { t } = useI18n();
const lifeCount = ref(3);

// Auto-play audio when word changes
watch(() => session.currentWord, (newWord) => {
  if (newWord) {
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

const pickPhonetic = (word) => {
  if (!word) return '';
  const direct = word.phonetic || word.pronunciation || word.phoneticAm || word.phoneticBr || word.usphone || word.ukphone;
  if (direct && String(direct).trim()) return String(direct).trim();

  if (Array.isArray(word.phonetics)) {
    const item = word.phonetics.find((p) => p && typeof p.text === 'string' && p.text.trim());
    if (item && item.text) return String(item.text).trim();
  }
  return '';
};

const phoneticText = computed(() => {
  const p = pickPhonetic(session.currentWord);
  return p && String(p).trim() ? String(p).trim() : t('arena_no_phonetic');
});

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
      <text class="life-text">❤️ {{ lifeCount }}</text>
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
          <text class="word-phonetic">{{ phoneticText }}</text>
          <text class="example-text">答题后卡片翻转展示结果与奖励</text>
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
          <text class="option-text">{{ option }}</text>
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
          <text class="option-text">{{ option }}</text>
        </view>
      </view>
    </view>

    <view class="arena-footer">
      <text class="footer-score">Correct +10XP  +1 Coin</text>
      <view class="footer-submit" @click="handleAnswer(session.correctOption)">
        <text class="footer-submit-text">提交</text>
      </view>
    </view>

    <view class="flip-hint">
      <text class="flip-hint-text">Card flips to show answer / reward</text>
    </view>
    
  </view>
</template>

<style scoped>
/* 页面容器 - 紫色渐变背景 */
.game-arena {
  min-height: 100vh;
  background: #f7f3ec;
  padding: calc(var(--header-height, 88px) + 16rpx) 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 顶部导航 */
.arena-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: #ffffff;
  border: 1px solid #ebe4da;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.back-icon {
  font-size: 36rpx;
  color: #111827;
  font-weight: 700;
}

.progress-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.progress-bar {
  height: 16rpx;
  background: #e5e7eb;
  border-radius: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A8F0C6 0%, #F9E975 100%);
  border-radius: 32rpx;
  transition: width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 16rpx rgba(168, 240, 198, 0.5);
}

.progress-text {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 600;
  text-align: center;
}

.combo-display {
  padding: 12rpx 20rpx;
  background: #111827;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 181, 208, 0.4);
}

.combo-text {
  font-size: 20rpx;
  font-weight: 800;
  color: #f9fafb;
}

/* 单词卡片容器 */
.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  margin-bottom: 32rpx;
}

/* 3D 翻转卡片 */
.word-card {
  width: 100%;
  max-width: 620rpx;
  height: 720rpx;
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
  background: #FFFBF5;
  border-radius: 40rpx;
  box-shadow: 
    0 20rpx 60rpx rgba(0, 0, 0, 0.15),
    0 4rpx 0 rgba(255, 255, 255, 0.5) inset,
    0 -4rpx 0 rgba(0, 0, 0, 0.05) inset;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 48rpx 40rpx;
}

/* 卡片标签 */
.card-label {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
  margin-bottom: 40rpx;
  letter-spacing: 2rpx;
}

/* 卡片正面 */
.card-front {
  justify-content: center;
}

.word-text {
  font-size: 72rpx;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 20rpx;
  letter-spacing: 2rpx;
}

.word-phonetic {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.sound-btn {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  box-shadow: 
    0 4rpx 12rpx rgba(0, 0, 0, 0.1),
    0 2rpx 0 rgba(255, 255, 255, 0.8) inset;
  transition: all 0.2s ease;
}

.sound-btn:active {
  transform: scale(0.95);
  box-shadow: 
    0 2rpx 6rpx rgba(0, 0, 0, 0.1),
    0 1rpx 0 rgba(255, 255, 255, 0.8) inset;
}

.sound-icon-image {
  width: 40rpx;
  height: 40rpx;
}

.tap-hint {
  position: absolute;
  bottom: 40rpx;
  font-size: 24rpx;
  color: #bbb;
  font-weight: 500;
}

/* 卡片背面 */
.card-back {
  transform: rotateY(180deg);
  justify-content: flex-start;
  padding-top: 80rpx;
}

.meaning-text {
  font-size: 52rpx;
  font-weight: 800;
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

.example-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  margin: 30rpx 0;
  width: 100%;
  box-sizing: border-box;
  border: 1rpx solid rgba(90, 69, 157, 0.1);
}

.example-label {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.example-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
  padding: 0 20rpx;
}

/* 选项按钮区域 */
.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding-bottom: 20rpx;
}

.option-btn {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 
    0 4rpx 16rpx rgba(0, 0, 0, 0.1),
    0 2rpx 0 rgba(255, 255, 255, 0.8) inset;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.option-btn:active:not(.option-correct):not(.option-wrong) {
  transform: scale(0.98);
  box-shadow: 
    0 2rpx 8rpx rgba(0, 0, 0, 0.1),
    0 1rpx 0 rgba(255, 255, 255, 0.8) inset;
}

.option-badge {
  width: 48rpx;
  height: 48rpx;
  background: #f0f0f0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #5A459D;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

/* 答题状态样式 */
.option-correct {
  background: #A8F0C6 !important;
  animation: correctPulse 0.5s ease;
}

.option-correct .option-badge {
  background: rgba(255, 255, 255, 0.5);
}

.option-wrong {
  background: #FFB5D0 !important;
  animation: wrongShake 0.5s ease;
}

.option-wrong .option-badge {
  background: rgba(255, 255, 255, 0.5);
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
