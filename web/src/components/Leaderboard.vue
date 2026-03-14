<script setup>
import { ref, onMounted } from 'vue';
import { API } from '../api.js';

const props = defineProps({
    onClose: Function
});

const leaderboard = ref([]);
const loading = ref(true);

const loadLeaderboard = async () => {
    loading.value = true;
    try {
        const data = await API.getLeaderboard(20);
        leaderboard.value = data;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadLeaderboard();
});
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up relative">
            
            <!-- Header -->
            <div class="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white relative overflow-hidden">
                <div class="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-black uppercase tracking-wider">排行榜</h2>
                        <p class="text-yellow-100 font-bold text-sm">谁是词汇大师？</p>
                    </div>
                    <div class="text-4xl">🏆</div>
                </div>
                <!-- Background decor -->
                <div class="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                     <i class="fas fa-trophy text-8xl"></i>
                </div>
                
                <button @click="onClose" class="absolute top-4 right-4 bg-black/20 hover:bg-black/30 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div v-if="loading" class="flex flex-col items-center justify-center h-40 gap-4 text-slate-400">
                    <div class="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <div>加载中...</div>
                </div>

                <div v-else-if="leaderboard.length === 0" class="text-center text-slate-400 py-10">
                    暂无数据
                </div>

                <div 
                    v-else
                    v-for="(user, index) in leaderboard" 
                    :key="user.id"
                    class="flex items-center gap-4 p-3 rounded-2xl transition-transform hover:scale-[1.02] border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50"
                    :class="{
                        'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-slate-800 bg-yellow-50 dark:bg-yellow-900/20': index === 0,
                        'ring-2 ring-slate-300 ring-offset-2 dark:ring-offset-slate-800': index === 1,
                        'ring-2 ring-orange-300 ring-offset-2 dark:ring-offset-slate-800': index === 2
                    }"
                >
                    <!-- Rank -->
                    <div class="w-8 flex-shrink-0 text-center font-black text-xl" 
                        :class="{
                            'text-yellow-500 text-2xl': index === 0,
                            'text-slate-400 text-xl': index === 1,
                            'text-orange-400 text-xl': index === 2,
                            'text-slate-300 dark:text-slate-500': index > 2
                        }"
                    >
                        {{ index + 1 }}
                    </div>

                    <!-- Avatar -->
                    <div class="w-12 h-12 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-500 relative">
                        {{ user.avatar }}
                        <div v-if="index < 3" class="absolute -top-1 -right-1 text-sm bg-white dark:bg-slate-800 rounded-full shadow-sm w-5 h-5 flex items-center justify-center">
                            {{ index === 0 ? '👑' : (index === 1 ? '🥈' : '🥉') }}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-slate-800 dark:text-white truncate">{{ user.username }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">Level {{ user.level }}</div>
                    </div>

                    <!-- Score -->
                    <div class="text-right">
                        <div class="font-black text-indigo-500 dark:text-indigo-400">{{ user.xp }} XP</div>
                        <div class="text-xs text-slate-400 dark:text-slate-500 font-bold" v-if="user.totalCorrect">词汇量 {{ user.totalCorrect }}</div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
                每 24 小时更新
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(203, 213, 225, 0.5); /* sleep-300 */
  border-radius: 20px;
}
</style>
