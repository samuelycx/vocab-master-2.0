<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { DEFAULT_LEARN_COUNT } from '../constants.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const lastSession = computed(() => GameState.game.lastSession || { xp: 0, coins: 0, correct: 0, total: 0 });
const { t } = useI18n();
const uiIcons = UI_ICONS;

const accuracy = computed(() => {
    if (!lastSession.value.total) return 0;
    return Math.round((lastSession.value.correct / lastSession.value.total) * 100);
});

const goHome = () => {
    Actions.setView('dashboard');
};

const learnAgain = () => {
    GameEngine.startSession(DEFAULT_LEARN_COUNT);
    Actions.setView('arena');
};
</script>

<template>
    <view class="result-page">
        <view class="result-header">
            <view class="back-btn" @click="goHome">
                <text class="back-icon">←</text>
            </view>
            <text class="header-title">学习结果</text>
            <view class="header-spacer"></view>
        </view>

        <view class="hero-card">
            <text class="hero-icon">🎉</text>
            <text class="hero-title">干得漂亮！</text>
            <text class="hero-sub">今天又进步了一点</text>
        </view>

        <view class="reward-row">
            <view class="reward-card xp">
                <text class="reward-value">+{{ lastSession.xp }}</text>
                <text class="reward-label">XP</text>
            </view>
            <view class="reward-card coin">
                <text class="reward-value">+{{ lastSession.coins }}</text>
                <text class="reward-label">COIN</text>
            </view>
        </view>

        <view class="stats-card">
            <text class="stats-title">本轮统计</text>
            <view class="stat-row">
                <text class="stat-label">{{ t('result_correct') }}</text>
                <text class="stat-value">{{ lastSession.correct }} / {{ lastSession.total }}</text>
            </view>
            <view class="stat-row">
                <text class="stat-label">{{ t('result_accuracy') }}</text>
                <text class="stat-value">{{ accuracy }}%</text>
            </view>
        </view>

        <view class="actions-row">
            <view class="btn-primary" @click="learnAgain">
                <text>再学一次</text>
            </view>
            <view class="btn-secondary" @click="goHome">
                <text>返回首页</text>
            </view>
        </view>
    </view>
</template>

<style scoped>
.result-page {
    min-height: 100vh;
    background: #f6f1e8;
    padding: 108.1rpx 41.9rpx 41.9rpx;
    display: flex;
    flex-direction: column;
    gap: 27.9rpx;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90.7rpx;
}

.back-btn {
    width: 73.3rpx;
    height: 73.3rpx;
    background: #ffffff;
    border-radius: 36.6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-icon {
    font-size: 31.4rpx;
    font-weight: 800;
    color: #111827;
}

.header-title {
    font-size: 34.9rpx;
    font-weight: 800;
    color: #1a1a1a;
}

.header-spacer {
    width: 73.3rpx;
    height: 73.3rpx;
}

.hero-card {
    height: 314rpx;
    border-radius: 41.9rpx;
    background: #fff9f1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
}

.hero-icon {
    font-size: 73.3rpx;
}

.hero-title {
    font-size: 55.8rpx;
    font-weight: 800;
    color: #1a1a1a;
}

.hero-sub {
    font-size: 24.4rpx;
    font-weight: 400;
    color: #6b6b6b;
}

.reward-row {
    display: flex;
    gap: 20.9rpx;
    height: 184.9rpx;
}

.reward-card {
    flex: 1;
    border-radius: 34.9rpx;
    background: #dcd3ff;
    padding: 27.9rpx;
    display: flex;
    flex-direction: column;
    gap: 10.5rpx;
}

.reward-card.coin {
    background: #fcecc7;
}

.reward-value {
    font-size: 59.3rpx;
    font-weight: 800;
    color: #1a1a1a;
}

.reward-label {
    font-size: 20.9rpx;
    font-weight: 700;
    color: #1a1a1a;
}

.stats-card {
    height: 279.1rpx;
    border-radius: 38.4rpx;
    background: #ffffff;
    padding: 27.9rpx;
    display: flex;
    flex-direction: column;
    gap: 20.9rpx;
}

.stats-title {
    font-size: 24.4rpx;
    font-weight: 700;
    color: #6b6b6b;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48.8rpx;
}

.stat-label {
    font-size: 27.9rpx;
    font-weight: 600;
    color: #6b6b6b;
}

.stat-value {
    font-size: 31.4rpx;
    font-weight: 800;
    color: #1a1a1a;
}

.actions-row {
    height: 170.9rpx;
    display: flex;
    gap: 20.9rpx;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    border-radius: 34.9rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 31.4rpx;
    font-weight: 800;
}

.btn-primary {
    background: #6f58d9;
    color: #ffffff;
}

.btn-secondary {
    background: #ffffff;
    color: #1a1a1a;
}
</style>
