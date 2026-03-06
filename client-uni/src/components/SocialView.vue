<script setup>
import { ref, onMounted, computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';

const user = GameState.user;
const activeTab = ref('leaderboard');
const loading = ref(false);
const leaderboard = ref([]);
const feed = ref([]);
const { t } = useI18n();
const myId = computed(() => user.id || user._id || user.openid || '');

onMounted(async () => {
    await Promise.all([loadLeaderboard(), loadFeed()]);
});

const loadLeaderboard = async () => {
    loading.value = true;
    try {
        const data = await API.getLeaderboard();
        leaderboard.value = data || [];
    } catch (e) {
        console.error('Load leaderboard failed', e);
    } finally {
        loading.value = false;
    }
};

const loadFeed = async () => {
    try {
        const data = await API.getSocialFeed(user.id || user._id || user.openid);
        feed.value = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Load feed failed', e);
        feed.value = [];
    }
};

const goBack = () => {
    Actions.setView('dashboard');
};

const getRankStyle = (index) => {
    if (index === 0) return { bg: '#F9E975', icon: '🥇' };
    if (index === 1) return { bg: '#A0D8F1', icon: '🥈' };
    if (index === 2) return { bg: '#FFB5D0', icon: '🥉' };
    return { bg: '#f0f0f0', icon: (index + 1).toString() };
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = typeof timestamp?.toDate === 'function'
        ? timestamp.toDate()
        : new Date(timestamp);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
};
</script>

<template>
    <view class="social-page">
        <!-- Header -->
        <view class="header">
            <view class="back-btn" @click="goBack">
                <text class="back-icon">←</text>
            </view>
            <view class="header-content">
                <text class="header-title">{{ t('social_title') }}</text>
                <text class="header-sub">{{ t('social_subtitle') }}</text>
            </view>
            <view class="header-icon">
                <text>🏆</text>
            </view>
        </view>

        <!-- My Rank Card -->
        <view class="my-rank-card animate-slide-in-up">
            <view class="rank-avatar">
                <text>{{ user.nickname?.[0] || user.username?.[0] || 'U' }}</text>
            </view>
            
            <view class="rank-info">
                <text class="rank-name">{{ user.nickname || user.username || t('social_me') }}</text>
                <view class="rank-stats">
                    <text class="rank-level">Lv.{{ user.level || 1 }}</text>
                        <text class="rank-xp">{{ user.xp || 0 }} XP</text>
                </view>
            </view>
            
            <view class="rank-position">
                <text class="rank-number">{{ user.rank || '?' }}</text>
                <text class="rank-label">{{ t('social_rank_unit') }}</text>
            </view>
        </view>

        <!-- Tabs -->
        <view class="tabs">
            <view 
                class="tab"
                :class="{ active: activeTab === 'leaderboard' }"
                @click="activeTab = 'leaderboard'"
            >
                <text class="tab-text">{{ t('social_tab_rank') }}</text>
            </view>
            
            <view 
                class="tab"
                :class="{ active: activeTab === 'feed' }"
                @click="activeTab = 'feed'"
            >
                <text class="tab-text">{{ t('social_tab_feed') }}</text>
            </view>
        </view>

        <!-- Leaderboard -->
        <scroll-view v-if="activeTab === 'leaderboard'" scroll-y class="content">
            <view v-if="loading" class="loading">
                <view class="loading-spinner"></view>
            </view>

            <view v-else class="rank-list">
                <view 
                    v-for="(u, index) in leaderboard" 
                    :key="u.id"
                    class="rank-item"
                    :class="{ 'is-me': u.id === myId, 'animate-slide-in-up': true }"
                    :style="{ animationDelay: (index * 0.05) + 's' }"
                >
                    <view 
                        class="rank-badge"
                        :style="{ background: getRankStyle(index).bg }"
                    >
                        <text class="rank-icon">{{ getRankStyle(index).icon }}</text>
                    </view>
                    
                    <view class="rank-avatar-small">
                        <text>{{ u.username?.[0] || 'U' }}</text>
                    </view>
                    
                    <view class="rank-user-info">
                        <text class="rank-username">
                            {{ u.username }}
                            <text v-if="u.id === myId" class="me-tag">{{ t('social_me') }}</text>
                        </text>
                        <text class="rank-level">Lv.{{ u.level || 1 }}</text>
                    </view>
                    
                    <view class="rank-score">
                        <text class="score-value">{{ u.xp || 0 }}</text>
                        <text class="score-label">XP</text>
                    </view>
                </view>
            </view>

            <view v-if="!loading && leaderboard.length === 0" class="empty">
                <text class="empty-icon">📊</text>
                <text class="empty-text">{{ t('social_empty_rank') }}</text>
            </view>
        </scroll-view>

        <!-- Activity Feed -->
        <scroll-view v-if="activeTab === 'feed'" scroll-y class="content">
            <view v-if="feed.length === 0" class="empty">
                <text class="empty-icon">📭</text>
                <text class="empty-text">{{ t('social_empty_feed') }}</text>
            </view>

            <view v-else class="feed-list">
                <view 
                    v-for="(item, index) in feed" 
                    :key="item.id"
                    class="feed-item animate-slide-in-up"
                    :style="{ animationDelay: (index * 0.05) + 's' }"
                >
                    <view class="feed-avatar">
                        <text>{{ item.username?.[0] || 'U' }}</text>
                    </view>
                    
                    <view class="feed-content">
                        <view class="feed-header">
                            <text class="feed-name">{{ item.username }}</text>
                            <text class="feed-time">{{ formatTime(item.timestamp) }}</text>
                        </view>
                        
                        <text class="feed-text">{{ item.title }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<style scoped>
.social-page {
  min-height: 100vh;
  background: #F7F7F9;
  padding: calc(var(--header-height, 88px) + 16rpx) 28rpx 28rpx;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.back-btn:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 40rpx;
  font-weight: 900;
  color: #1a1a1a;
  display: block;
}

.header-sub {
  font-size: 24rpx;
  color: #999;
  font-weight: 600;
}

.header-icon {
  font-size: 40rpx;
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #F9E975 0%, #E5D450 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(249, 233, 117, 0.4);
}

/* My Rank Card */
.my-rank-card {
  background: linear-gradient(135deg, #5A459D 0%, #7B66C5 100%);
  border-radius: 32rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(90, 69, 157, 0.3);
}

.rank-avatar {
  width: 100rpx;
  height: 100rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: 800;
  color: #5A459D;
}

.rank-info {
  flex: 1;
}

.rank-name {
  font-size: 36rpx;
  font-weight: 800;
  color: white;
  display: block;
  margin-bottom: 8rpx;
}

.rank-stats {
  display: flex;
  gap: 20rpx;
}

.rank-level {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.rank-xp {
  font-size: 24rpx;
  color: #F9E975;
  font-weight: 700;
}

.rank-position {
  text-align: center;
}

.rank-number {
  font-size: 64rpx;
  font-weight: 900;
  color: white;
  display: block;
  line-height: 1;
}

.rank-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  padding: 20rpx;
  background: white;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.tab:active {
  transform: scale(0.98);
}

.tab.active {
  background: #5A459D;
}

.tab-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.tab.active .tab-text {
  color: white;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
}

/* Rank List */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 40rpx;
}

.rank-item {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.rank-item.is-me {
  background: linear-gradient(135deg, #A8F0C6 0%, #95F0C6 100%);
  box-shadow: 0 8rpx 24rpx rgba(168, 240, 198, 0.3);
}

.rank-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-icon {
  font-size: 36rpx;
  font-weight: 900;
}

.rank-avatar-small {
  width: 72rpx;
  height: 72rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #666;
}

.rank-user-info {
  flex: 1;
}

.rank-username {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 4rpx;
}

.me-tag {
  font-size: 20rpx;
  background: #5A459D;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.rank-level {
  font-size: 24rpx;
  color: #999;
}

.rank-score {
  text-align: right;
}

.score-value {
  font-size: 36rpx;
  font-weight: 900;
  color: #5A459D;
  display: block;
}

.score-label {
  font-size: 22rpx;
  color: #999;
}

/* Feed */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-bottom: 40rpx;
}

.feed-item {
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.feed-avatar {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #A0D8F1 0%, #7BC8E8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.feed-content {
  flex: 1;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.feed-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.feed-time {
  font-size: 22rpx;
  color: #999;
}

.feed-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* Loading */
.loading {
  padding: 80rpx;
  display: flex;
  justify-content: center;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #5A459D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty */
.empty {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
