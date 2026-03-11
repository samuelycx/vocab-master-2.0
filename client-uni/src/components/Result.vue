<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
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
    GameEngine.startSession(10);
    Actions.setView('arena');
};
</script>

<template>
    <view class="result-page">
        <view class="result-header">
            <view class="back-btn" @click="goHome">
                <text class="back-icon">←</text>
            </view>
            <view class="header-spacer"></view>
        </view>

        <!-- 撒花特效 -->
        <view class="confetti-container">
            <view v-for="i in 25" :key="i" class="confetti" :style="{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's',
                backgroundColor: ['#A8F0C6', '#A0D8F1', '#F9E975', '#FFB5D0', '#7B66C5'][Math.floor(Math.random() * 5)]
            }"></view>
        </view>

        <!-- 主内容 -->
        <view class="result-content">
            <!-- 图标 -->
            <view class="result-icon animate-pop-in">
                <image class="result-icon-image" :src="uiIcons.ok" mode="aspectFit" />
            </view>

            <!-- 标题 -->
            <text class="result-title animate-slide-in-up">{{ t('result_well_done') }}</text>
            <text class="result-subtitle animate-fade-in">{{ t('result_subtitle') }}</text>

            <!-- XP 和金币 -->
            <view class="rewards-row animate-slide-in-up delay-100">
                <view class="reward-card xp">
                    <text class="reward-value">+{{ lastSession.xp }}</text>
                    <text class="reward-label">XP</text>
                </view>
                
                <view class="reward-card coins">
                    <text class="reward-value">+{{ lastSession.coins }}</text>
                    <view class="reward-coin-wrap">
                        <image class="reward-coin-icon" :src="uiIcons.coin" mode="aspectFit" />
                        <text class="reward-label">COIN</text>
                    </view>
                </view>
            </view>

            <!-- 统计 -->
            <view class="stats-card animate-scale-in delay-200">
                <view class="stat-row">
                    <text class="stat-label">{{ t('result_correct') }}</text>
                    <text class="stat-value">{{ lastSession.correct }} / {{ lastSession.total }}</text>
                </view>
                
                <view class="stat-divider"></view>
                
                <view class="stat-row">
                    <text class="stat-label">{{ t('result_accuracy') }}</text>
                    <text class="stat-value accuracy">{{ accuracy }}%</text>
                </view>
            </view>

            <!-- 按钮 -->
            <view class="buttons animate-slide-in-up delay-300">
                <view class="btn-primary" @click="learnAgain">
                    <text>{{ t('result_learn_again') }}</text>
                </view>
                
                <view class="btn-secondary" @click="goHome">
                    <text>{{ t('result_back_home') }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.result-page {
    min-height: 100vh;
    background: #f7f3ec;
    padding: calc(var(--header-height, 88px) + 40rpx) 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.result-header {
    position: absolute;
    top: calc(var(--header-height, 88px) + 8rpx);
    left: 28rpx;
    right: 28rpx;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    backdrop-filter: blur(10rpx);
}

.back-btn:active {
    transform: scale(0.95);
}

.back-icon {
    font-size: 36rpx;
    font-weight: 700;
    color: #111827;
}

.header-spacer {
    width: 72rpx;
}

/* 撒花特效 */
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

/* 主内容 */
.result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 560rpx;
}

/* 图标 */
.result-icon {
    width: 140rpx;
    height: 140rpx;
    border-radius: 36rpx;
    background: #ffffff;
    border: 1px solid #ebe4da;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
    animation: iconBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.result-icon-image {
    width: 88rpx;
    height: 88rpx;
}

@keyframes iconBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

/* 标题 */
.result-title {
    font-size: 64rpx;
    font-weight: 900;
    color: #111827;
    letter-spacing: 4rpx;
    margin-bottom: 12rpx;
}

.result-subtitle {
    font-size: 28rpx;
    color: #6b7280;
    margin-bottom: 48rpx;
}

/* 奖励 */
.rewards-row {
    display: flex;
    gap: 24rpx;
    margin-bottom: 40rpx;
}

.reward-card {
    background: white;
    border-radius: 24rpx;
    padding: 32rpx 48rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    min-width: 160rpx;
}

.reward-card.xp {
    background: linear-gradient(135deg, #A8F0C6 0%, #7EE0A8 100%);
}

.reward-card.coins {
    background: linear-gradient(135deg, #F9E975 0%, #E5D450 100%);
}

.reward-value {
    font-size: 48rpx;
    font-weight: 900;
    color: #1a1a1a;
    display: block;
    margin-bottom: 8rpx;
}

.reward-label {
    font-size: 24rpx;
    font-weight: 700;
    color: #333;
}
.reward-coin-wrap {
    display: flex;
    align-items: center;
    gap: 8rpx;
}
.reward-coin-icon {
    width: 30rpx;
    height: 30rpx;
}

/* 统计卡片 */
.stats-card {
    background: white;
    border-radius: 32rpx;
    padding: 40rpx;
    width: 100%;
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.15);
    margin-bottom: 48rpx;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-label {
    font-size: 28rpx;
    color: #666;
    font-weight: 600;
}

.stat-value {
    font-size: 36rpx;
    font-weight: 800;
    color: #1a1a1a;
}

.stat-value.accuracy {
    color: #5A459D;
}

.stat-divider {
    height: 2rpx;
    background: #f0f0f0;
    margin: 24rpx 0;
}

/* 按钮 */
.buttons {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.btn-primary {
    width: 100%;
    padding: 32rpx;
    background: white;
    color: #5A459D;
    font-size: 32rpx;
    font-weight: 800;
    border-radius: 24rpx;
    text-align: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
}

.btn-primary:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.btn-secondary {
    width: 100%;
    padding: 32rpx;
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    font-size: 28rpx;
    font-weight: 700;
    border-radius: 24rpx;
    text-align: center;
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.2s ease;
}

.btn-secondary:active {
    background: rgba(255, 255, 255, 0.1);
}

/* 动画类 */
.animate-pop-in {
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-slide-in-up {
    animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-fade-in {
    animation: fadeIn 0.4s ease forwards;
}

.animate-scale-in {
    animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

@keyframes popIn {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
}

@keyframes slideInUp {
    0% { opacity: 0; transform: translateY(40rpx); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

@keyframes scaleIn {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
}
</style>
