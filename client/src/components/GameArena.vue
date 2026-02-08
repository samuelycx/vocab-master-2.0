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
        return 'bg-surface text-text-main border-transparent hover:border-primary/50 hover:bg-surface/80 hover:shadow-md';
    }

    // 1. Correct Option (Always Green)
    if (option === session.correctOption) {
        return 'bg-green-500 text-white border-green-600 shadow-[0_4px_0_0_#15803d] translate-y-1 z-20';
    }

    // 2. User Selected Wrong Option (Red)
    if (option === session.selectedOption && option !== session.correctOption) {
        return 'bg-rose-500 text-white border-rose-600 shadow-[0_4px_0_0_#be123c] translate-y-1 z-20';
    }

    // 3. Other distractors (Faded)
    return 'bg-surface text-text-muted opacity-50 border-transparent';
}
</script>

<template>
    <div class="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-background transition-colors">
        <!-- Progress Bar -->
        <div class="h-2 w-full bg-secondary">
            <div 
                class="h-full bg-primary transition-all duration-300 ease-linear"
                :style="{ width: `${(timeLeft / 15) * 100}%` }"
                :class="{ 'bg-rose-500': timeLeft < 5 }"
            ></div>
        </div>
        
        <div class="flex-1 flex flex-col p-4 md:p-8 h-full relative overflow-hidden w-full max-w-3xl mx-auto transition-colors">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6 relative">
            <button @click="GameEngine.quitSession()" class="text-text-muted hover:text-rose-500 transition-colors p-2 -ml-2">
                <i class="fas fa-times text-xl"></i>
            </button>

            <div class="absolute left-1/2 -translate-x-1/2 w-full max-w-[150px] md:max-w-[200px] bg-secondary rounded-full h-3">
                <div class="bg-primary h-full rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercent + '%' }"></div>
            </div>
            
            <div v-if="combo > 1" class="font-black text-orange-500 text-lg md:text-2xl animate-bounce">
                {{ combo }} COMBO!
            </div>
            <div v-else class="text-text-muted text-sm font-bold">
                {{ session.currentIndex + 1 }} / {{ session.queue.length }}
            </div>
        </div>

        <!-- Card Container -->
        <div class="flex-1 flex flex-col justify-center relative z-10 w-full">
            
            <!-- Word Card -->
            <!-- Word Card -->
            <div class="bg-surface rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-10 mb-6 md:mb-10 text-center relative animate-float w-full flex flex-col justify-center min-h-[200px]">
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-text-main mb-2 break-words leading-tight">{{ session.currentWord?.word }}</h2>
                <div class="flex items-center justify-center gap-3">
                    <span v-if="session.currentWord?.partOfSpeech" class="text-text-muted font-bold text-base md:text-lg italic">{{ session.currentWord?.partOfSpeech }}</span>
                    <div class="text-text-muted font-mono text-base md:text-lg bg-secondary inline-block px-3 py-1 rounded-lg">
                        {{ session.currentWord?.phonetic || '/.../' }}
                    </div>
                </div>

                <!-- Example Context -->
                <div v-if="session.currentExample" class="mt-4 md:mt-8 mb-2">
                    <p class="text-text-muted text-base md:text-xl font-medium italic transition-all duration-300 leading-relaxed">
                        "{{ (session.isAnswered || session.isCorrect) ? session.currentExample.original : session.currentExample.masked }}"
                    </p>
                </div>

                <!-- Volume Icon -->
                <button class="absolute top-2 right-2 md:top-4 md:right-4 text-text-muted hover:text-primary active:scale-95 transition-colors p-3" @click="GameEngine.playAudio(session.currentWord?.word)">
                    <i class="fas fa-volume-up text-xl md:text-2xl"></i>
                </button>
                
                <!-- Feedback Overlay -->
                 <transition enter-active-class="animate-success">
                    <div v-if="session.isAnswered && session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden">
                         <div class="text-6xl md:text-9xl text-green-500 opacity-20"><i class="fas fa-check"></i></div>
                    </div>
                 </transition>
                 <transition enter-active-class="animate-shake">
                    <div v-if="session.isAnswered && !session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden">
                         <div class="text-6xl md:text-9xl text-rose-500 opacity-20"><i class="fas fa-times"></i></div>
                    </div>
                 </transition>
            </div>

            <!-- Options Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    v-for="(option, index) in session.options" 
                    :key="index"
                    @click="handleAnswer(option)"
                    class="p-6 rounded-2xl font-bold text-lg shadow-sm border-2 transition-all active:scale-95 text-left relative overflow-hidden group flex items-center gap-3"
                    :class="getOptionClass(option)"
                    :disabled="session.isAnswered"
                >
                    <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center text-xs md:text-sm text-primary font-bold group-hover:bg-primary group-hover:text-surface transition-colors shrink-0">
                        {{ String.fromCharCode(65 + index) }}
                    </div>
                    <span class="flex-1 text-left line-clamp-2 md:line-clamp-1 relative z-10">{{ option }}</span>
                </button>
            </div>

        </div>

        <!-- Juicy Background Blobs -->
        <div class="absolute -bottom-20 -left-20 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute top-20 -right-20 w-48 h-48 md:w-64 md:h-64 bg-accent/5 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s"></div>
    </div>
    </div>
</template>
