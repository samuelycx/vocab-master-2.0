<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Actions, GameState } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const words = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);
const search = ref('');
const serverTotal = ref(0);
const { t } = useI18n();
const uiIcons = UI_ICONS;
const totalCount = computed(() => {
    if (search.value && search.value.trim()) return words.value.length;
    const n = Number(serverTotal.value || GameState.user.totalLearned || 0);
    return Number.isFinite(n) && n >= 0 ? n : words.value.length;
});

const statusPriority = (status) => {
    if (status === 'LEARNING') return 1;
    if (status === 'MASTERED') return 2;
    return 3;
};

const displayWords = computed(() => {
    return [...words.value].sort((a, b) => {
        const ap = statusPriority(a?.status);
        const bp = statusPriority(b?.status);
        if (ap !== bp) return ap - bp;
        const ar = Number(a?.repetition || 0);
        const br = Number(b?.repetition || 0);
        return br - ar;
    });
});

// Load vocabulary with pagination
const loadMore = async () => {
    if (loading.value || !hasMore.value) return;
    loading.value = true;
    
    try {
        const uid = GameState.user.id || GameState.user._id || GameState.user.openid;
        const data = await API.getLearnedWords(uid, page.value, 20, search.value);
        const list = Array.isArray(data?.data) ? data.data : [];
        if (page.value === 1) {
            serverTotal.value = Number(data?.total) || list.length;
        }

        words.value = page.value === 1 ? list : [...words.value, ...list];

        const lastPage = Number(data?.lastPage) || 1;
        hasMore.value = page.value < lastPage;
        page.value += 1;
    } catch (e) {
        console.error('Load vocabulary failed', e);
    } finally {
        loading.value = false;
    }
};

// Reset and reload on search
watch(search, () => {
    page.value = 1;
    hasMore.value = true;
    words.value = [];
    serverTotal.value = 0;
    loadMore();
});

onMounted(() => {
    loadMore();
});

const handleBack = () => {
    Actions.setView('dashboard');
};

const getStatusLabel = (status, repetition) => {
    if (status === 'MASTERED') return t('vocab_status_mastered');
    if (status === 'LEARNING') return t('vocab_status_learning');
    if (repetition > 0) return t('vocab_status_reviewing');
    return t('vocab_status_new');
};

const getStatusColor = (status, repetition) => {
    if (status === 'MASTERED') return 'bg-mint text-dark';
    if (status === 'LEARNING') return 'bg-sky text-dark';
    if (repetition > 0) return 'bg-lemon text-dark';
    return 'bg-pink text-dark';
};

