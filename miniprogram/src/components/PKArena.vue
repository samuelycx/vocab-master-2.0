<script setup>
import { computed, watch, ref, onUnmounted } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { SocketManager } from '../socket.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const session = GameEngine.session;
const pk = computed(() => GameState.game.pk);
const user = GameState.user;
const isSearching = ref(false);
const isInLobby = ref(true);
const joinCode = ref('');
const isFlipped = ref(false);
const { t } = useI18n();
const uiIcons = UI_ICONS;
const formatTimeLeft = computed(() => {
    const totalSeconds = Math.max(Number(session.timeLeft) || 0, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});
const footerRewardText = computed(() => {
    if (!session.isAnswered) return t('pk_reward_pending');
    return t('pk_reward_xp', { xp: session.lastAwardXP || 0 });
});

const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

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
}, { immediate: true });

watch(() => session.isAnswered, (answered) => {
    if (answered) {
        isFlipped.value = true;
    }
});

const startPK = (mode) => {
    GameState.game.pk.mode = mode;
    if (mode === 'bot') {
        isInLobby.value = false;
        GameEngine.startPKSession();
    } else if (mode === 'online') {
        isInLobby.value = false;
        isSearching.value = true;
        try {
            const uid = user.id || user._id || user.openid;
            if (!uid) {
                uni.showToast({ title: t('dashboard_login_first'), icon: 'none' });
                isSearching.value = false;
                return;
            }
            SocketManager.joinQueue(uid, user.username, user.avatar);
        } catch (err) {
            console.error('Failed to join queue:', err);
            isSearching.value = false;
            uni.showToast({ title: t('pk_connect_error'), icon: 'none' });
        }
    }
};

const quitPK = () => {
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
    GameEngine.quitSession();
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

onUnmounted(() => {
    GameEngine.stopAudio();
});
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
            <text class="lobby-title">{{ t('pk_lobby_title') }}</text>
            
            <text class="lobby-sub">{{ t('pk_lobby_sub') }}</text>
            
            <view class="mode-cards">
                <view class="mode-card ranked" @click="startPK('online')">
                    <view class="mode-icon">
                        <image class="mode-icon-image" :src="uiIcons.rank" mode="aspectFit" />
                    </view>
                    
                    <view class="mode-info">
                        <text class="mode-name">{{ t('pk_ranked') }}</text>
                        <text class="mode-desc">{{ t('pk_ranked_sub') }}</text>
                    </view>
                    
                    <view class="mode-arrow">→</view>
                </view>
                
                <view class="mode-card practice" @click="startPK('bot')">
                    <view class="mode-icon">
                        <image class="mode-icon-image" :src="uiIcons.bot" mode="aspectFit" />
                    </view>
                    
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
                <view class="search-icon">
                    <image class="search-icon-image" :src="uiIcons.sync" mode="aspectFit" />
                </view>
            </view>
            
            <text class="search-title">{{ t('pk_searching') }}</text>
            
            <text class="search-sub">{{ t('pk_searching_sub') }}</text>
            
            <view class="cancel-btn" @click="quitPK">{{ t('pk_cancel') }}</view>
        </view>

        <!-- Game Interface -->
        <view v-else-if="pk.isActive" class="pk-battle">
            <view class="pkb-top">
                <view class="pkb-me">
                    <view class="pkb-avatar me">我</view>
                    <text class="pkb-score">{{ pk.userScore }}</text>
                </view>
                <view class="pkb-vs">VS</view>
                <view class="pkb-op">
                    <text class="pkb-score">{{ pk.opponent?.score || 0 }}</text>
                    <view class="pkb-avatar op">AI</view>
                </view>
            </view>

            <view class="pkb-bars">
                <view class="pkb-bar">
                    <view class="pkb-bar-fill left" :style="{ width: Math.min((pk.userScore / WIN_SCORE) * 100, 100) + '%' }"></view>
                </view>
                <view class="pkb-bar">
                    <view class="pkb-bar-fill right" :style="{ width: Math.min(((pk.opponent?.score || 0) / WIN_SCORE) * 100, 100) + '%' }"></view>
                </view>
            </view>

            <view class="pkb-card-wrap">
                <view class="pkb-card" :class="{ flipped: isFlipped }">
                    <view class="pkb-card-face pkb-card-front">
                        <text class="pkb-word">{{ session.currentWord?.word }}</text>
                        <text class="pkb-example">{{ session.currentExample?.masked || t('arena_no_example') }}</text>
                    </view>

                    <view class="pkb-card-face pkb-card-back">
                        <view class="pkb-result-label">{{ t('arena_label_result') }}</view>
                        <view class="pkb-result-icon">{{ session.isCorrect ? '✓' : '✗' }}</view>
                        <text class="pkb-result-text">{{ session.isCorrect ? t('arena_correct') : t('arena_wrong') }}</text>
                        <text class="pkb-meaning">{{ session.currentWord?.meanings?.[0] || session.correctOption }}</text>
                        <view class="pkb-divider"></view>
                        <view v-if="session.isCorrect" class="pkb-rewards">
                            <text class="pkb-reward">+{{ session.lastAwardXP }} XP</text>
                            <text class="pkb-reward">{{ t('pk_reward_coin', { coins: session.lastAwardCoins }) }}</text>
                        </view>
                        <text v-else class="pkb-result-hint">{{ t('arena_wrong_hint') }}</text>
                    </view>
                </view>
            </view>

            <view v-if="!isFlipped && !session.isAnswered" class="pkb-ops">
                <view class="pkb-row">
                    <view class="pkb-op-btn" :class="getOptionClass(option)" v-for="(option, idx) in session.options.slice(0,2)" :key="idx" @click="handleAnswer(option)">
                        <text class="pkb-op-text">{{ String.fromCharCode(65 + idx) }} {{ option }}</text>
                    </view>
                </view>
                <view class="pkb-row">
                    <view class="pkb-op-btn" :class="getOptionClass(option)" v-for="(option, idx) in session.options.slice(2,4)" :key="idx + 2" @click="handleAnswer(option)">
                        <text class="pkb-op-text">{{ String.fromCharCode(65 + idx + 2) }} {{ option }}</text>
                    </view>
                </view>
            </view>

            <view class="pkb-foot">
                <text class="pkb-foot-left">{{ t('pk_time_left', { time: formatTimeLeft }) }}</text>
                <text class="pkb-foot-right">{{ footerRewardText }}</text>
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
                <image class="result-icon-image" :src="pk.winner === 'user' ? uiIcons.ok : uiIcons.pk" mode="aspectFit" />
                
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
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 34.9rpx;
  display: flex;
  flex-direction: column;
  gap: 24.4rpx;
}

