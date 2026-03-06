# 微信小程序专项优化方案 V3.0

## 📱 项目背景

### 目标用户
- **主要用户**: 小学五年级学生（10-11岁）
- **目标**: 备考小托福（TOEFL Junior）
- **社交场景**: 同学之间使用，形成良性竞争

### 核心需求
1. **学习目标**: 让背单词有趣而不枯燥
2. **社交需求**: 基于微信好友关系，简单直接的竞争（第一版简化实现）
3. **UI设计**: 需要全面升级，参考UI REF中的设计风格
4. **第一版原则**: 功能简单实用，快速上线

### 设计参考分析
从UI REF目录中提取的设计特点：
- **色彩系统**: 糖果色系（薄荷绿、天蓝、柠檬黄、糖果粉）
- **品牌色**: 紫色系（#5A459D, #7B66C5）
- **圆角设计**: 超大圆角（2rem-2.5rem），柔和几何感
- **字体**: 圆润字体（SF Pro Rounded, Nunito）
- **动画**: 卡片翻转、滑动切换、撒花特效
- **布局**: 卡片式设计，清晰的信息层级

---

## 🎯 优化目标

### 核心目标
1. **学习体验**: 让备考过程有趣、不枯燥
2. **社交竞争**: 基于微信好友，简单直接的竞争方式
3. **UI升级**: 采用现代、活泼的设计风格
4. **安全可靠**: 确保学生使用安全
5. **快速上线**: 第一版功能简化，快速验证

---

## 🎨 UI设计升级方案

### 1. 色彩系统重构

#### 新色彩方案
```css
/* client-uni/src/style.css */
:root {
  /* 品牌色 */
  --color-brand-purple: #5A459D;
  --color-brand-light: #7B66C5;
  --color-bg-app: #F7F7F9;
  
  /* 糖果色卡片 */
  --color-mint-green: #A8F0C6;
  --color-sky-blue: #A0D8F1;
  --color-lemon-yellow: #F9E975;
  --color-candy-pink: #FFB5D0;
  
  /* 超大圆角 */
  --radius-4xl: 2rem;  /* 32px - 大卡片 */
  --radius-5xl: 2.5rem; /* 40px - 底部弹窗 */
  
  /* 圆润字体 */
  --font-rounded: "SF Pro Rounded", "Nunito", "Quicksand", ui-rounded, sans-serif;
}

/* 全局应用 */
page {
  background-color: var(--color-bg-app);
  font-family: var(--font-rounded);
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
}
```

### 2. 首页（Dashboard）重新设计

#### 新设计特点
- 紫色品牌头部区域
- 2x2网格布局的统计卡片
- 糖果色卡片，每个功能不同颜色
- 大数字展示，清晰的信息层级