const parseMeaningList = (meanings) => {
    if (Array.isArray(meanings)) return meanings;
    if (typeof meanings === 'string') {
        try {
            const parsed = JSON.parse(meanings);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {
            return [meanings];
        }
        return [meanings];
    }
    return [];
};

const detectPosFromMeanings = (meanings) => {
    const list = parseMeaningList(meanings);
    const hit = list.find((item) => typeof item === 'string' && /^[a-z]+\./i.test(item.trim()));
    if (!hit) return '';
    return hit.trim().match(/^([a-z]+\.)/i)?.[1]?.toLowerCase() || '';
};

const normalizePartOfSpeech = (pos, meanings) => {
    const text = String(pos || '').trim().toLowerCase();
    if (text) return text;
    return detectPosFromMeanings(meanings) || 'n.';
};

const cleanMeaningText = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .replace(/^\s*[a-z]+\.\s*/i, '')
        .replace(/示意[:：]?\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const safeParseMeanings = (meanings) => {
    const list = parseMeaningList(meanings)
        .map(cleanMeaningText)
        .filter(Boolean);
    return list.join('；');
};

const getMasteryLevel = (status, repetition) => {
    if (status === 'MASTERED') return { color: '#A8F0C6', label: t('vocab_mastery_expert'), percent: 100 };
    const r = repetition || 0;
    if (r >= 5) return { color: '#A0D8F1', label: t('vocab_mastery_skilled'), percent: 85 };
    if (r >= 3) return { color: '#A0D8F1', label: t('vocab_mastery_skilled'), percent: 65 };
    if (r >= 1) return { color: '#F9E975', label: t('vocab_mastery_beginner'), percent: 35 };
    return { color: '#FFB5D0', label: t('vocab_mastery_new'), percent: 15 };
};
</script>

<template>
    <view class="vocab-page">
        <!-- Header -->
        <view class="header">
            <view class="back-btn" @click="handleBack">
                <text class="back-icon">←</text>
            </view>
            <view class="header-content">
                <text class="header-title">{{ t('vocab_title') }}</text>
                <text class="header-sub">{{ t('vocab_count', { count: totalCount }) }}</text>
            </view>
            <view class="header-icon">
                <image class="header-icon-image" :src="uiIcons.book" mode="aspectFit" />
            </view>
        </view>

        <!-- Search Bar -->
        <view class="search-section">
            <view class="search-box">
                <image class="search-icon-image" :src="uiIcons.search" mode="aspectFit" />
                <input 
                    v-model="search"
                    class="search-input"
                    :placeholder="t('vocab_search')"
                    type="text"
                />
            </view>
        </view>

        <!-- Stats Cards -->
        <view class="stats-section">
            <view class="stat-card mint">
                <text class="stat-value">{{ totalCount }}</text>
                <text class="stat-label">{{ t('vocab_total') }}</text>
            </view>
            
            <view class="stat-card sky">
                <text class="stat-value">{{ GameState.user.level || 1 }}</text>
                <text class="stat-label">{{ t('vocab_level') }}</text>
            </view>
        </view>

        <!-- Word List -->
        <scroll-view scroll-y class="word-list" @scrolltolower="loadMore">
            <!-- Empty State -->
            <view v-if="(!displayWords || displayWords.length === 0) && !loading" class="empty-state">
                <view class="empty-icon">
                    <image class="empty-icon-image" :src="uiIcons.book" mode="aspectFit" />
                </view>
                <text class="empty-title">{{ t('vocab_empty_title') }}</text>
                <text class="empty-sub">{{ t('vocab_empty_sub') }}</text>
            </view>

            <!-- Word Cards -->
            <view class="word-cards">
                <view 
                    v-for="(record, index) in displayWords"
                    :key="record.id"
                    class="word-card"
                    :class="'animate-slide-in-up delay-' + (index % 4 + 1) + '00'"
                    :style="{ animationDelay: (index * 0.05) + 's' }"
                >
                    <view class="word-header">
                        <view class="word-main">
                            <text class="word-text">{{ record.word.text || record.word.word }}</text>
                            <view class="word-tags">
                                <view class="word-tag" :class="getStatusColor(record.status, record.repetition)">
                                    {{ getStatusLabel(record.status, record.repetition) }}
                                </view>
                                <view class="word-pos">
                                    {{ normalizePartOfSpeech(record.word.partOfSpeech, record.word.meanings) }}
                                </view>
                            </view>
                        </view>
                        
                        <view class="sound-btn" @click="GameEngine.playAudio(record.word.text || record.word.word)">
                            <image class="sound-icon-image" :src="uiIcons.sound" mode="aspectFit" />
                        </view>
                    </view>
                    
                    <text class="word-meaning">
                        {{ safeParseMeanings(record.word.meanings) }}
                    </text>

                    <!-- Mastery Progress -->
                    <view class="mastery-section">
                        <view class="mastery-header">
                            <text class="mastery-label">{{ t('vocab_mastery') }}</text>
                            <text class="mastery-level" :style="{ color: getMasteryLevel(record.status, record.repetition).color }">
                                {{ getMasteryLevel(record.status, record.repetition).label }}
                            </text>
                        </view>
                        <view class="mastery-bar">
                            <view 
                                class="mastery-fill"
                                :style="{ 
                                    width: getMasteryLevel(record.status, record.repetition).percent + '%',
                                    background: getMasteryLevel(record.status, record.repetition).color
                                }"
                            ></view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- Loading -->
            <view v-if="loading" class="loading">
                <view class="loading-spinner"></view>
            </view>

            <!-- Load More -->
            <view v-if="!hasMore && displayWords.length > 0" class="no-more">
                <text>{{ t('vocab_no_more') }}</text>
            </view>
        </scroll-view>
    </view>
</template>

<style scoped>
.vocab-page {
  min-height: 100vh;
  background: #F6F1E8;
  padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 34.9rpx;
  display: flex;
  flex-direction: column;
  gap: 24.4rpx;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 20.9rpx;
  height: 118.6rpx;
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
  transform: scale(0.96);
}

.back-icon {
  font-size: 31.4rpx;
  font-weight: 600;
  color: #111111;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 48.8rpx;
  font-weight: 600;
  color: #111111;
  display: block;
}

.header-sub {
  font-size: 24.4rpx;
  color: #7B758B;
  font-weight: 600;
}

.header-icon {
  width: 76.7rpx;
  height: 76.7rpx;
  background: #A0D8F1;
  border-radius: 20.9rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon-image {
  width: 41.9rpx;
  height: 41.9rpx;
}

/* Search */
.search-section {
  margin-bottom: 24.4rpx;
}

.search-box {
  background: #ffffff;
  border-radius: 34.9rpx;
  height: 104.7rpx;
  padding: 0 27.9rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-icon-image {
  width: 28rpx;
  height: 28rpx;
}

.search-input {
  flex: 1;
  font-size: 31.4rpx;
  font-weight: 600;
  color: #111111;
  border: none;
  background: transparent;
}

.search-input::placeholder {
  color: #bbb;
}

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20.9rpx;
  margin-bottom: 24.4rpx;
}

.stat-card {
  border-radius: 34.9rpx;
  padding: 27.9rpx;
}

.stat-card.mint {
  background: #A8F0C6;
}

.stat-card.sky {
  background: #A0D8F1;
}

.stat-value {
  font-size: 55.8rpx;
  font-weight: 600;
  color: #111111;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24.4rpx;
  font-weight: 500;
  color: #2d2b28;
}

/* Word List */
.word-list {
  flex: 1;
  overflow-y: auto;
}

.word-cards {
  display: flex;
  flex-direction: column;
  gap: 20.9rpx;
  padding-bottom: 34.9rpx;
}

/* Word Card */
.word-card {
  background: #ffffff;
  border-radius: 38.4rpx;
  padding: 27.9rpx;
  border: 2rpx solid #efe8de;
  box-shadow: 0 8rpx 20rpx rgba(26, 26, 26, 0.03);
}

.word-card:nth-child(3n + 2) {
  background: #fffaf6;
}

.word-card:nth-child(3n) {
  background: #fffdfb;
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.word-main {
  flex: 1;
}

.word-text {
  font-size: 45.3rpx;
  font-weight: 600;
  color: #111111;
  display: block;
  margin-bottom: 12rpx;
  font-family: var(--font-serif, Georgia, serif);
}

.word-tags {
  display: flex;
  gap: 12rpx;
}

.word-tag {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.word-tag.bg-mint {
  background: #A8F0C6;
  color: #1a1a1a;
}

.word-tag.bg-sky {
  background: #A0D8F1;
  color: #1a1a1a;
}

.word-tag.bg-lemon {
  background: #F9E975;
  color: #1a1a1a;
}

.word-tag.bg-pink {
  background: #FFB5D0;
  color: #1a1a1a;
}

.word-pos {
  padding: 8rpx 16rpx;
  background: #f7f3ee;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #918b95;
}

.sound-btn {
  width: 64rpx;
  height: 64rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sound-icon-image {
  width: 30rpx;
  height: 30rpx;
}

.sound-btn:active {
  transform: scale(0.95);
  background: #e8e8e8;
}

.word-meaning {
  font-size: 28rpx;
  color: #6b6b6b;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

/* Mastery */
.mastery-section {
  padding-top: 20rpx;
  border-top: 2rpx solid #f5eee3;
}

.mastery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.mastery-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #948a7a;
}

.mastery-level {
  font-size: 24rpx;
  font-weight: 700;
}

.mastery-bar {
  height: 10rpx;
  background: #f2ede6;
  border-radius: 10rpx;
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}
.empty-icon-image {
  width: 56rpx;
  height: 56rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #999;
}

/* Loading */
.loading {
  padding: 40rpx;
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

/* No More */
.no-more {
  text-align: center;
  padding: 40rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