/* Header */
.pk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 97.7rpx;
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

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 31.4rpx;
  font-weight: 600;
  color: #111111;
}

.pk-title {
  font-size: 45.3rpx;
  font-weight: 600;
  color: #111111;
}

.placeholder {
  width: 76.7rpx;
}

/* Lobby */
.lobby {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 58rpx 0 0;
}

.lobby-title {
  font-size: 38.4rpx;
  font-weight: 500;
  color: #111111;
  margin-bottom: 10.5rpx;
}

.lobby-sub {
  font-size: 22.4rpx;
  color: #6b7280;
  margin-bottom: 24.4rpx;
}

.mode-cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20.9rpx;
}

.mode-card {
  background: white;
  border-radius: 38.4rpx;
  padding: 27.9rpx;
  display: flex;
  align-items: center;
  gap: 20.9rpx;
  height: 129.1rpx;
}

.mode-card.ranked {
  background: #1a1a1a;
}

.mode-card:active {
  transform: scale(0.98);
}

.mode-icon {
  width: 76.7rpx;
  height: 76.7rpx;
  background: #2b2b2b;
  border-radius: 24.4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mode-icon-image {
  width: 41.9rpx;
  height: 41.9rpx;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 31.4rpx;
  font-weight: 500;
  color: #111111;
  display: block;
  margin-bottom: 6rpx;
}

.mode-card.ranked .mode-name {
  color: white;
}

.mode-desc {
  font-size: 24.4rpx;
  color: #6b7280;
}

.mode-card.ranked .mode-desc {
  color: rgba(255, 255, 255, 0.6);
}

.mode-arrow {
  font-size: 31.4rpx;
  font-weight: 600;
  color: #6b7280;
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
  padding: 0;
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
  animation: none;
}
.search-icon-image {
  width: 72rpx;
  height: 72rpx;
}

.search-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #111827;
  margin-bottom: 16rpx;
}

