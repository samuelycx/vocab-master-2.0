<script setup>
import { computed, watch } from 'vue';
import { GameState } from '../state.js';
import { GameEngine } from '../engine.js';

const session = GameEngine.session;
const combo = computed(() => GameState.game.combo);

// Auto-play audio when word changes
watch(() => session.currentWord, (newWord) => {
    if (newWord) {
        GameEngine.playAudio(newWord.word);

        // Select random example if available
        if (newWord.examples && newWord.examples.length > 0) {
            const ex = newWord.examples[Math.floor(Math.random() * newWord.examples.length)];
            // Mask the word (case insensitive)
            const regex = new RegExp(newWord.word, 'gi');
            session.currentExample = {
                original: ex,
                masked: ex.replace(regex, '______')
            };
        } else {
            session.currentExample = null;
        }
    }
}, { immediate: true });

const progressPercent = computed(() => {
    return ((session.currentIndex) / session.queue.length) * 100;
});

const timeLeft = computed(() => session.timeLeft);

const handleAnswer = (option) => {
    GameEngine.submitAnswer(option);
};

const getOptionClass = (option) => {
    if (!session.isAnswered) {
        return 'bg-surface text-text-main border-transparent hover_border-primary-opacity-50 hover_bg-surface-opacity-80 hover_shadow-md';
    }

    // 1. Correct Option (Always Green)
    if (option === session.correctOption) {
        return 'bg-green-500 text-white border-green-600 shadow-pk-correct translate-y-1 z-20';
    }

    // 2. User Selected Wrong Option (Red)
    if (option === session.selectedOption && option !== session.correctOption) {
        return 'bg-rose-500 text-white border-rose-600 shadow-pk-wrong translate-y-1 z-20';
    }

    // 3. Other distractors (Faded)
    return 'bg-surface text-text-muted opacity-50 border-transparent';
}
</script>

<template>
    <view class="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-background transition-colors">
        <!-- Progress Bar -->
        <view class="h-2 w-full bg-secondary">
            <view 
                class="h-full bg-primary transition-all duration-300 ease-linear"
                :style="{ width: `${(timeLeft / 15) * 100}%` }"
                :class="{ 'bg-rose-500': timeLeft < 5 }"
            ></view>
        </view>
        
        <view class="flex-1 flex flex-col p-4 md_p-8 h-full relative overflow-hidden w-full max-w-3xl mx-auto transition-colors" :style="{ paddingTop: 'var(--status-bar-height, 0px)' }">
        <!-- Header -->
        <view class="flex justify-between items-center mb-6 relative">
            <button @click="GameEngine.quitSession()" class="text-text-muted hover_text-rose-500 transition-colors p-2 -ml-2">
                <text class="text-xl">❌</text>
            </button>

            <view class="absolute left-1-2 -translate-x-1-2 w-full max-w-150 md_max-w-200 bg-secondary rounded-full h-3">
                <view class="bg-primary h-full rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercent + '%' }"></view>
            </view>
            
            <view v-if="combo > 1" class="font-black text-orange-500 text-lg md_text-2xl animate-bounce">
                {{ combo }} COMBO!
            </view>
            <view v-else class="text-text-muted text-sm font-bold">
                {{ session.currentIndex + 1 }} / {{ session.queue.length }}
            </view>
        </view>

        <!-- Card Container -->
        <view class="flex-1 flex flex-col justify-center relative z-10 w-full">
            
            <!-- Word Card -->
            <view class="bg-surface rounded-4xl shadow-sm border border-slate-100 dark_border-white-opacity-5 p-5 md_p-10 mb-4 md_mb-6 text-center relative animate-float w-full flex flex-col justify-center min-h-[40vh]">
                <text class="text-3xl sm_text-4xl md_text-6xl font-black text-text-main mb-1 break-words leading-tight block">{{ session.currentWord?.word }}</text>
                <view class="flex items-center justify-center gap-3">
                    <text v-if="session.currentWord?.partOfSpeech" class="text-text-muted font-bold text-base md_text-lg italic">{{ session.currentWord?.partOfSpeech }}</text>
                    <view class="text-text-muted font-mono text-base md_text-lg bg-secondary inline-block px-3 py-1 rounded-lg">
                        {{ session.currentWord?.phonetic || '/.../' }}
                    </view>
                </view>

                <!-- Example Context -->
                <view v-if="session.currentExample" class="mt-4 md_mt-8 mb-2">
                    <text class="text-text-muted text-base md_text-xl font-medium italic transition-all duration-300 leading-relaxed block">
                        "{{ (session.isAnswered || session.isCorrect) ? session.currentExample.original : session.currentExample.masked }}"
                    </text>
                </view>

                <!-- Volume Icon -->
                <button class="absolute top-2 right-2 md_top-4 md_right-4 text-text-muted hover_text-primary active_scale-95 transition-colors p-3" @click="GameEngine.playAudio(session.currentWord?.word)">
                    <text class="text-xl md_text-2xl">🔊</text>
                </button>
                
                <!-- Feedback Overlay (Standard transitions might skip) -->
                <view v-if="session.isAnswered && session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden">
                     <view class="text-6xl md_text-9xl text-green-500 opacity-20"><text>✅</text></view>
                </view>
                <view v-if="session.isAnswered && !session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden">
                     <view class="text-6xl md_text-9xl text-rose-500 opacity-20"><text>❌</text></view>
                </view>
            </view>

            <!-- Options Grid -->
            <view class="grid grid-cols-1 md_grid-cols-2 gap-4">
                <button 
                    v-for="(option, index) in session.options" 
                    :key="index"
                    @click="handleAnswer(option)"
                    class="p-6 rounded-2xl font-bold text-lg shadow-sm border-2 transition-all active_scale-95 text-left relative overflow-hidden group flex items-center gap-3"
                    :class="getOptionClass(option)"
                    :disabled="session.isAnswered"
                >
                    <view class="w-8 h-8 md_w-10 md_h-10 rounded-lg bg-secondary flex items-center justify-center text-xs md_text-sm text-primary font-bold transition-colors shrink-0">
                        {{ String.fromCharCode(65 + index) }}
                    </view>
                    <text class="flex-1 text-left line-clamp-2 md_line-clamp-1 relative z-10">{{ option }}</text>
                </button>
            </view>

        </view>

        <!-- Juicy Background Blobs -->
        <view class="absolute -bottom-20 -left-20 w-48 h-48 md_w-64 md_h-64 bg-primary-opacity-5 rounded-full filter blur-3xl animate-pulse"></view>
        <view class="absolute top-20 -right-20 w-48 h-48 md_w-64 md_h-64 bg-accent-opacity-5 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s"></view>
    </view>
</view>
</template>
