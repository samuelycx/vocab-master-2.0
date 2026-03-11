<script setup>
import { ref, computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const user = GameState.user;
const state = GameState;
const uiIcons = UI_ICONS;

const currentTab = ref('dashboard');

const tabs = [
  { key: 'dashboard', label: '首页' },
  { key: 'learn', label: '学习' },
  { key: 'pk', label: 'PK' },
  { key: 'result', label: '完成' },
];

const stats = computed(() => ({
  total: user.totalCorrect || 0,
  learning: Math.floor((user.totalCorrect || 0) * 0.3),
  mastered: Math.floor((user.totalCorrect || 0) * 0.7),
  todayLearned: state.game.todayLearned || 0
}));

const progressPercent = computed(() => {
  return Math.min((state.game.todayLearned / 10) * 100, 100);
});

const reviewCount = ref(5);

const startLearning = () => {
  Actions.setView('arena');
};

const startPK = () => {
  Actions.setView('pk');
};

const viewLeaderboard = () => {
  console.log('查看排行榜');
};

const switchTab = (tab) => {
  currentTab.value = tab;
};

const goBack = () => {
  Actions.setView('dashboard');
};
</script>

<template>
  <view class="preview-container">
    <!-- 顶部Tab切换 -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 首页预览 -->
    <view v-if="currentTab === 'dashboard'" class="preview-content">
      <!-- 紫色渐变头部 -->
      <view class="header">
        <view class="header-content">
          <text class="header-title">Learn new</text>
          <text class="header-title">words easily</text>
        </view>
        <view class="user-info">
          <view class="avatar-circle">
            <text class="avatar-text">U</text>
          </view>
          <text class="username">{{ user.username || 'User' }}</text>
        </view>
      </view>
      
      <!-- 2x2糖果色卡片 -->
      <view class="stats-grid">
        <view class="stat-card mint">
          <image class="stat-icon-image" :src="uiIcons.book" mode="aspectFit" />
          <text class="stat-title">Total</text>
          <text class="stat-count">{{ stats.total }}</text>
          <view class="stat-trend">
            <text class="trend-badge">+{{ stats.todayLearned }}</text>
            <text class="trend-label">today</text>
          </view>
        </view>
        
        <view class="stat-card blue">
          <image class="stat-icon-image" :src="uiIcons.search" mode="aspectFit" />
          <text class="stat-title">Learning</text>
          <text class="stat-count">{{ stats.learning }}</text>
          <view class="stat-trend">
            <text class="trend-badge">+{{ Math.floor(stats.todayLearned * 0.3) }}</text>
            <text class="trend-label">today</text>
          </view>
        </view>
        
        <view class="stat-card yellow">
          <image class="stat-icon-image" :src="uiIcons.ok" mode="aspectFit" />
          <text class="stat-title">Mastered</text>
          <text class="stat-count">{{ stats.mastered }}</text>
          <view class="stat-trend">
            <text class="trend-badge">+{{ Math.floor(stats.todayLearned * 0.7) }}</text>
            <text class="trend-label">today</text>
          </view>
        </view>
        
        <view class="stat-card pink start-btn" @click="startLearning">
          <text class="start-text">Start</text>
          <text class="start-text">learning</text>
          <view class="play-icon">
            <text class="play-icon-text">></text>
          </view>
        </view>
      </view>
      
      <!-- 底部圆形功能按钮 -->
      <view class="bottom-actions">
        <view class="action-circle blue" @click="console.log('复习')">
          <image class="action-icon-image" :src="uiIcons.search" mode="aspectFit" />
          <text class="action-label">复习</text>
        </view>
        
        <view class="action-circle pink" @click="startPK">
          <image class="action-icon-image" :src="uiIcons.pk" mode="aspectFit" />
          <text class="action-label">PK</text>
        </view>
        
        <view class="action-circle yellow" @click="viewLeaderboard">
          <image class="action-icon-image" :src="uiIcons.rank" mode="aspectFit" />
          <text class="action-label">排行</text>
        </view>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-header">
          <text class="progress-title">今日进度</text>
          <text class="progress-text">{{ state.game.todayLearned || 0 }}/10 词</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 学习页面预览 -->
    <view v-if="currentTab === 'learn'" class="preview-content learn-preview">
      <view class="learn-header">
        <view class="back-btn">
          <text class="back-text">←</text>
        </view>
        <view class="progress-bar-mini">
          <view class="progress-fill-mini" :style="{ width: '30%' }"></view>
        </view>
        <view class="hint-btn">
          <image class="hint-icon-image" :src="uiIcons.search" mode="aspectFit" />
        </view>
      </view>
      
      <view class="word-card">
        <text class="word-text">obvious</text>
        <text class="word-phonetic">/ˈɒbviəs/</text>
        
        <view class="sound-btn">
          <image class="sound-icon-image" :src="uiIcons.sound" mode="aspectFit" />
        </view>
        
        <text class="tap-hint">点击显示释义</text>
      </view>
      
      <view class="options-preview">
        <view class="option-btn">
          <text class="option-label">A</text>
          <text class="option-text">明显的</text>
        </view>
        <view class="option-btn">
          <text class="option-label">B</text>
          <text class="option-text">神秘的</text>
        </view>
        <view class="option-btn">
          <text class="option-label">C</text>
          <text class="option-text">美丽的</text>
        </view>
        <view class="option-btn">
          <text class="option-label">D</text>
          <text class="option-text">危险的</text>
        </view>
      </view>
    </view>

    <!-- PK页面预览 -->
    <view v-if="currentTab === 'pk'" class="preview-content pk-preview">
      <view class="pk-header">
        <view class="pk-user">
          <view class="pk-avatar user-avatar">
            <text class="avatar-text">U</text>
          </view>
          <text class="pk-name">You</text>
          <text class="pk-score">5</text>
        </view>
        
        <view class="pk-vs">
          <text class="vs-text">VS</text>
        </view>
        
        <view class="pk-user">
          <text class="pk-score opponent">3</text>
          <text class="pk-name">AI</text>
          <view class="pk-avatar opponent-avatar">
            <image class="avatar-icon-image" :src="uiIcons.bot" mode="aspectFit" />
          </view>
        </view>
      </view>
      
      <view class="pk-bars">
        <view class="pk-bar user-bar">
          <view class="pk-bar-fill" style="width: 62%"></view>
        </view>
        <view class="pk-bar opponent-bar">
          <view class="pk-bar-fill" style="width: 38%"></view>
        </view>
      </view>
      
      <view class="pk-word-card">
        <text class="pk-word">enchanted</text>
        <text class="pk-phonetic">/ɪnˈtʃɑːntɪd/</text>
      </view>
      
      <view class="pk-options">
        <view class="pk-option">A</view>
        <view class="pk-option">B</view>
        <view class="pk-option">C</view>
        <view class="pk-option">D</view>
      </view>
    </view>

    <!-- 结果页面预览 -->
    <view v-if="currentTab === 'result'" class="preview-content result-preview">
      <view class="result-content">
        <image class="result-emoji-image" :src="uiIcons.ok" mode="aspectFit" />
        <text class="result-title">Well Done!</text>
        
        <view class="result-rewards">
          <text class="reward-xp">+50 XP</text>
          <view class="reward-coins-wrap">
            <image class="reward-coin-icon" :src="uiIcons.coin" mode="aspectFit" />
            <text class="reward-coins">+10 COIN</text>
          </view>
        </view>
        
        <view class="result-summary">
          <text class="summary-title">学习总结</text>
          <text class="summary-text">正确: 8/10</text>
          <text class="summary-text">用时: 2:30</text>
        </view>
        
        <view class="result-buttons">
          <view class="result-btn primary">
            <text class="btn-text">再学一次</text>
          </view>
          <view class="result-btn secondary">
            <text class="btn-text">返回首页</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-home" @click="goBack">
      <text class="back-home-text">← 返回</text>
    </view>
  </view>
</template>

<style scoped>
.preview-container {
  min-height: 100vh;
  background: #F7F7F9;
  padding-top: 120rpx;
  padding-bottom: 40rpx;
  padding-left: 32rpx;
  padding-right: 32rpx;
}

/* Tab Bar */
.tab-bar {
  position: fixed;
  top: 80rpx;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  background: white;
  border-radius: 24rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.tab-item {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.tab-item.active {
  background: #5A459D;
}

.tab-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
}

.tab-item.active .tab-label {
  color: white;
}

/* Header */
.header {
  height: 240rpx;
  background: linear-gradient(135deg, #5A459D 0%, #7B66C5 100%);
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-title {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.3;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.avatar-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #5A459D;
}

.username {
  font-size: 22rpx;
  font-weight: 600;
  opacity: 0.9;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  position: relative;
  padding: 32rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 200rpx;
}

.stat-card.mint {
  background: #A8F0C6;
}

.stat-card.blue {
  background: #A0D8F1;
}

.stat-card.yellow {
  background: #F9E975;
}

.stat-card.pink {
  background: #FFB5D0;
}

.stat-icon-image {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  opacity: 0.5;
}

.stat-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-count {
  display: block;
  font-size: 72rpx;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 16rpx;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.trend-badge {
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.trend-label {
  font-size: 20rpx;
  color: #666;
}

.start-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
}

.start-text {
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.2;
  color: #1a1a1a;
}

.play-icon {
  width: 60rpx;
  height: 60rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.play-icon-text {
  font-size: 24rpx;
  color: #FFB5D0;
  margin-left: 4rpx;
}

/* Bottom Actions */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 32rpx;
}

.action-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.action-circle.blue {
  background: #A0D8F1;
}

.action-circle.pink {
  background: #FFB5D0;
}

.action-circle.yellow {
  background: #F9E975;
}

.action-icon-image {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 4rpx;
}

.action-label {
  font-size: 20rpx;
  font-weight: 700;
  color: #333;
}

/* Progress */
.progress-section {
  background: white;
  border-radius: 32rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.progress-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #5A459D;
}

.progress-bar {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #A8F0C6 0%, #A0D8F1 100%);
  border-radius: 32rpx;
  transition: width 0.5s ease;
}

/* Learn Preview */
.learn-preview {
  display: flex;
  flex-direction: column;
}

.learn-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.back-btn, .hint-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-text {
  font-size: 28rpx;
  color: white;
}

.hint-icon-image {
  width: 28rpx;
  height: 28rpx;
}

.progress-bar-mini {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: #A8F0C6;
  border-radius: 24rpx;
}

.word-card {
  background: white;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  margin-bottom: 40rpx;
}

.word-text {
  font-size: 64rpx;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.word-phonetic {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 32rpx;
}

.sound-btn {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.sound-icon-image {
  width: 32rpx;
  height: 32rpx;
}

.tap-hint {
  font-size: 22rpx;
  color: #999;
}

.options-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.option-btn {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.option-label {
  width: 48rpx;
  height: 48rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #5A459D;
}

.option-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* PK Preview */
.pk-preview {
  display: flex;
  flex-direction: column;
}

.pk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.pk-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.pk-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  background: linear-gradient(135deg, #5A459D, #7B66C5);
}

.opponent-avatar {
  background: linear-gradient(135deg, #F472B6, #DB2777);
}

.avatar-icon-image {
  width: 36rpx;
  height: 36rpx;
}

.pk-name {
  font-size: 24rpx;
  font-weight: 700;
  color: white;
}

.pk-score {
  font-size: 48rpx;
  font-weight: 900;
  color: white;
}

.pk-score.opponent {
  order: -1;
}

.pk-vs {
  width: 80rpx;
  height: 80rpx;
  background: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  font-size: 28rpx;
  font-weight: 900;
  color: white;
  font-style: italic;
}

.pk-bars {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 32rpx;
}

.pk-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  overflow: hidden;
}

.pk-bar-fill {
  height: 100%;
  border-radius: 16rpx;
}

.user-bar .pk-bar-fill {
  background: #A8F0C6;
}

.opponent-bar .pk-bar-fill {
  background: #FFB5D0;
}

.pk-word-card {
  background: white;
  border-radius: 32rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  margin-bottom: 32rpx;
}

.pk-word {
  font-size: 56rpx;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.pk-phonetic {
  font-size: 24rpx;
  color: #999;
}

.pk-options {
  display: flex;
  justify-content: center;
  gap: 16rpx;
}

.pk-option {
  width: 64rpx;
  height: 64rpx;
  background: white;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #5A459D;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* Result Preview */
.result-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.result-content {
  text-align: center;
}

.result-emoji-image {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  display: block;
}

.result-title {
  font-size: 64rpx;
  font-weight: 900;
  color: #5A459D;
  display: block;
  margin-bottom: 32rpx;
}

.result-rewards {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
  align-items: center;
}

.reward-xp, .reward-coins-wrap {
  font-size: 32rpx;
  font-weight: 700;
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
}

.reward-xp {
  background: #F9E975;
  color: #1a1a1a;
}

.reward-coins-wrap {
  background: #A8F0C6;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.reward-coin-icon {
  width: 30rpx;
  height: 30rpx;
}

.reward-coins {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.result-summary {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.summary-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 16rpx;
}

.summary-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.result-buttons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-btn {
  padding: 24rpx 48rpx;
  border-radius: 24rpx;
}

.result-btn.primary {
  background: #5A459D;
}

.result-btn.secondary {
  background: white;
  border: 2rpx solid #e0e0e0;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 700;
}

.result-btn.primary .btn-text {
  color: white;
}

.result-btn.secondary .btn-text {
  color: #333;
}

/* Back Home */
.back-home {
  position: fixed;
  top: 20rpx;
  right: 20rpx;
  padding: 12rpx 24rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24rpx;
  z-index: 200;
}

.back-home-text {
  font-size: 24rpx;
  color: white;
  font-weight: 600;
}
</style>