.search-sub {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 60rpx;
}

.cancel-btn {
  width: 100%;
  height: 129.1rpx;
  background: #6E58D9;
  border-radius: 31.4rpx;
  font-size: 31.4rpx;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: #ffffff;
  border: 1px solid #ebe4da;
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
  color: #111827;
  display: block;
  margin-bottom: 8rpx;
}

.score-bar {
  height: 8rpx;
  background: #e5e7eb;
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
  color: #111827;
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
  font-weight: 600;
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
}
.sound-icon-image {
  width: 40rpx;
  height: 40rpx;
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

/* PK Battle (Pencil 9VPcT) */
.pk-battle {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.pkb-top {
  height: 90.7rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.pkb-me,
.pkb-op {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5rpx;
}

.pkb-avatar {
  width: 76.7rpx;
  height: 76.7rpx;
  border-radius: 38.4rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #111111;
}

.pkb-score {
  font-size: 34.9rpx;
  font-weight: 500;
  color: #111111;
}

.pkb-vs {
  font-size: 31.4rpx;
  font-weight: 500;
  color: #6b7280;
}

.pkb-bars {
  display: flex;
  gap: 14rpx;
  height: 20.9rpx;
  margin-top: -3.5rpx;
}

.pkb-bar {
  flex: 1;
  height: 20.9rpx;
  border-radius: 999rpx;
  background: #EDE7DD;
  overflow: hidden;
}

.pkb-bar-fill {
  height: 100%;
  border-radius: 999rpx;
}

.pkb-bar-fill.left {
  background: #A8F0C6;
}

.pkb-bar-fill.right {
  background: #FFB5D0;
}

.pkb-card-wrap {
  height: 592rpx;
  perspective: 1000px;
}

.pkb-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pkb-card.flipped {
  transform: rotateY(180deg);
}

.pkb-card-face {
  position: absolute;
  inset: 0;
  border-radius: 48.8rpx;
  background: #FCECC7;
  padding: 27.9rpx;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pkb-card-front {
  gap: 18rpx;
}

.pkb-card-back {
  transform: rotateY(180deg);
  background: #FFF9F1;
}

.pkb-word {
  font-size: 59.3rpx;
  font-weight: 500;
  color: #1a1a1a;
  font-family: var(--font-serif, Georgia, serif);
  text-align: center;
}

.pkb-example {
  font-size: 24.4rpx;
  color: #6b6b6b;
  line-height: 1.5;
  text-align: center;
}

.pkb-result-label {
  font-size: 20.9rpx;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.pkb-result-icon {
  font-size: 52rpx;
  color: #111111;
  line-height: 1;
  margin-bottom: 12rpx;
}

.pkb-result-text {
  font-size: 41.9rpx;
  font-weight: 500;
  color: #111111;
  margin-bottom: 18rpx;
}

.pkb-meaning {
  font-size: 55.8rpx;
  font-weight: 600;
  color: #5A459D;
  text-align: center;
  line-height: 1.25;
}

.pkb-divider {
  width: 80rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #5A459D, transparent);
  border-radius: 2rpx;
  margin: 36rpx 0;
}

.pkb-rewards {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.pkb-reward {
  background: linear-gradient(135deg, #efe9ff 0%, #e1d7ff 100%);
  border: 2rpx solid rgba(90, 69, 157, 0.18);
  box-shadow: 0 6rpx 14rpx rgba(90, 69, 157, 0.12);
  padding: 14rpx 26rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #3f2f75;
}

.pkb-result-hint {
  font-size: 24.4rpx;
  color: #6b7280;
  font-weight: 600;
}

.pkb-ops {
  height: 400rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  justify-content: center;
}

.pkb-row {
  display: flex;
  gap: 14rpx;
}

.pkb-op-btn {
  flex: 1;
  height: 170rpx;
  background: #ffffff;
  border-radius: 38.4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
}

.pkb-op-text {
  font-size: 27.9rpx;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: center;
}

.pkb-foot {
  height: 97.7rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6b7280;
  font-size: 24.4rpx;
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

.result-icon-image {
  width: 90rpx;
  height: 90rpx;
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.result-title {
  font-size: 56rpx;
  font-weight: 600;
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
  font-weight: 600;
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