```vue
<!-- client-uni/src/components/Dashboard.vue -->
<template>
  <view class="dashboard">
    <!-- 品牌头部 -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">Learn new<br/>words easily</text>
        <view class="user-info">
          <image class="avatar" :src="user.avatar" />
          <text class="username">{{ user.username }}</text>
        </view>
      </view>
    </view>
    
    <!-- 统计卡片网格 -->
    <view class="stats-grid">
      <!-- 学习总数 -->
      <view class="stat-card mint">
        <view class="stat-icon">📚</view>
        <text class="stat-title">Total</text>
        <text class="stat-count">{{ stats.total }}</text>
        <view class="stat-trend">
          <text class="trend-badge">+{{ stats.todayLearned }}</text>
          <text class="trend-label">today</text>
        </view>
      </view>
      
      <!-- 学习中 -->
      <view class="stat-card blue">
        <view class="stat-icon">📖</view>
        <text class="stat-title">Learning</text>
        <text class="stat-count">{{ stats.learning }}</text>
        <view class="stat-trend">
          <text class="trend-badge">+{{ stats.todayProgress }}</text>
          <text class="trend-label">today</text>
        </view>
      </view>
      
      <!-- 已掌握 -->
      <view class="stat-card yellow">
        <view class="stat-icon">✅</view>
        <text class="stat-title">Mastered</text>
        <text class="stat-count">{{ stats.mastered }}</text>
        <view class="stat-trend">
          <text class="trend-badge">+{{ stats.todayMastered }}</text>
          <text class="trend-label">today</text>
        </view>
      </view>
      
      <!-- 开始学习按钮 -->
      <view class="stat-card pink start-btn" @click="startLearning">
        <text class="start-text">Start<br/>learning</text>
        <view class="play-icon">
          <text class="icon">▶</text>
        </view>
      </view>
    </view>
    
    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @click="goToPK">
        <view class="action-icon">⚔️</view>
        <text class="action-label">PK竞技</text>
      </view>
      
      <view class="action-item" @click="goToReview">
        <view class="action-icon">🔄</view>
        <text class="action-label">复习</text>
      </view>
      
      <view class="action-item" @click="goToMistakes">
        <view class="action-icon">❌</view>
        <text class="action-label">错题本</text>
      </view>
      
      <view class="action-item" @click="goToLeaderboard">
        <view class="action-icon">🏆</view>
        <text class="action-label">排行榜</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 0 32rpx 200rpx;
  background: var(--color-bg-app);
}

.header {
  height: 256rpx;
  background: linear-gradient(135deg, var(--color-brand-purple) 0%, var(--color-brand-light) 100%);
  border-radius: var(--radius-4xl);
  padding: 48rpx;
  margin-bottom: 32rpx;
  color: white;
}

.header-title {
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.3;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  position: relative;
  padding: 40rpx;
  border-radius: var(--radius-4xl);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stat-card.mint {
  background: var(--color-mint-green);
}

.stat-card.blue {
  background: var(--color-sky-blue);
}

.stat-card.yellow {
  background: var(--color-lemon-yellow);
}

.stat-card.pink {
  background: var(--color-candy-pink);
}

.stat-icon {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  font-size: 48rpx;
  opacity: 0.3;
}

.stat-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.stat-count {
  display: block;
  font-size: 96rpx;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 24rpx;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.trend-badge {
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 32rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.trend-label {
  font-size: 24rpx;
  color: #666;
}

.start-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:active {
  transform: scale(0.95);
}

.start-text {
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.2;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.play-icon {
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.play-icon .icon {
  font-size: 32rpx;
  color: var(--color-candy-pink);
  margin-left: 6rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background: white;
  border-radius: var(--radius-4xl);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.action-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}
</style>
```

### 3. 学习界面重新设计

#### 新设计特点
- 紫色背景，沉浸式学习
- 卡片翻转动画
- 滑动切换效果
- 进度条可视化

