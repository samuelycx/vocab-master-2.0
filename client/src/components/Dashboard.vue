<script setup>
import { ref, onMounted, computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { API } from '../api.js';
import AchievementWall from './AchievementWall.vue';
import VocabularyList from './VocabularyList.vue';
import Settings from './Settings.vue';

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
        alert('目前没有待复习单词。系统会根据记忆曲线为您安排复习时间，请继续学习新词！');
    }
};

const startIncorrect = async () => {
    const success = await GameEngine.startMistake(GameState.user.id);
    if (!success) alert('Awesome! No mistakes to review.');
};

const startPK = () => {
    Actions.setView('pk');
};

onMounted(async () => {
    if (user.id) {
        // Refresh stats
        const stats = await API.getStats(user.id);
        if (stats && stats.user) {
            Actions.setUser(stats.user);
        }
        
        // Check reviews
        const reviews = await API.getReviews(user.id);
        reviewCount.value = reviews ? reviews.length : 0;
    }
    
    // Fetch system achievements
    const achs = await API.getAchievements();
    if (achs) {
         if (!state.system) state.system = {};
         state.system.achievements = achs;
    }
    
    loading.value = false;
});
</script>

<template>
    <div class="flex-1 flex flex-col w-full h-full relative">
        <!-- Settings View -->
        <transition enter-active-class="animate-slide-up">
            <Settings 
                v-if="showSettings" 
                :onBack="() => showSettings = false" 
                class="absolute inset-0 z-30"
            />
        </transition>

        <!-- Vocabulary List View -->
        <transition enter-active-class="animate-slide-up">
            <VocabularyList 
                v-if="showVocabList" 
                :onBack="() => showVocabList = false" 
                class="absolute inset-0 z-20 bg-slate-50"
            />
        </transition>

        <!-- Main Dashboard Content -->
        <div v-show="!showVocabList && !showSettings" class="flex-1 flex flex-col p-4 md:p-6 w-full max-w-5xl mx-auto overflow-y-auto pb-24 md:pb-6 bg-background transition-colors">
            
            <!-- Loading Skeleton -->
            <div v-if="loading" class="animate-pulse space-y-8">
                <div class="flex justify-between items-center px-4">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                        <div class="space-y-2">
                            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div class="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="h-48 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] col-span-2 md:col-span-4"></div>
                    <div class="h-40 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem] col-span-2"></div>
                    <div class="h-40 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem]"></div>
                    <div class="h-40 bg-slate-200 dark:bg-slate-700 rounded-[2.5rem]"></div>
                </div>
            </div>

            <div v-else class="space-y-6 max-w-lg mx-auto md:max-w-4xl">
                
                <!-- 1. Hero Card -->
                <div @click="startGame" class="bg-surface rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group cursor-pointer transition-all hover:translate-y-[-4px] hover:shadow-md">
                    <!-- Background Glow -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/20"></div>
                    
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="bg-secondary text-text-main text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">当前目标</span>
                                <h2 class="text-2xl font-black mt-2 leading-tight text-text-main">{{ user.targetCategory || '综合词汇' }}</h2>
                            </div>
                            <!-- Circular Progress / Level -->
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-text-main font-black text-lg shadow-lg shadow-primary/30 animate-pop">
                                {{ Math.round((state.game.todayLearned / 10) * 100) }}%
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="mb-2 flex justify-between text-sm font-bold text-text-muted">
                            <span>今日进度</span>
                            <span>{{ state.game.todayLearned }} / 10</span>
                        </div>
                        <div class="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                            <div class="h-full bg-primary rounded-full transition-all duration-1000" :style="{ width: (state.game.todayLearned / 10 * 100) + '%' }"></div>
                        </div>
                    </div>
                </div>

                <!-- 2. Stats Row -->
                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-surface p-3 rounded-[1.5rem] text-center shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1 aspect-square">
                        <span class="material-symbols-outlined text-primary text-2xl">local_fire_department</span>
                        <span class="font-black text-lg text-text-main">{{ user.streak }}</span>
                        <span class="text-[10px] text-text-muted font-bold uppercase">连胜</span>
                    </div>
                    <div @click="showVocabList = true" class="cursor-pointer bg-surface p-3 rounded-[1.5rem] text-center shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1 aspect-square hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span class="material-symbols-outlined text-blue-500 text-2xl">menu_book</span>
                        <span class="font-black text-lg text-text-main">{{ user.wordsLearned || 0 }}</span>
                        <span class="text-[10px] text-text-muted font-bold uppercase">已学</span>
                    </div>
                    <div class="bg-surface p-3 rounded-[1.5rem] text-center shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1 aspect-square">
                        <span class="material-symbols-outlined text-yellow-500 text-2xl">diamond</span>
                        <span class="font-black text-lg text-text-main">{{ user.coins }}</span>
                        <span class="text-[10px] text-text-muted font-bold uppercase">宝石</span>
                    </div>
                </div>

                <!-- 3. Main Actions -->
                <div class="space-y-4">
                    <!-- Giant Start Button -->
                    <button @click="startGame" class="w-full bg-slate-900 text-primary h-20 rounded-[2rem] flex items-center justify-between px-8 shadow-xl shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group">
                        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="flex flex-col items-start gap-1">
                            <span class="text-xs font-bold uppercase tracking-widest text-primary/60">开始学习</span>
                            <span class="text-2xl font-black text-white">继续旅程</span>
                        </div>
                        <span class="material-symbols-outlined text-4xl bg-primary text-slate-900 rounded-full p-2 group-hover:rotate-90 transition-transform">play_arrow</span>
                    </button>

                    <!-- Secondary Grid -->
                    <div class="grid grid-cols-2 gap-4">
                        <button @click="startReview" class="bg-surface h-32 rounded-[2rem] p-5 flex flex-col justify-between items-start shadow-sm border border-transparent hover:border-primary transition-all group relative overflow-hidden">
                            <span class="material-symbols-outlined text-3xl text-gray-300 group-hover:text-primary transition-colors">history_edu</span>
                            <div class="relative z-10 flex flex-col items-start">
                                <span class="font-black text-lg leading-none text-text-main text-left">智能<br>复习</span>
                                <span v-if="reviewCount > 0" class="mt-1 px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">{{ reviewCount }} 待复习</span>
                            </div>
                        </button>
                        
                        <button @click="startPK" class="bg-surface h-32 rounded-[2rem] p-5 flex flex-col justify-between items-start shadow-sm border border-transparent hover:border-blue-400 transition-all group">
                            <span class="material-symbols-outlined text-3xl text-gray-300 group-hover:text-blue-400 transition-colors">swords</span>
                            <span class="font-black text-lg leading-none text-text-main text-left">PK<br>竞技场</span>
                        </button>

                         <button @click="showAchievements = true" class="bg-surface h-32 rounded-[2rem] p-5 flex flex-col justify-between items-start shadow-sm border border-transparent hover:border-yellow-400 transition-all group">
                            <span class="material-symbols-outlined text-3xl text-gray-300 group-hover:text-yellow-400 transition-colors">emoji_events</span>
                            <span class="font-black text-lg leading-none text-text-main text-left">荣誉<br>墙</span>
                        </button>
                        
                         <button @click="showSettings = true" class="bg-surface h-32 rounded-[2rem] p-5 flex flex-col justify-between items-start shadow-sm border border-transparent hover:border-gray-400 transition-all group">
                            <span class="material-symbols-outlined text-3xl text-gray-300 group-hover:text-gray-400 transition-colors">tune</span>
                            <span class="font-black text-lg leading-none text-text-main text-left">设置</span>
                        </button>
                    </div>
                </div>

            </div> <!-- End of v-else (Main Content) -->
            
            <!-- Achievement Wall Modal -->
            <AchievementWall 
                v-if="showAchievements" 
                :achievements="state.system.achievements"
                :userUnlocked="user.achievements ? user.achievements.map(ua => ua.achievementId) : []"
                :onClose="() => showAchievements = false"
            />
        </div>
    </div>
</template>
