<script setup>
import { ref } from 'vue';
import { Actions } from '../state.js';
import { API } from '../api.js';

const isLoading = ref(false);

const start = async () => {
    isLoading.value = true;
    uni.showLoading({ title: '登录中...' });
    try {
        const res = await API.login();
        uni.hideLoading();
        
        if (res && res.success && res.data) {
            Actions.setUser(res.data);
            uni.setStorageSync('vocab_user', JSON.stringify(res.data));
        }
        
        Actions.setView('dashboard');
    } catch (err) {
        uni.hideLoading();
        console.error('Login failed', err);
        uni.showToast({ title: '登录失败', icon: 'none' });
    } finally {
        isLoading.value = false;
    }
};

const openPreview = () => {
    Actions.setView('preview');
};
</script>

<template>
    <view class="welcome-page">
        <!-- 背景装饰 -->
        <view class="bg-decoration">
            <view class="bg-circle circle-1"></view>
            <view class="bg-circle circle-2"></view>
            <view class="bg-circle circle-3"></view>
        </view>

        <!-- 主内容 -->
        <view class="welcome-content">
            <!-- Logo -->
            <view class="logo-container animate-pop-in">
                <view class="logo">
                    <text class="logo-text">VM</text>
                </view>
                <view class="logo-glow"></view>
            </view>

            <!-- 标题 -->
            <view class="title-section animate-slide-in-up delay-100">
                <text class="title">Vocab</text>
                <text class="title-accent">Master</text>
            </view>

            <text class="subtitle animate-fade-in delay-200">Mastering words, one level at a time.</text>

            <!-- 开始按钮 -->
            <view class="start-section animate-slide-in-up delay-300">
                <view 
                    class="start-btn" 
                    :class="{ loading: isLoading }"
                    @click="start"
                >
                    <text class="start-text">Start Adventure</text>
                    <view class="start-icon">
                        <text>GO</text>
                    </view>
                </view>
            </view>

            <!-- 预览按钮 -->
            <view class="preview-section animate-fade-in delay-400">
                <view class="preview-btn" @click="openPreview">
                    <text>预览新UI</text>
                </view>
            </view>

            <!-- 版本 -->
            <text class="version animate-fade-in delay-500">University Edition • v2.0</text>
        </view>
    </view>
</template>

<style scoped>
.welcome-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #5A459D 0%, #7B66C5 50%, #9B8AD5 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx;
    position: relative;
    overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
}

.circle-1 {
    width: 400rpx;
    height: 400rpx;
    background: white;
    top: -100rpx;
    right: -100rpx;
    animation: float 6s ease-in-out infinite;
}

.circle-2 {
    width: 300rpx;
    height: 300rpx;
    background: #A8F0C6;
    bottom: -50rpx;
    left: -80rpx;
    animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
    width: 200rpx;
    height: 200rpx;
    background: #F9E975;
    top: 40%;
    left: -50rpx;
    animation: float 7s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20rpx); }
}

/* 主内容 */
.welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 560rpx;
    z-index: 1;
}

/* Logo */
.logo-container {
    position: relative;
    margin-bottom: 48rpx;
}

.logo {
    width: 200rpx;
    height: 200rpx;
    background: white;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 2;
}

.logo-text {
    font-size: 80rpx;
    font-weight: 900;
    color: #5A459D;
}

.logo-glow {
    position: absolute;
    inset: -20rpx;
    background: radial-gradient(circle, rgba(168, 240, 198, 0.5) 0%, transparent 70%);
    border-radius: 60rpx;
    animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
}

/* 标题 */
.title-section {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
}

.title {
    font-size: 56rpx;
    font-weight: 900;
    color: white;
    letter-spacing: 2rpx;
}

.title-accent {
    font-size: 56rpx;
    font-weight: 900;
    color: #A8F0C6;
    letter-spacing: 2rpx;
}

.subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 80rpx;
    text-align: center;
}

/* 开始按钮 */
.start-section {
    width: 100%;
    margin-bottom: 24rpx;
}

.start-btn {
    width: 100%;
    background: white;
    border-radius: 32rpx;
    padding: 36rpx 48rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
}

.start-btn:active {
    transform: scale(0.98);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.start-btn.loading {
    opacity: 0.7;
}

.start-text {
    font-size: 36rpx;
    font-weight: 900;
    color: #1a1a1a;
}

.start-icon {
    width: 64rpx;
    height: 64rpx;
    background: #5A459D;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(90, 69, 157, 0.4);
}

.start-icon text {
    font-size: 24rpx;
    font-weight: 900;
    color: white;
}

/* 预览按钮 */
.preview-section {
    margin-bottom: 48rpx;
}

.preview-btn {
    padding: 20rpx 48rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 24rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.preview-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

.preview-btn text {
    font-size: 26rpx;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
}

/* 版本 */
.version {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 4rpx;
    text-transform: uppercase;
}

/* 动画类 */
.animate-pop-in {
    animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-slide-in-up {
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-fade-in {
    animation: fadeIn 0.5s ease forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

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
</style>
