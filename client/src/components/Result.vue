<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';

const lastSession = computed(() => GameState.game.lastSession || { xp: 0, coins: 0, correct: 0, total: 0 });

const goHome = () => {
    Actions.setView('dashboard');
};
</script>

<template>
    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background relative overflow-hidden transition-colors">
         <!-- Confetti Effect (CSS only implementation for simple demo) -->
         <div class="absolute inset-0 pointer-events-none">
            <div v-for="i in 20" :key="i" class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce" :style="{ left: Math.random()*100 + '%', top: Math.random()*50 + '%', animationDelay: Math.random() + 's' }"></div>
         </div>

        <div class="w-32 h-32 bg-surface border-4 border-primary/20 rounded-full flex items-center justify-center mb-8 animate-bounce-in shadow-xl shadow-primary/20">
            <span class="text-6xl drop-shadow-md">🏆</span>
        </div>

        <h2 class="text-3xl font-black text-text-main mb-2">挑战完成!</h2>
        <p class="text-text-muted mb-8 font-bold">收获颇丰的一天</p>

        <div class="grid grid-cols-2 gap-4 w-full mb-8">
            <div class="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5">
                <div class="text-primary font-black text-3xl">+{{ lastSession.xp }}</div>
                <div class="text-xs text-text-muted uppercase font-bold tracking-wider">XP 经验</div>
            </div>
            <div class="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5">
                <div class="text-yellow-500 font-black text-3xl">+{{ lastSession.coins }}</div>
                <div class="text-xs text-text-muted uppercase font-bold tracking-wider">金币</div>
            </div>
        </div>
        
        <div class="text-muted font-bold mb-8">
            正确率: <span class="text-color">{{ lastSession.correct }} / {{ lastSession.total }}</span>
        </div>

        <button 
            @click="goHome"
            class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 btn-press"
        >
            返回主页
        </button>
    </div>
</template>