```vue
<!-- client-uni/src/components/GameArena.vue -->
<template>
  <view class="game-arena">
    <!-- 顶部导航 -->
    <view class="arena-header">
      <view class="back-btn" @click="quitSession">
        <text class="back-icon">←</text>
      </view>
      
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      
      <view class="combo-display" v-if="combo > 1">
        <text class="combo-text">{{ combo }} COMBO!</text>
      </view>
    </view>
    
    <!-- 单词卡片 -->
    <view class="card-container">
      <view 
        class="word-card"
        :class="{ flipped: isFlipped }"
        @click="flipCard"
      >
        <!-- 正面：单词 -->
        <view class="card-front">
          <text class="word-text">{{ currentWord.word }}</text>
          <text class="word-phonetic">{{ currentWord.phonetic }}</text>
          
          <view class="sound-btn" @click.stop="playAudio">
            <text class="sound-icon">🔊</text>
          </view>
          
          <text class="tap-hint">点击查看释义</text>
        </view>
        
        <!-- 背面：释义 -->
        <view class="card-back">
          <text class="meaning-text">{{ currentWord.meaning }}</text>
          <view class="divider"></view>
          <text class="example-text">{{ currentWord.example }}</text>
        </view>
      </view>
    </view>
    
    <!-- 选项按钮 -->
    <view class="options-container" v-if="!isFlipped">
      <view 
        v-for="(option, index) in options"
        :key="index"
        class="option-btn"
        :class="getOptionClass(option)"
        @click="selectOption(option)"
      >
        <text class="option-label">{{ String.fromCharCode(65 + index) }}</text>
        <text class="option-text">{{ option }}</text>
      </view>
    </view>
    
    <!-- 反馈动画 -->
    <view class="feedback-overlay" v-if="showFeedback">
      <view class="feedback-content" :class="{ correct: isCorrect, wrong: !isCorrect }">
        <view class="feedback-icon">{{ isCorrect ? '⭐' : '💪' }}</view>
        <text class="feedback-text">{{ feedbackText }}</text>
        <view class="rewards" v-if="isCorrect">
          <text class="reward">+{{ xpGained }} XP</text>
          <text class="reward">+{{ coinsGained }} 💰</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.game-arena {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-brand-purple) 0%, var(--color-brand-light) 100%);
  padding: 32rpx;
  display: flex;
  flex-direction: column;
}

.arena-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 32rpx;
  color: white;
}

.progress-bar {
  flex: 1;
  height: 20rpx;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 32rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-mint-green);
  border-radius: 32rpx;
  transition: width 0.7s ease-out;
  box-shadow: 0 0 20rpx rgba(168, 240, 198, 0.5);
}

.combo-display {
  padding: 12rpx 24rpx;
  background: rgba(255, 181, 208, 0.9);
  border-radius: 32rpx;
}

.combo-text {
  font-size: 24rpx;
  font-weight: 900;
  color: #1a1a1a;
}

.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.word-card {
  width: 100%;
  max-width: 600rpx;
  height: 680rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-out;
  cursor: pointer;
}

.word-card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: var(--radius-4xl);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.card-back {
  transform: rotateY(180deg);
}

.word-text {
  font-size: 80rpx;
  font-weight: 900;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.word-phonetic {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 48rpx;
}

.sound-btn {
  width: 96rpx;
  height: 96rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
}

.sound-icon {
  font-size: 40rpx;
}

.tap-hint {
  position: absolute;
  bottom: 48rpx;
  font-size: 24rpx;
  color: #999;
}

.meaning-text {
  font-size: 48rpx;
  font-weight: 700;
  color: var(--color-brand-purple);
  text-align: center;
  margin-bottom: 32rpx;
}

.divider {
  width: 128rpx;
  height: 4rpx;
  background: rgba(123, 102, 197, 0.3);
  border-radius: 2rpx;
  margin-bottom: 32rpx;
}

.example-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 48rpx;
}

.option-btn {
  background: white;
  border-radius: var(--radius-4xl);
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.option-btn:active {
  transform: scale(0.95);
}

.option-btn.correct {
  background: var(--color-mint-green);
  box-shadow: 0 8rpx 24rpx rgba(168, 240, 198, 0.5);
}

.option-btn.wrong {
  background: var(--color-candy-pink);
  box-shadow: 0 8rpx 24rpx rgba(255, 181, 208, 0.5);
}

.option-label {
  width: 56rpx;
  height: 56rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--color-brand-purple);
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.feedback-content {
  text-align: center;
  animation: bounceIn 0.5s ease;
}

.feedback-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.feedback-text {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  color: white;
  margin-bottom: 24rpx;
}

.rewards {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.reward {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--color-lemon-yellow);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
```

---

## 👥 社交功能优化（简化版）

### 设计原则
- **利用微信原生能力**: 不自建好友系统，直接使用微信好友关系
- **第一版简化**: 功能简单实用，快速上线验证
- **分享驱动**: 通过分享功能实现社交传播和竞争

### 1. 微信分享功能

#### 分享场景
```javascript
// client-uni/src/utils/share.js
export const ShareManager = {
  // 分享PK成绩
  sharePKScore(score) {
    return {
      title: `我在词汇大师PK中获得了${score}分，来挑战我吧！`,
      path: `/pages/index/index?from=${GameState.user.id}&type=pk_challenge`,
      imageUrl: '/static/share-pk.png'
    }
  },
  
  // 分享学习成果
  shareStudyResult(wordsLearned, streak) {
    return {
      title: `我今天学习了${wordsLearned}个单词，已连续${streak}天打卡！`,
      path: '/pages/index/index',
      imageUrl: '/static/share-study.png'
    }
  },
  
  // 分享成就解锁
  shareAchievement(achievement) {
    return {
      title: `我解锁了成就【${achievement.name}】！`,
      path: '/pages/index/index',
      imageUrl: achievement.image || '/static/share-achievement.png'
    }
  }
}
```

