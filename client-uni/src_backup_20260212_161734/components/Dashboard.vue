<script setup>
import { ref, onMounted, computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import AchievementWall from './AchievementWall.vue';
import VocabularyList from './VocabularyList.vue';
import Settings from './Settings.vue';
import ProfileSetup from './ProfileSetup.vue';

const user = GameState.user;
const state = GameState;
const showAchievements = ref(false);
const showVocabList = ref(false);
const showSettings = ref(false);
const reviewCount = ref(0);
const loading = ref(true);
const settings = GameState.settings;

const startGame = () => {
    GameEngine.startSession(10);
};

const startReview = async () => {
    if (reviewCount.value > 0) {
        await GameEngine.startReview(user.id);
    } else {
        uni.showModal({
            title: '复习提示',
            content: '目前没有待复习单词。系统会根据记忆曲线为您安排复习时间，请继续学习新词！',
            showCancel: false
        });
    }
};

const startMistake = async () => {
    const success = await GameEngine.startMistake(GameState.user.id);
    if (!success) {
        uni.showToast({ title: '没有错题啦！', icon: 'success' });
    }
};

const startPK = () => {
    Actions.setView('pk');
};

onMounted(async () => {
    if (user.id) {
        try {
            const stats = await API.getStats(user.id);
            if (stats && stats.user) {
                Actions.setUser(stats.user);
            }
            
            const reviews = await API.getReviews(user.id);
            reviewCount.value = reviews ? reviews.length : 0;
        } catch (e) {
            console.error('Failed to load dashboard data', e);
        }
    }
    
    try {
        const achs = await API.getAchievements();
        if (achs) {
             if (!state.system) state.system = {};
             state.system.achievements = achs;
        }
    } catch (e) {}
    
    loading.value = false;
});
</script>

<template>
    <view class="flex-1 flex flex-col w-full h-full relative">
        <!-- Settings View -->
        <!-- Custom transition if needed, or just v-if -->
        <Settings 
            v-if="showSettings" 
            :onBack="() => showSettings = false" 
            class="absolute inset-0 z-30"
        />

        <!-- Vocabulary List View -->
        <VocabularyList 
            v-if="showVocabList" 
            :onBack="() => showVocabList = false" 
            class="absolute inset-0 z-20 bg-slate-50"
        />

        <!-- Main Dashboard Content -->
        <view v-show="!showVocabList && !showSettings" class="flex-1 flex flex-col p-4 w-full max-w-full md_max-w-5xl mx-auto overflow-y-auto pb-24 md_pb-6 bg-background transition-colors">
            
            <!-- Loading Skeleton -->
            <view v-if="loading" class="animate-pulse flex flex-col gap-8">
                <view class="flex justify-between items-center px-4">
                    <view class="flex items-center gap-4">
                        <view class="w-14 h-14 bg-slate-200 dark_bg-slate-700 rounded-2xl"></view>
                        <view class="flex flex-col gap-2">
                            <view class="h-3 w-20 bg-slate-200 dark_bg-slate-700 rounded"></view>
                            <view class="h-5 w-32 bg-slate-200 dark_bg-slate-700 rounded"></view>
                        </view>
                    </view>
                </view>
                <view class="grid grid-cols-2 md_grid-cols-4 gap-4">
                    <view class="h-48 bg-slate-200 dark_bg-slate-700 rounded-2-5rem col-span-2 md_col-span-4"></view>
                    <view class="h-40 bg-slate-200 dark_bg-slate-700 rounded-2-5rem col-span-2"></view>
                    <view class="h-40 bg-slate-200 dark_bg-slate-700 rounded-2-5rem"></view>
                    <view class="h-40 bg-slate-200 dark_bg-slate-700 rounded-2-5rem"></view>
                </view>
            </view>

            <view v-else class="flex flex-col gap-6 w-full mx-auto md_max-w-4xl" :style="{ paddingTop: 'var(--status-bar-height, 0px)' }">
                
                <!-- 1. Hero Card -->
                <view @click="startGame" class="bg-surface rounded-4xl p-6 shadow-sm border border-slate-100 dark_border-white-opacity-5 relative overflow-hidden group transition-all">
                    <!-- Background Glow -->
                    <view class="absolute top-0 right-0 w-32 h-32 bg-primary-opacity-10 rounded-full blur-3xl -mr-16 -mt-16 transition-all"></view>
                    
                    <view class="relative z-10">
                        <view class="flex justify-between items-start mb-4">
                            <view>
                                <text class="bg-secondary text-text-main text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">今日学习</text>
                                <text class="text-2xl font-black mt-2 leading-tight text-text-main block">词汇大师</text>
                            </view>
                            <!-- Circular Progress / Level -->
                            <view class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-text-main font-black text-lg shadow-lg shadow-primary-opacity-30 animate-pop">
                                {{ Math.round((state.game.todayLearned / 10) * 100) }}%
                            </view>
                        </view>

                        <!-- Progress Bar -->
                        <view class="mb-2 flex justify-between text-sm font-bold text-text-muted">
                            <text>今日进度</text>
                            <text>{{ state.game.todayLearned }} / 10</text>
                        </view>
                        <view class="h-3 bg-slate-100 dark_bg-slate-opacity-50 rounded-full overflow-hidden">
                            <view class="h-full bg-primary rounded-full transition-all duration-1000" :style="{ width: (state.game.todayLearned / 10 * 100) + '%' }"></view>
                        </view>
                    </view>
                </view>

                <!-- 2. Stats Row -->
                <view class="grid grid-cols-3 gap-3">
                    <view class="bg-surface p-3 rounded-1-5rem text-center shadow-sm border border-slate-100 dark_border-white-opacity-5 flex flex-col items-center justify-center gap-1 aspect-square">
                        <text class="text-primary text-2xl">🔥</text>
                        <text class="font-black text-lg text-text-main">{{ user.streak }}</text>
                        <text class="text-xxs text-text-muted font-bold uppercase">连胜</text>
                    </view>
                    <view @click="showVocabList = true" class="cursor-pointer bg-surface p-3 rounded-1-5rem text-center shadow-sm border border-slate-100 dark_border-white-opacity-5 flex flex-col items-center justify-center gap-1 aspect-square transition-colors">
                        <text class="text-blue-500 text-2xl">📚</text>
                        <text class="font-black text-lg text-text-main">{{ user.totalLearned || 0 }}</text>
                        <text class="text-xxs text-text-muted font-bold uppercase">已学</text>
                    </view>
                    <view class="bg-surface p-3 rounded-1-5rem text-center shadow-sm border border-slate-100 dark_border-white-opacity-5 flex flex-col items-center justify-center gap-1 aspect-square">
                        <text class="text-yellow-500 text-2xl">💎</text>
                        <text class="font-black text-lg text-text-main">{{ user.coins }}</text>
                        <text class="text-xxs text-text-muted font-bold uppercase">宝石</text>
                    </view>
                </view>

                <!-- 3. Main Actions -->
                <view class="flex flex-col gap-4">
                    <!-- Giant Start Button -->
                    <button @click="startGame" class="w-full bg-slate-900 text-primary h-20 rounded-4xl flex items-center justify-between px-8 shadow-lg active_scale-98 transition-all relative overflow-hidden group">
                        <view class="absolute inset-0 bg-white-opacity-5 opacity-0 transition-opacity"></view>
                        <view class="flex flex-col items-start gap-1">
                            <text class="text-xs font-bold uppercase tracking-widest text-primary-opacity-60">开始学习</text>
                            <text class="text-2xl font-black text-white">继续旅程</text>
                        </view>
                        <text class="text-4xl bg-primary text-slate-900 rounded-full p-2 transition-transform">▶️</text>
                    </button>

                    <!-- Secondary Grid -->
                    <view class="grid grid-cols-2 gap-4">
                        <button @click="startReview" class="bg-surface h-32 rounded-4xl p-5 flex flex-col justify-between items-start shadow-sm border border-transparent transition-all group relative overflow-hidden">
                            <text class="text-3xl text-gray-300 transition-colors">📝</text>
                            <view class="relative z-10 flex flex-col items-start">
                                <text class="font-black text-lg leading-none text-text-main text-left block">智能复习</text>
                                <text v-if="reviewCount > 0" class="mt-1 px-2 py-0-5 bg-red-100 text-red-600 rounded text-xxs font-bold">{{ reviewCount }} 待复习</text>
                            </view>
                        </button>
                        
                        <button @click="startPK" class="bg-surface h-32 rounded-4xl p-5 flex flex-col justify-between items-start shadow-sm border border-transparent transition-all group">
                            <text class="text-3xl text-gray-300 transition-colors">⚔️</text>
                            <text class="font-black text-lg leading-none text-text-main text-left block">PK竞技场</text>
                        </button>
                        
                        <button @click="startMistake" class="bg-surface h-32 rounded-4xl p-5 flex flex-col justify-between items-start shadow-sm border border-transparent transition-all group">
                            <text class="text-3xl text-gray-300 transition-colors">📝</text>
                            <view class="relative z-10 flex flex-col items-start">
                                <text class="font-black text-lg leading-none text-text-main text-left block">错题复习</text>
                            </view>
                        </button>

                         <button @click="showAchievements = true" class="bg-surface h-32 rounded-4xl p-5 flex flex-col justify-between items-start shadow-sm border border-transparent transition-all group">
                            <text class="text-3xl text-gray-300 transition-colors">🏆</text>
                            <text class="font-black text-lg leading-none text-text-main text-left block">荣誉墙</text>
                        </button>
                        
                         <button @click="showSettings = true" class="bg-surface h-32 rounded-4xl p-5 flex flex-col justify-between items-start shadow-sm border border-transparent transition-all group">
                            <text class="text-3xl text-gray-300 transition-colors">⚙️</text>
                            <text class="font-black text-lg leading-none text-text-main text-left block">设置</text>
                        </button>
                    </view>
                </view>

            </view> <!-- End of v-else (Main Content) -->
            
            <AchievementWall 
                v-if="showAchievements" 
                :achievements="state.system.achievements"
                :userUnlocked="user.achievements ? user.achievements.map(ua => ua.achievementId) : []"
                :onClose="() => showAchievements = false"
            />

            <!-- Force Profile Setup if not set -->
            <ProfileSetup v-if="!user.isProfileSet" />
        </view>
    </view>
</template>
