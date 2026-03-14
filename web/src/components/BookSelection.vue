<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';

const stats = computed(() => GameState.game.categoryStats || {});
const currentCategory = computed(() => GameState.user.targetCategory || 'GENERAL');

const categories = [
    { id: 'GENERAL', name: '综合词汇', icon: '🌍', count: '1000+', color: 'bg-indigo-500' },
    { id: 'TOEFL_JUNIOR', name: '小托福', icon: '🎒', count: '500+', color: 'bg-yellow-500' },
    { id: 'TOEFL', name: '托福 TOEFL', icon: '🗽', count: '800+', color: 'bg-orange-500' },
    { id: 'GRE', name: '研究生 GRE', icon: '🏛️', count: '1200+', color: 'bg-rose-500' },
    { id: 'BUSINESS', name: '商务英语', icon: '💼', count: '600+', color: 'bg-emerald-500' }
];

const selectCategory = async (catId) => {
    if (catId === currentCategory.value) return;
    
    try {
        const res = await API.updateCategory(GameState.user.id, catId);
        if (res) {
            GameState.user.targetCategory = catId;
            // Refresh stats to get accurate progress for the new category
            const newStats = await API.getStats(GameState.user.id);
            if (newStats) {
                Actions.setUser(newStats.user);
                GameState.game.categoryStats = newStats.categoryStats;
            }
            Actions.setView('dashboard');
        }
    } catch (e) {
        console.error('Failed to update category', e);
    }
};

const getProgress = (catId) => {
    const s = stats.value[catId];
    if (!s || s.total === 0) return 0;
    return Math.round((s.learned / s.total) * 100);
};
</script>

<template>
    <div class="flex-1 flex flex-col p-4 bg-background overflow-y-auto">
        <header class="flex items-center justify-between mb-8">
            <button @click="Actions.setView('dashboard')" class="p-2 bg-surface border border-slate-100 dark:border-white/5 rounded-xl shadow-sm text-text-muted hover:text-primary transition-colors">
                <span class="text-xl">🔙</span>
            </button>
            <h2 class="text-xl font-black text-text-main">选择你的学习目标</h2>
            <div class="w-10"></div>
        </header>

        <div class="grid grid-cols-1 gap-4">
            <div v-for="(cat, index) in categories" :key="cat.id" 
                @click="selectCategory(cat.id)"
                class="bg-surface p-5 cursor-pointer relative overflow-hidden group animate-slide-up rounded-3xl shadow-sm border border-transparent transition-all hover:scale-[1.02]"
                :class="currentCategory === cat.id ? 'border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10' : 'border-slate-100 dark:border-white/5'"
                :style="{ animationDelay: (index * 0.1) + 's' }">
                
                <div class="flex gap-4 relative z-10">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 group-hover:scale-110 transition-transform"
                        :class="cat.color + ' text-white'">
                        {{ cat.icon }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-1">
                             <h3 class="font-black text-lg text-text-main">{{ cat.name }}</h3>
                            <span v-if="currentCategory === cat.id" class="text-primary text-xs font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">正在学习</span>
                        </div>
                        <p class="text-sm text-text-muted font-bold mb-3 truncate leading-relaxed">{{ cat.desc }}</p>
                        
                        <!-- Progress Bar -->
                        <div class="space-y-1.5">
                            <div class="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                                <span>进度</span>
                                <span>{{ getProgress(cat.id) }}%</span>
                            </div>
                            <div class="h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner">
                                <div class="h-full transition-all duration-1000 ease-out"
                                    :class="cat.color"
                                    :style="{ width: getProgress(cat.id) + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Decoration -->
                <div class="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-500 pointer-events-none group-hover:scale-110">
                    {{ cat.icon }}
                </div>
            </div>
        </div>

        <div class="mt-8 p-6 bg-surface border border-primary/20 rounded-[2rem] text-center shadow-lg shadow-primary/5 animate-pop" style="animation-delay: 0.5s">
            <h4 class="font-black text-primary mb-2 flex items-center justify-center gap-2">
                <span class="animate-bounce-slow">💡</span> 小贴士
            </h4>
            <p class="text-sm text-text-muted leading-relaxed font-bold">
                切换目标后，你的全站进度数据会保持同步，但基础词库将优先展示所选类别的词汇。
            </p>
        </div>
    </div>
</template>

<style scoped>
.animate-slide-up {
    animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-pop {
    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes pop {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.animate-bounce-slow {
    animation: bounceSlow 3s infinite;
}

@keyframes bounceSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
</style>