#### 分享触发点
```vue
<!-- client-uni/src/components/Result.vue -->
<template>
  <view class="result-page">
    <!-- 学习结果展示 -->
    <view class="result-content">
      <!-- ... -->
    </view>
    
    <!-- 分享按钮 -->
    <button 
      class="share-btn"
      open-type="share"
      @click="handleShare"
    >
      <text class="share-icon">📤</text>
      <text class="share-text">分享给好友</text>
    </button>
  </view>
</template>

<script>
export default {
  onShareAppMessage() {
    return ShareManager.shareStudyResult(
      this.sessionCorrect,
      GameState.user.streak
    )
  }
}
</script>
```

#### 好友列表界面
```vue
<!-- client-uni/src/components/FriendsView.vue -->
<template>
  <view class="friends-view">
    <view class="friends-header">
      <text class="header-title">我的同学</text>
      <view class="add-friend-btn" @click="showAddFriend">
        <text class="add-icon">+</text>
      </view>
    </view>
    
    <!-- 好友请求 -->
    <view class="friend-requests" v-if="requests.length > 0">
      <view class="section-title">好友请求</view>
      <view class="request-item" v-for="req in requests" :key="req.id">
        <image class="friend-avatar" :src="req.avatar" />
        <view class="friend-info">
          <text class="friend-name">{{ req.username }}</text>
          <text class="friend-level">Lv.{{ req.level }}</text>
        </view>
        <view class="request-actions">
          <view class="accept-btn" @click="acceptRequest(req.id)">✓</view>
          <view class="reject-btn" @click="rejectRequest(req.id)">✗</view>
        </view>
      </view>
    </view>
    
    <!-- 好友列表 -->
    <view class="friends-list">
      <view class="section-title">好友列表 ({{ friends.length }})</view>
      <view class="friend-item" v-for="friend in friends" :key="friend.id" @click="viewFriendProfile(friend)">
        <image class="friend-avatar" :src="friend.avatar" />
        <view class="friend-info">
          <text class="friend-name">{{ friend.username }}</text>
          <view class="friend-stats">
            <text class="stat">📚 {{ friend.totalWords }}</text>
            <text class="stat">🔥 {{ friend.streak }}天</text>
          </view>
        </view>
        <view class="friend-actions">
          <view class="pk-btn" @click.stop="challengeFriend(friend)">⚔️</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.friends-view {
  min-height: 100vh;
  background: var(--color-bg-app);
  padding: 32rpx;
}

.friends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: 900;
  color: #1a1a1a;
}

.add-friend-btn {
  width: 64rpx;
  height: 64rpx;
  background: var(--color-brand-purple);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 40rpx;
  color: white;
  font-weight: 300;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #666;
  margin-bottom: 16rpx;
  padding-left: 16rpx;
}

.friend-item,
.request-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: white;
  border-radius: var(--radius-4xl);
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.friend-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.friend-info {
  flex: 1;
}

.friend-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.friend-level {
  font-size: 24rpx;
  color: var(--color-brand-purple);
  font-weight: 600;
}

.friend-stats {
  display: flex;
  gap: 16rpx;
}

.friend-stats .stat {
  font-size: 24rpx;
  color: #666;
}

.friend-actions {
  display: flex;
  gap: 16rpx;
}

.pk-btn {
  width: 64rpx;
  height: 64rpx;
  background: var(--color-candy-pink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.request-actions {
  display: flex;
  gap: 16rpx;
}

.accept-btn,
.reject-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
}

.accept-btn {
  background: var(--color-mint-green);
  color: #1a1a1a;
}

.reject-btn {
  background: #f5f5f5;
  color: #999;
}
</style>
```

### 2. 简化的排行榜

