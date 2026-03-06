<script setup>
import { computed } from 'vue';
import { GameState, Actions } from '../state.js';

const lastSession = computed(() => GameState.game.lastSession || { xp: 0, coins: 0, correct: 0, total: 0 });

const goHome = () => {
    Actions.setView('dashboard');
};
</script>

<template>
    <view class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background relative overflow-hidden transition-colors">
         <!-- Confetti Effect (CSS only implementation for simple demo) -->
         <view class="absolute inset-0 pointer-events-none">
            <view v-for="i in 20" :key="i" class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce" :style="{ left: Math.random()*100 + '%', top: Math.random()*50 + '%', animationDelay: Math.random() + 's' }"></view>
         </view>

        <view class="w-32 h-32 bg-surface border-4 border-primary-opacity-20 rounded-full flex items-center justify-center mb-8 animate-bounce-in shadow-primary-20">
            <text class="text-6xl drop-shadow-md block">🏆</text>
        </view>

        <text class="text-3xl font-black text-text-main mb-2 block">挑战完成!</text>
        <text class="text-text-muted mb-8 font-bold block">收获颇丰的一天</text>

        <view class="grid grid-cols-2 gap-4 w-full mb-8">
            <view class="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark_border-white-opacity-5">
                <text class="text-primary font-black text-3xl block">+{{ lastSession.xp }}</text>
                <text class="text-xs text-text-muted uppercase font-bold tracking-wider block">XP 经验</text>
            </view>
            <view class="bg-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark_border-white-opacity-5">
                <text class="text-yellow-500 font-black text-3xl block">+{{ lastSession.coins }}</text>
                <text class="text-xs text-text-muted uppercase font-bold tracking-wider block">金币</text>
            </view>
        </view>
        
        <view class="text-muted font-bold mb-8">
            <text>正确率: </text>
            <text class="text-color ml-1">{{ lastSession.correct }} / {{ lastSession.total }}</text>
        </view>

        <button 
            @click="goHome"
            class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 btn-press"
        >
            返回主页
        </button>
    </view>
</template>
