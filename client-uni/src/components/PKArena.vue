<script setup>
import { computed, watch, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { SocketManager } from '../socket.js';
import { useI18n } from '../i18n.js';

const session = GameEngine.session;
const pk = computed(() => GameState.game.pk);
const user = GameState.user;
const isSearching = ref(false);
const isInLobby = ref(true);
const joinCode = ref('');
const { t } = useI18n();

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2SJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

const isEmoji = (str) => {
    if (!str || typeof str !== 'string') return false;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
};

const getAvatarUrl = (avatar) => {
    if (!avatar || isEmoji(avatar)) return DEFAULT_AVATAR;
    if (avatar.startsWith('http')) return avatar;
    return DEFAULT_AVATAR;
};

const getPhoneticText = (word) => {
    if (!word) return '';
    const direct = word.phonetic || word.pronunciation || word.phoneticAm || word.phoneticBr || word.usphone || word.ukphone;
    if (direct && String(direct).trim()) return String(direct).trim();
    if (Array.isArray(word.phonetics)) {
        const item = word.phonetics.find((p) => p && typeof p.text === 'string' && p.text.trim());
        if (item && item.text) return String(item.text).trim();
    }
    return '';
};

const startPK = (mode) => {
    GameState.game.pk.mode = mode;
    if (mode === 'bot') {
        isInLobby.value = false;
        GameEngine.startPKSession();
    } else if (mode === 'online') {
        isInLobby.value = false;
        isSearching.value = true;
        try {
            SocketManager.joinQueue(user.id, user.username, user.avatar);
        } catch (err) {
            console.error('Failed to join queue:', err);
            isSearching.value = false;
            uni.showToast({ title: t('pk_connect_error'), icon: 'none' });
        }
    }
};

const quitPK = () => {
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
    SocketManager.leaveQueue();
    isSearching.value = false;
    isInLobby.value = true;
    Actions.setView('dashboard');
};

const playAgain = () => {
    isInLobby.value = true;
};

watch(() => pk.value.isActive, (active) => {
    if (active) {
        isInLobby.value = false;
        isSearching.value = false;
    }
});

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
</script>

<template>
    <view class="pk-page">
        
        <!-- Header -->
        <view class="pk-header">
            <view class="back-btn" @click="quitPK">
                <text class="back-icon">←</text>
            </view>
            
            <view class="pk-title">{{ t('pk_title') }}</view>
            
            <view class="placeholder"></view>
        </view>

        <!-- Lobby -->
        <view v-if="isInLobby" class="lobby">
            <view class="lobby-icon animate-bounce">⚔️</view>
            
            <text class="lobby-title">{{ t('pk_lobby_title') }}</text>
            
            <text class="lobby-sub">{{ t('pk_lobby_sub') }}</text>
            
            <view class="mode-cards">
                <view class="mode-card ranked" @click="startPK('online')">
                    <view class="mode-icon">🏅</view>
                    
                    <view class="mode-info">
                        <text class="mode-name">{{ t('pk_ranked') }}</text>
                        <text class="mode-desc">{{ t('pk_ranked_sub') }}</text>
                    </view>
                    
                    <view class="mode-arrow">→</view>
                </view>
                
                <view class="mode-card practice" @click="startPK('bot')">
                    <view class="mode-icon">🤖</view>
                    
                    <view class="mode-info">
                        <text class="mode-name">{{ t('pk_practice') }}</text>
                        <text class="mode-desc">{{ t('pk_practice_sub') }}</text>
                    </view>
                    
                    <view class="mode-arrow">→</view>
                </view>
            </view>
        </view>

        <!-- Searching -->
        <view v-else-if="isSearching" class="searching">
            <view class="search-ring">
                <view class="search-icon">🛰️</view>
            </view>
            
            <text class="search-title">{{ t('pk_searching') }}</text>
            
            <text class="search-sub">{{ t('pk_searching_sub') }}</text>
            
            <view class="cancel-btn" @click="quitPK">{{ t('pk_cancel') }}</view>
        </view>

        <!-- Game Interface -->
        <view v-else-if="pk.isActive" class="game-interface">
            <!-- Score Board -->
            <view class="score-board">
                <!-- User -->
                <view class="player user">
                    <view class="player-avatar">
                        <image :src="getAvatarUrl(user.avatar)" class="avatar-img" />
                    </view>
                    
                    <view class="player-info">
                        <text class="player-name">{{ user.nickname || user.username }}</text>
                        
                        <view class="score-bar">
                            <view 
                                class="score-fill user"
                                :style="{ width: Math.min((pk.userScore / WIN_SCORE) * 100, 100) + '%' }"
                            ></view>
                        </view>
                    </view>
                    
                    <text class="score-text">{{ pk.userScore }}</text>
                </view>

                <!-- VS -->
                <view class="vs-badge">
                    <text>VS</text>
                </view>

                <!-- Opponent -->
                <view class="player opponent">
                    <text class="score-text">{{ pk.opponent?.score || 0 }}</text>
                    
                    <view class="player-info">
                        <text class="player-name">{{ pk.opponent?.name || t('pk_waiting') }}</text>
                        
                        <view class="score-bar">
                            <view 
                                class="score-fill opponent"
                                :style="{ width: Math.min(((pk.opponent?.score || 0) / WIN_SCORE) * 100, 100) + '%' }"
                            ></view>
                        </view>
                    </view>
                    
                    <view class="player-avatar">
                        <image :src="getAvatarUrl(pk.opponent?.avatar)" class="avatar-img" />
                    </view>
                </view>
            </view>

            <!-- Word Card -->
            <view class="word-section">
                <view class="word-card">
                    <text class="word-label">{{ session.currentWord?.partOfSpeech || t('pk_word_default') }}</text>
                    
                    <text class="word-text">{{ session.currentWord?.word }}</text>
                    
                    <text class="word-phonetic">{{ getPhoneticText(session.currentWord) || t('arena_no_phonetic') }}</text>
                    
                    <view class="word-sound" @click="GameEngine.playAudio(session.currentWord?.word)">
                        <text>🔊</text>
                    </view>
                </view>
            </view>

            <!-- Options -->
            <view class="options-grid">
                <view 
                    v-for="(option, idx) in session.options"
                    :key="idx"
                    class="option-btn"
                    :class="getOptionClass(option)"
                    @click="handleAnswer(option)"
                >
                    <view class="option-letter">{{ String.fromCharCode(65 + idx) }}</view>
                    
                    <text class="option-text">{{ option }}</text>
                    
                    <view v-if="session.isAnswered && option === session.correctOption" class="option-mark correct">✓</view>
                    
                    <view v-if="session.isAnswered && option === session.selectedOption && option !== session.correctOption" class="option-mark wrong">✗</view>
                </view>
            </view>

            <!-- Feedback -->
            <view v-if="session.isAnswered" class="feedback-overlay">
                <view class="feedback-box" :class="{ correct: session.isCorrect, wrong: !session.isCorrect }">
                    <text class="feedback-icon">{{ session.isCorrect ? '🎉' : '💪' }}</text>
                    
                    <text class="feedback-text">{{ session.isCorrect ? t('pk_great') : t('pk_keep_going') }}</text>
                    
                    <view v-if="session.isCorrect" class="feedback-rewards">
                        <text class="reward">+{{ session.lastAwardXP || 10 }} XP</text>
                        <text class="reward">+{{ session.lastAwardCoins || 1 }} 💰</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- Result -->
        <view v-if="pk.winner" class="result-overlay">
            <view class="confetti-container">
                <view v-for="i in 20" :key="i" class="confetti" :style="{
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 2 + 's',
                    backgroundColor: ['#A8F0C6', '#A0D8F1', '#F9E975', '#FFB5D0', '#7B66C5'][Math.floor(Math.random() * 5)]
                }"></view>
            </view>

            <view class="result-card" :class="{ winner: pk.winner === 'user' }">
                <text class="result-icon">{{ pk.winner === 'user' ? '🏆' : '💪' }}</text>
                
                <text class="result-title">{{ pk.winner === 'user' ? t('pk_win') : t('pk_lose') }}</text>
                
                <view class="result-score">
                    <text class="score-display">{{ pk.userScore }} - {{ pk.opponent?.score || 0 }}</text>
                </view>
                
                <text class="result-desc">
                    {{ pk.winner === 'user' ? t('pk_win_desc') : t('pk_lose_desc') }}
                </text>
                
                <view class="result-actions">
                    <view class="btn-primary" @click="playAgain">{{ t('pk_play_again') }}</view>
                    
                    <view class="btn-secondary" @click="quitPK">{{ t('pk_back_home') }}</view>
                </view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.pk-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #5A459D 0%, #7B66C5 50%, #9B8AD5 100%);
  padding: calc(var(--header-height, 88px) + 16rpx) 28rpx 28rpx;
  display: flex;
  flex-direction: column;
}