#### 基于云开发的排行榜
```javascript
// client-uni/src/static/cloudfunctions/social/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-5gafz7hr13d79ef4' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { type, data } = event
  const wxContext = cloud.getWXContext()
  
  switch (type) {
    case 'getLeaderboard':
      return await getLeaderboard(wxContext.OPENID, data.rankType)
    default:
      return { success: false, msg: 'Unknown type' }
  }
}

// 获取排行榜（第一版：全局排行榜）
async function getLeaderboard(openid, rankType = 'xp') {
  const db = cloud.database()
  
  // 根据类型排序
  let orderBy = 'xp'
  if (rankType === 'words') orderBy = 'totalCorrect'
  if (rankType === 'streak') orderBy = 'streak'
  
  // 获取前100名
  const topUsers = await db.collection('users')
    .orderBy(orderBy, 'desc')
    .limit(100)
    .field({
      username: true,
      avatar: true,
      level: true,
      xp: true,
      totalCorrect: true,
      streak: true
    })
    .get()
  
  // 获取当前用户排名
  const currentUser = await db.collection('users').where({ openid }).get()
  let myRank = null
  
  if (currentUser.data.length > 0) {
    const myData = currentUser.data[0]
    const myValue = myData[orderBy]
    
    // 计算排名
    const rankCount = await db.collection('users')
      .where({
        [orderBy]: db.command.gt(myValue)
      })
      .count()
    
    myRank = {
      rank: rankCount.total + 1,
      username: myData.username,
      avatar: myData.avatar,
      value: myValue
    }
  }
  
  return {
    success: true,
    data: {
      topUsers: topUsers.data,
      myRank
    }
  }
}
```

#### 排行榜界面
```vue
<!-- client-uni/src/components/Leaderboard.vue -->
<template>
  <view class="leaderboard">
    <view class="leaderboard-header">
      <text class="header-title">排行榜</text>
      
      <!-- 排行榜类型切换 -->
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
    </view>
    
    <!-- 我的排名 -->
    <view class="my-rank card" v-if="myRank">
      <view class="rank-badge" :class="'rank-' + myRank.rank">
        <text class="rank-number">{{ myRank.rank }}</text>
      </view>
      <image class="my-avatar" :src="myRank.avatar" />
      <view class="my-info">
        <text class="my-name">{{ myRank.username }}</text>
        <text class="my-value">{{ myRank.value }} {{ currentUnit }}</text>
      </view>
    </view>
    
    <!-- 排行榜列表 -->
    <view class="rank-list">
      <view 
        v-for="(item, index) in rankList"
        :key="item.id"
        class="rank-item"
        :class="{ 'is-me': item.openid === myOpenid }"
      >
        <view class="rank-badge" :class="'rank-' + (index + 1)">
          <text class="rank-number">{{ index + 1 }}</text>
        </view>
        
        <image class="rank-avatar" :src="item.avatar" />
        
        <view class="rank-info">
          <text class="rank-name">{{ item.username }}</text>
          <view class="rank-stats">
            <text class="stat">Lv.{{ item.level }}</text>
            <text class="stat">🔥 {{ item.streak }}</text>
          </view>
        </view>
        
        <text class="rank-value">{{ getRankValue(item) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'xp',
      tabs: [
        { key: 'xp', label: '经验值' },
        { key: 'words', label: '词汇量' },
        { key: 'streak', label: '连续天数' }
      ],
      myRank: null,
      rankList: [],
      myOpenid: ''
    }
  },
  computed: {
    currentUnit() {
      const units = {
        xp: 'XP',
        words: '词',
        streak: '天'
      }
      return units[this.currentTab]
    }
  },
  async mounted() {
    await this.loadLeaderboard()
  },
  methods: {
    async switchTab(key) {
      this.currentTab = key
      await this.loadLeaderboard()
    },
    
    async loadLeaderboard() {
      const res = await wx.cloud.callFunction({
        name: 'social',
        data: {
          type: 'getLeaderboard',
          data: { rankType: this.currentTab }
        }
      })
      
      if (res.result.success) {
        this.myRank = res.result.data.myRank
        this.rankList = res.result.data.topUsers
      }
    },
    
    getRankValue(item) {
      if (this.currentTab === 'xp') return item.xp
      if (this.currentTab === 'words') return item.totalCorrect
      if (this.currentTab === 'streak') return item.streak
      return 0
    }
  }
}
</script>
```

