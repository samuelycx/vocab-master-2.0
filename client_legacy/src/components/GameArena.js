import { reactive, computed, watch } from 'vue';
import { GameState } from '../state.js';
import { GameEngine } from '../engine.js';

export default {
    setup() {
        const session = GameEngine.session;

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

        const handleAnswer = (option) => {
            GameEngine.submitAnswer(option);
        };

        const getOptionClass = (option) => {
            if (!session.isAnswered) return 'bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-200';

            if (option === session.correctOption) {
                return 'bg-green-500 text-white border-green-600 shadow-[0_4px_0_0_#15803d] translate-y-1';
            }
            if (session.isAnswered && !session.isCorrect && option !== session.correctOption && option === session.selectedOption) { // Fix selection logic
                // We don't store selectedOption in engine yet, simplified logic below
                return 'bg-white text-slate-300 pointer-events-none';
            }
            return 'bg-white text-slate-300 pointer-events-none';
        }

        // Helper for template logic
        const isSelectedWrong = (option) => {
            // Basic visual feedback handled by loops
            return false;
        }

        return {
            session,
            progressPercent,
            handleAnswer,
            getOptionClass,
            combo: computed(() => GameState.game.combo)
        };
    },
    template: `
        <div class="flex-1 flex flex-col p-6 h-full relative overflow-hidden">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
                <div class="w-full bg-slate-200 rounded-full h-3 max-w-[200px]">
                    <div class="bg-primary h-full rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <div v-if="combo > 1" class="font-black text-orange-500 text-xl animate-bounce">
                    {{ combo }} COMBO!
                </div>
                <div v-else class="text-slate-400 text-sm font-bold">
                    {{ session.currentIndex + 1 }} / {{ session.queue.length }}
                </div>
            </div>

            <!-- Card Container -->
            <div class="flex-1 flex flex-col justify-center relative z-10">
                
                <!-- Word Card -->
                <div class="bg-white rounded-3xl p-8 shadow-xl border-b-8 border-slate-100 mb-8 text-center relative animate-float">
                    <h2 class="text-4xl font-black text-slate-800 mb-2">{{ session.currentWord?.word }}</h2>
                    <div class="text-slate-400 font-mono text-lg bg-slate-100 inline-block px-3 py-1 rounded-lg">
                        {{ session.currentWord?.phonetic || '/.../' }}
                    </div>

                    <!-- Example Context -->
                    <div v-if="session.currentExample" class="mt-6 mb-2">
                        <p class="text-slate-600 text-lg font-medium italic transition-all duration-300">
                            "{{ (session.isAnswered || session.isCorrect) ? session.currentExample.original : session.currentExample.masked }}"
                        </p>
                    </div>

                    <!-- Volume Icon -->
                    <button class="absolute top-4 right-4 text-slate-300 hover:text-primary transition-colors p-2" @click="GameEngine.playAudio(session.currentWord?.word)">
                        <i class="fas fa-volume-up text-xl"></i>
                    </button>
                    
                    <!-- Feedback Overlay -->
                     <transition enter-active-class="animate-success">
                        <div v-if="session.isAnswered && session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div class="text-8xl text-green-500 opacity-20"><i class="fas fa-check"></i></div>
                        </div>
                     </transition>
                     <transition enter-active-class="animate-shake">
                        <div v-if="session.isAnswered && !session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div class="text-8xl text-rose-500 opacity-20"><i class="fas fa-times"></i></div>
                        </div>
                     </transition>
                </div>

                <!-- Options Grid -->
                <div class="grid gap-3">
                    <button 
                        v-for="(option, index) in session.options" 
                        :key="index"
                        @click="handleAnswer(option)"
                        :disabled="session.isAnswered"
                        :class="getOptionClass(option)"
                        class="w-full py-4 px-6 rounded-2xl font-bold text-lg border-2 border-slate-100 shadow-sm transition-all duration-200 active:scale-95 active:border-b-2 flex items-center gap-3 group"
                    >
                        <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-500">
                            {{ String.fromCharCode(65 + index) }}
                        </div>
                        <span class="flex-1 text-left line-clamp-1">{{ option }}</span>
                    </button>
                </div>

            </div>

            <!-- Juicy Background Blobs -->
            <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl animate-pulse"></div>
            <div class="absolute top-20 -right-20 w-64 h-64 bg-accent/5 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        </div>
    `
};