/* Header */
.pk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 36rpx;
  font-weight: 700;
  color: white;
}

.pk-title {
  font-size: 36rpx;
  font-weight: 900;
  color: white;
}

.placeholder {
  width: 72rpx;
}

/* Lobby */
.lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.lobby-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
}

.lobby-title {
  font-size: 44rpx;
  font-weight: 900;
  color: white;
  margin-bottom: 16rpx;
}

.lobby-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 60rpx;
}

.mode-cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.mode-card {
  background: white;
  border-radius: 28rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
}

.mode-card.ranked {
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
}

.mode-card:active {
  transform: scale(0.98);
}

.mode-icon {
  font-size: 48rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 34rpx;
  font-weight: 800;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.mode-card.ranked .mode-name {
  color: white;
}

.mode-desc {
  font-size: 26rpx;
  color: #999;
}

.mode-card.ranked .mode-desc {
  color: rgba(255, 255, 255, 0.6);
}

.mode-arrow {
  font-size: 32rpx;
  font-weight: 700;
  color: #999;
}

.mode-card.ranked .mode-arrow {
  color: white;
}

/* Searching */
.searching {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.search-ring {
  width: 200rpx;
  height: 200rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.1);
  border-top-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 1.5s linear infinite;
  margin-bottom: 40rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-icon {
  font-size: 80rpx;
  animation: none;
}

.search-title {
  font-size: 40rpx;
  font-weight: 900;
  color: white;
  margin-bottom: 16rpx;
}

.search-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 60rpx;
}

.cancel-btn {
  padding: 24rpx 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: white;
}

.cancel-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

/* Game Interface */
.game-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Score Board */
.score-board {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.player {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.player.user {
  justify-content: flex-start;
}

.player.opponent {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.player-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 24rpx;
  font-weight: 700;
  color: white;
  display: block;
  margin-bottom: 8rpx;
}

.score-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.score-fill.user {
  background: #A8F0C6;
}

.score-fill.opponent {
  background: #FFB5D0;
}

.score-text {
  font-size: 36rpx;
  font-weight: 900;
  color: white;
  min-width: 60rpx;
  text-align: center;
}

.vs-badge {
  width: 60rpx;
  height: 60rpx;
  background: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 900;
  color: white;
  font-style: italic;
  animation: vsPulse 2s ease-in-out infinite;
}

@keyframes vsPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Word Section */
.word-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.word-card {
  background: #FFFBF5;
  border-radius: 40rpx;
  padding: 60rpx;
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.word-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 32rpx;
  letter-spacing: 2rpx;
}

.word-text {
  font-size: 64rpx;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 20rpx;
  font-family: var(--font-serif, Georgia, serif);
}

.word-phonetic {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.word-sound {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.word-sound:active {
  transform: scale(0.95);
}

/* Options */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.option-btn {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.option-btn:active:not(.option-correct):not(.option-wrong) {
  transform: scale(0.98);
}

.option-letter {
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

.option-mark {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.option-mark.correct {
  background: white;
  color: #22c55e;
}

.option-mark.wrong {
  background: white;
  color: #ef4444;
}

/* Feedback */
.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.feedback-box {
  background: white;
  border-radius: 40rpx;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 32rpx 80rpx rgba(0, 0, 0, 0.3);
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.feedback-box.correct {
  background: linear-gradient(135deg, #A8F0C6 0%, #7EE0A8 100%);
}

.feedback-box.wrong {
  background: linear-gradient(135deg, #FFFBF5 0%, #F5F0E8 100%);
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.feedback-icon {
  font-size: 80rpx;
}

.feedback-text {
  font-size: 44rpx;
  font-weight: 900;
  color: white;
}

.feedback-box.wrong .feedback-text {
  color: #5A459D;
}

.feedback-rewards {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.reward {
  background: rgba(255, 255, 255, 0.3);
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: white;
}

/* Result */
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 40rpx;
}

.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  top: -20rpx;
  border-radius: 50%;
  animation: confettiFall 3s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(120vh) rotate(720deg) scale(0.5);
    opacity: 0;
  }
}

.result-card {
  background: #FFFBF5;
  border-radius: 48rpx;
  padding: 80rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 32rpx 80rpx rgba(0, 0, 0, 0.3);
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 100%;
  max-width: 560rpx;
}

.result-card.winner {
  background: linear-gradient(135deg, #A8F0C6 0%, #7EE0A8 100%);
}

@keyframes slideUp {
  0% { transform: translateY(100rpx); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.result-icon {
  font-size: 100rpx;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.result-title {
  font-size: 56rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
  color: #5A459D;
}

.result-card.winner .result-title {
  color: white;
}

.result-score {
  background: rgba(255, 255, 255, 0.3);
  padding: 24rpx 48rpx;
  border-radius: 24rpx;
}

.score-display {
  font-size: 48rpx;
  font-weight: 900;
  color: #333;
}

.result-card.winner .score-display {
  color: white;
}

.result-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.result-card.winner .result-desc {
  color: rgba(255, 255, 255, 0.9);
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
  margin-top: 20rpx;
}

.btn-primary {
  width: 100%;
  padding: 32rpx;
  background: #1a1a1a;
  color: white;
  font-size: 32rpx;
  font-weight: 800;
  border-radius: 24rpx;
  text-align: center;
}

.btn-primary:active {
  transform: scale(0.98);
}

.result-card.winner .btn-primary {
  background: white;
  color: #2E8B57;
}

.btn-secondary {
  width: 100%;
  padding: 32rpx;
  background: transparent;
  color: #666;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 24rpx;
  border: 2rpx solid #ddd;
  text-align: center;
}

.btn-secondary:active {
  background: rgba(0, 0, 0, 0.05);
}

.result-card.winner .btn-secondary {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