### 3. 第一版社交功能总结

#### 简化要点
1. **不自建好友系统**: 利用微信原生分享能力
2. **简化排行榜**: 第一版只做全局排行榜，不做好友排行
3. **分享驱动**: 通过分享PK成绩、学习成果实现社交传播
4. **快速验证**: 先验证核心功能，后续迭代再增加复杂社交功能

#### 后续迭代方向
- 第二版：添加好友排行榜（基于分享链接点击记录）
- 第三版：添加好友PK邀请功能
- 第四版：添加班级群功能
```vue
<!-- client-uni/src/components/Leaderboard.vue -->
<template>
  <view class="leaderboard">
    <view class="leaderboard-header">
      <text class="header-title">排行榜</text>
      
      <!-- 排行榜类型切换 -->
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
    </view>
    
    <!-- 我的排名 -->
    <view class="my-rank card">
      <view class="rank-badge" :class="'rank-' + myRank.rank">
        <text class="rank-number">{{ myRank.rank }}</text>
      </view>
      <image class="my-avatar" :src="myRank.avatar" />
      <view class="my-info">
        <text class="my-name">{{ myRank.username }}</text>
        <text class="my-value">{{ myRank.value }} {{ currentUnit }}</text>
      </view>
    </view>
    
    <!-- 排行榜列表 -->
    <view class="rank-list">
      <view 
        v-for="(item, index) in rankList"
        :key="item.id"
        class="rank-item"
        :class="{ 'is-me': item.isMe }"
      >
        <view class="rank-badge" :class="'rank-' + (index + 1)">
          <text class="rank-number">{{ index + 1 }}</text>
        </view>
        
        <image class="rank-avatar" :src="item.avatar" />
        
        <view class="rank-info">
          <text class="rank-name">{{ item.username }}</text>
          <view class="rank-stats">
            <text class="stat">Lv.{{ item.level }}</text>
            <text class="stat">🔥 {{ item.streak }}</text>
          </view>
        </view>
        
        <text class="rank-value">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'xp',
      tabs: [
        { key: 'xp', label: '经验值' },
        { key: 'words', label: '词汇量' },
        { key: 'streak', label: '连续天数' },
        { key: 'pk', label: 'PK胜率' }
      ],
      myRank: {},
      rankList: []
    }
  },
  computed: {
    currentUnit() {
      const units = {
        xp: 'XP',
        words: '词',
        streak: '天',
        pk: '%'
      }
      return units[this.currentTab]
    }
  },
  async mounted() {
    await this.loadLeaderboard()
  },
  methods: {
    async switchTab(key) {
      this.currentTab = key
      await this.loadLeaderboard()
    },
    
    async loadLeaderboard() {
      const res = await wx.cloud.callFunction({
        name: 'social',
        data: {
          type: 'getLeaderboard',
          data: { type: this.currentTab }
        }
      })
      
      if (res.result.success) {
        this.myRank = res.result.data.myRank
        this.rankList = res.result.data.rankList
      }
    }
  }
}
</script>

<style scoped>
.leaderboard {
  min-height: 100vh;
  background: var(--color-bg-app);
  padding: 32rpx;
}

.leaderboard-header {
  margin-bottom: 32rpx;
}

.header-title {
  font-size: 48rpx;
  font-weight: 900;
  color: #1a1a1a;
  display: block;
  margin-bottom: 24rpx;
}

.tab-bar {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.tab-item {
  padding: 16rpx 32rpx;
  background: white;
  border-radius: 32rpx;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-item.active {
  background: var(--color-brand-purple);
}

.tab-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

.tab-item.active .tab-label {
  color: white;
}

.my-rank {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, var(--color-brand-purple) 0%, var(--color-brand-light) 100%);
  border-radius: var(--radius-4xl);
  margin-bottom: 32rpx;
  color: white;
}

.rank-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  font-weight: 900;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  color: white;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
  color: white;
}

.my-avatar,
.rank-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.my-info,
.rank-info {
  flex: 1;
}

.my-name,
.rank-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.my-value {
  font-size: 28rpx;
  opacity: 0.9;
}

.rank-stats {
  display: flex;
  gap: 16rpx;
}

.rank-stats .stat {
  font-size: 24rpx;
  color: #666;
}

.rank-value {
  font-size: 32rpx;
  font-weight: 900;
  color: var(--color-brand-purple);
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: white;
  border-radius: var(--radius-4xl);
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.rank-item.is-me {
  background: linear-gradient(135deg, var(--color-mint-green) 0%, #8FE0B8 100%);
}
</style>
```

