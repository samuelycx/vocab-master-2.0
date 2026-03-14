<script setup>
import { computed, watch, onUnmounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { GameEngine } from '../engine.js';
import { SocketManager } from '../socket.js';

const session = GameEngine.session;
const pk = computed(() => GameState.game.pk);
const user = GameState.user;
const isSearching = ref(false);
const isInLobby = ref(true); // Default to lobby when mounting
const joinCode = ref('');

const startPK = (mode) => {
    GameState.game.pk.mode = mode;
    if (mode === 'bot') {
        isInLobby.value = false;
        GameEngine.startPKSession();
    } else if (mode === 'online') {
        isInLobby.value = false;
        isSearching.value = true;
        SocketManager.joinQueue(user.id, user.username, user.avatar);
    } else if (mode === 'private') {
        SocketManager.createPrivateMatch(user);
    }
};

const joinPrivate = () => {
    if (!joinCode.value) return;
    isInLobby.value = false;
    isSearching.value = true;
    SocketManager.joinPrivateMatch(user, joinCode.value);
};

// Watch for match start
watch(() => pk.value.isActive, (active) => {
    if (active) {
        isInLobby.value = false;
        isSearching.value = false;
    }
});

// Auto-play audio
watch(() => session.currentWord, (newWord) => {
    if (newWord) {
        GameEngine.playAudio(newWord.word);
        
        // Random example masking similar to GameArena
        if (newWord.examples && newWord.examples.length > 0) {
            const ex = newWord.examples[Math.floor(Math.random() * newWord.examples.length)];
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

const handleAnswer = (option) => {
    GameEngine.submitAnswer(option);
};

const getOptionClass = (option) => {
    if (!session.isAnswered) {
        return 'bg-surface text-color hover:bg-indigo-50 hover:border-indigo-200 transition-all';
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
    return 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 pointer-events-none opacity-50';
};

const quitPK = () => {
    // Clear bot interval just in case
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
    SocketManager.disconnect();
    isSearching.value = false;
    isInLobby.value = true; // Return to lobby first? Or dashboard?
    Actions.setView('dashboard');
};

const playAgain = () => {
    isInLobby.value = true; // Go back to lobby to choose mode
    // Or restart same mode? Let's go to lobby.
};

onUnmounted(() => {
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
});

// Max score for progress bars
const WIN_SCORE = 200; 

</script>

<template>
    <div class="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-background transition-colors">
        
        <!-- PK Header / HUD -->
        <div class="p-4 md:p-6 pb-2 z-20">
            <div class="flex justify-between items-end gap-4 max-w-4xl mx-auto mb-2">
                <!-- User Side -->
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 rounded-full bg-surface border border-slate-100 dark:border-white/5 flex items-center justify-center text-xl shadow-inner">
                            {{ user.avatar }}
                        </div>
                        <div class="font-black text-text-main truncate text-sm md:text-base">
                            {{ user.username }}
                        </div>
                    </div>
                    <!-- User Bar -->
                    <div class="h-4 w-full bg-secondary rounded-full overflow-hidden border border-transparent relative">
                        <div 
                            class="h-full bg-primary transition-all duration-500 ease-out relative" 
                            :style="{ width: `${Math.min((pk.userScore / WIN_SCORE) * 100, 100)}%` }"
                        >
                            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    <div class="text-right font-black text-primary text-sm">{{ pk.userScore }}</div>
                </div>

                <!-- VS Badge -->
                <div class="mb-6 shrink-0">
                    <div class="w-12 h-12 rounded-full bg-slate-800 text-white font-black flex items-center justify-center text-xl shadow-lg border-4 border-white dark:border-slate-800 italic transform -rotate-12">
                        VS
                    </div>
                </div>

                <!-- Opponent Side (Bot or Human) -->
                <div class="flex-1 flex flex-col gap-2 items-end">
                    <div class="flex items-center gap-2 flex-row-reverse">
                        <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xl shadow-inner border border-white dark:border-slate-600">
                            {{ pk.opponent?.avatar || '👤' }}
                        </div>
                        <div class="font-black text-text-main truncate text-sm md:text-base">
                            {{ pk.opponent?.name || '等待中...' }}
                        </div>
                    </div>
                    <!-- Opponent Bar -->
                    <div class="h-4 w-full bg-secondary rounded-full overflow-hidden border border-transparent relative">
                        <div 
                            class="h-full bg-rose-500 transition-all duration-500 ease-out relative" 
                            :style="{ width: `${Math.min(((pk.opponent?.score || 0) / WIN_SCORE) * 100, 100)}%` }"
                        ></div>
                    </div>
                    <div class="text-left font-black text-rose-500 text-sm">{{ pk.opponent?.score || 0 }}</div>
                </div>
            </div>
        </div>

        <!-- Game Content -->
        <div class="flex-1 flex flex-col p-4 md:p-6 max-w-3xl mx-auto w-full justify-center relative z-10">
            
            <!-- Result Overlay -->
            <div v-if="pk.winner" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in p-8 text-center rounded-3xl">
                <div class="text-8xl mb-6 animate-bounce">
                    {{ pk.winner === 'user' ? '🏆' : '💀' }}
                </div>
                <h2 class="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter" :class="pk.winner === 'user' ? 'text-indigo-500' : 'text-slate-500'">
                    {{ pk.winner === 'user' ? '胜利!' : '失败' }}
                </h2>
                <p class="text-slate-500 dark:text-slate-400 text-xl font-bold mb-10 max-w-md">
                    <span v-if="pk.endReason === 'disconnect'" class="block text-rose-500 mb-2">
                        {{ pk.winner === 'user' ? '对手已断开连接' : '连接已断开' }}
                    </span>
                    {{ pk.winner === 'user' ? '恭喜! 你击败了挑战者!' : '挑战失败，别灰心，再试一次!' }}
                </p>
                <div class="flex flex-col gap-4 w-full max-w-xs">
                    <button @click="playAgain" class="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 active:scale-95 transition-transform">
                        再去一次
                    </button>
                    <button @click="quitPK" class="w-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl active:scale-95 transition-transform">
                        回到主页
                    </button>
                </div>
            </div>

            <!-- Lobby / Mode Selection -->
            <div v-if="isInLobby" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background p-8 text-center transition-colors">
                 <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mb-2">PK 竞技场</h1>
                 <p class="text-slate-500 dark:text-slate-400 text-xl font-bold mb-12">选择你的挑战模式</p>
                 
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                     <!-- Practice Mode -->
                     <button @click="startPK('bot')" class="group relative overflow-hidden bg-surface rounded-[2rem] p-8 hover:border-primary border border-transparent shadow-sm transition-all text-left">
                         <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div class="text-6xl mb-4">🤖</div>
                         <h3 class="text-2xl font-black text-text-main mb-2">人机练习</h3>
                         <p class="text-text-muted font-bold">与 Vocab Bot 切磋技艺</p>
                     </button>
                     
                     <!-- Ranked Mode -->
                     <button @click="startPK('online')" class="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-[2rem] text-white transition-all shadow-xl hover:shadow-rose-500/30 hover:-translate-y-1 text-left">
                         <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div class="text-6xl mb-4 text-white drop-shadow-md">🏆</div>
                         <h3 class="text-2xl font-black mb-2">排位对战</h3>
                         <p class="text-rose-100 font-bold">与真实玩家实时对决</p>
                     </button>
                 </div>
                 
                 <button @click="quitPK" class="mt-12 text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-300">返回主页</button>
            </div>

            <!-- Searching Overlay -->
            <div v-else-if="isSearching" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-sm p-8 text-center rounded-3xl">
                <div class="w-24 h-24 mb-6 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-2">寻找对手中...</h2>
                <button @click="quitPK" class="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold">取消</button>
            </div>

            <!-- Normal Gameplay Interface (Hidden if winner) -->
            <div v-else class="w-full h-full flex flex-col justify-center">
                 <!-- Word Card -->
                <div class="bg-surface rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-6 md:p-10 mb-6 md:mb-10 text-center relative animate-float w-full">
                    <h2 class="text-3xl md:text-5xl font-black text-text-main mb-2 break-words">{{ session.currentWord?.word }}</h2>
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
                        <div v-if="session.isAnswered && session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden z-10">
                             <div class="text-6xl md:text-9xl text-green-500 opacity-20"><i class="fas fa-check"></i></div>
                        </div>
                     </transition>
                     <transition enter-active-class="animate-shake">
                        <div v-if="session.isAnswered && !session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden z-10">
                             <div class="text-6xl md:text-9xl text-rose-500 opacity-20"><i class="fas fa-times"></i></div>
                        </div>
                     </transition>
                </div>

                <!-- Options Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        v-for="(option, idx) in session.options" 
                        :key="idx"
                        @click="handleAnswer(option)"
                        class="p-6 rounded-2xl font-bold text-lg shadow-sm border-2 transition-all active:scale-95 text-left relative overflow-hidden group flex items-center gap-3"
                        :class="getOptionClass(option)"
                        :disabled="session.isAnswered"
                    >
                         <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-secondary flex items-center justify-center text-xs md:text-sm text-primary font-bold group-hover:bg-primary group-hover:text-surface transition-colors shrink-0">
                            {{ String.fromCharCode(65 + idx) }}
                        </div>
                        <div class="relative z-10 flex-1">{{ option }}</div>
                    </button>
                </div>
            </div>
            
            <button @click="quitPK" v-if="!pk.winner" class="mt-8 text-slate-400 dark:text-slate-500 text-sm font-bold hover:text-rose-500 transition-colors">
                退出对战
            </button>

        </div>
    </div>
</template>