---

## 🔒 安全优化

### 1. 设备绑定（保持V2方案）

### 2. 家长监管（保持V2方案）

### 3. 社交安全

#### 好友添加限制
```javascript
// client-uni/src/static/cloudfunctions/social/index.js
async function sendFriendRequest(from_openid, to_openid, message) {
  const db = cloud.database()
  
  // 1. 检查是否已经是好友
  const existingFriendship = await db.collection('friends')
    .where({
      _or: [
        { user1_openid: from_openid, user2_openid: to_openid },
        { user1_openid: to_openid, user2_openid: from_openid }
      ],
      status: 'accepted'
    })
    .get()
  
  if (existingFriendship.data.length > 0) {
    return { success: false, msg: '你们已经是好友了' }
  }
  
  // 2. 检查是否已有待处理的请求
  const existingRequest = await db.collection('friend_requests')
    .where({
      from_openid,
      to_openid,
      status: 'pending'
    })
    .get()
  
  if (existingRequest.data.length > 0) {
    return { success: false, msg: '已经发送过好友请求了' }
  }
  
  // 3. 检查每日添加好友数量限制（防止骚扰）
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayRequests = await db.collection('friend_requests')
    .where({
      from_openid,
      created_at: db.command.gte(today)
    })
    .count()
  
  if (todayRequests.total >= 10) {
    return { success: false, msg: '今日添加好友次数已达上限' }
  }
  
  // 4. 创建好友请求
  await db.collection('friend_requests').add({
    data: {
      from_openid,
      to_openid,
      message,
      status: 'pending',
      created_at: db.serverDate()
    }
  })
  
  return { success: true }
}
```

---

## 📝 实施计划

### 阶段一：UI设计升级（2周）
- [ ] 实施新色彩系统
- [ ] 重新设计Dashboard
- [ ] 重新设计学习界面
- [ ] 重新设计PK界面
- [ ] 重新设计排行榜
- [ ] 添加动画效果

### 阶段二：社交功能（简化版，1周）
- [ ] 实现微信分享功能
- [ ] 实现全局排行榜
- [ ] 添加分享触发点
- [ ] 优化排行榜UI

### 阶段三：安全优化（1周）
- [ ] 设备绑定机制
- [ ] 家长监管功能
- [ ] 社交安全限制
- [ ] WebSocket改造

### 阶段四：性能优化（1周）
- [ ] 分包加载
- [ ] 数据缓存
- [ ] 动画性能优化
- [ ] 错误监控

---

## 🎯 预期效果

### UI体验
- ✅ 现代、活泼的设计风格
- ✅ 糖果色系，视觉愉悦
- ✅ 流畅的动画效果
- ✅ 清晰的信息层级

### 社交竞争
- ✅ 通过微信分享传播
- ✅ 全局排行榜竞争
- ✅ 分享学习成果激励
- ✅ 简单直接的竞争方式

### 学习效果
- ✅ 有趣的学习体验
- ✅ 社交激励，持续学习
- ✅ 科学复习，提高效率
- ✅ 家长参与，形成闭环

---

**文档版本**: v3.0  
**创建日期**: 2026-03-03  
**核心更新**: UI设计升级 + 社交功能增强  
**设计参考**: UI REF目录
