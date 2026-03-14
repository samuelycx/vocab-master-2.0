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
        try {
            SocketManager.joinQueue(user.id, user.username, user.avatar);
        } catch (err) {
            console.error('Failed to join queue:', err);
            isSearching.value = false;
            uni.showToast({ title: '连接失败，请检查网络', icon: 'none' });
        }
    } else if (mode === 'private') {
        uni.showToast({ title: '私人对战功能即将上线', icon: 'none' });
    }
};

const joinPrivate = () => {
    if (!joinCode.value) {
        uni.showToast({ title: '请输入房间号', icon: 'none' });
        return;
    }
    uni.showToast({ title: '私人对战功能即将上线', icon: 'none' });
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
        return 'bg-surface text-color hover_bg-indigo-50 hover_border-indigo-200 transition-all';
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
    return 'bg-white dark_bg-slate-800 text-slate-300 dark_text-slate-600 pointer-events-none opacity-50';
};

const quitPK = () => {
    // Clear bot interval just in case
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
    SocketManager.leaveQueue();
    isSearching.value = false;
    isInLobby.value = true; // Return to lobby first? Or dashboard?
    Actions.setView('dashboard');
};

const playAgain = () => {
    isInLobby.value = true; // Go back to lobby to choose mode
};

onUnmounted(() => {
    if (GameEngine.botInterval) clearInterval(GameEngine.botInterval);
});

// Max score for progress bars
const WIN_SCORE = 200; 

</script>

<template>
    <view class="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-background transition-colors">
        
        <!-- PK Header / HUD -->
        <view class="p-4 md_p-6 pb-2 z-20" :style="{ paddingTop: 'var(--status-bar-height, 0px)' }">
            <view class="flex justify-between items-end gap-4 max-w-4xl mx-auto mb-2">
                <!-- User Side -->
                <view class="flex-1 flex flex-col gap-2">
                    <view class="flex items-center gap-2">
                        <view class="w-10 h-10 rounded-full bg-surface border border-slate-100 dark_border-white-opacity-5 flex items-center justify-center text-xl shadow-inner">
                            <text>{{ user.avatar }}</text>
                        </view>
                        <text class="font-black text-text-main truncate text-sm md_text-base block">
                            {{ user.username }}
                        </text>
                    </view>
                    <!-- User Bar -->
                    <view class="h-4 w-full bg-secondary rounded-full overflow-hidden border border-transparent relative">
                        <view 
                            class="h-full bg-primary transition-all duration-500 ease-out relative" 
                            :style="{ width: `${Math.min((pk.userScore / WIN_SCORE) * 100, 100)}%` }"
                        >
                            <view class="absolute inset-0 bg-white-opacity-20 animate-pulse"></view>
                        </view>
                    </view>
                    <text class="text-right font-black text-primary text-sm block">{{ pk.userScore }}</text>
                </view>

                <!-- VS Badge -->
                <view class="mb-6 shrink-0">
                    <view class="w-12 h-12 rounded-full bg-slate-800 text-white font-black flex items-center justify-center text-xl shadow-lg border-4 border-white dark_border-slate-800 italic transform -rotate-12">
                        VS
                    </view>
                </view>

                <!-- Opponent Side (Bot or Human) -->
                <view class="flex-1 flex flex-col gap-2 items-end">
                    <view class="flex items-center gap-2 flex-row-reverse">
                        <view class="w-10 h-10 rounded-full bg-rose-100 dark_bg-rose-opacity-30 flex items-center justify-center text-xl shadow-inner border border-white dark_border-slate-600">
                             <text>{{ pk.opponent?.avatar || '👤' }}</text>
                        </view>
                        <text class="font-black text-text-main truncate text-sm md_text-base block">
                            {{ pk.opponent?.name || '等待中...' }}
                        </text>
                    </view>
                    <!-- Opponent Bar -->
                    <view class="h-4 w-full bg-secondary rounded-full overflow-hidden border border-transparent relative">
                        <view 
                            class="h-full bg-rose-500 transition-all duration-500 ease-out relative" 
                            :style="{ width: `${Math.min(((pk.opponent?.score || 0) / WIN_SCORE) * 100, 100)}%` }"
                        ></view>
                    </view>
                    <text class="text-left font-black text-rose-500 text-sm block">{{ pk.opponent?.score || 0 }}</text>
                </view>
            </view>
        </view>

        <!-- Game Content -->
        <view class="flex-1 flex flex-col p-4 md_p-6 max-w-3xl mx-auto w-full justify-center relative z-10">
            
            <!-- Result Overlay -->
            <view v-if="pk.winner" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background bg-opacity-95 backdrop-blur-sm animate-fade-in p-6 text-center rounded-3xl">
                <text class="text-6xl md_text-8xl mb-4 animate-bounce block">
                    {{ pk.winner === 'user' ? '🏆' : '💀' }}
                </text>
                <text class="text-3xl md_text-5xl font-black mb-2 uppercase tracking-tighter block" :class="pk.winner === 'user' ? 'text-indigo-500' : 'text-slate-500'">
                    {{ pk.winner === 'user' ? '胜利!' : '失败' }}
                </text>
                <view class="text-slate-500 dark_text-slate-400 text-base md_text-lg font-bold mb-8 max-w-md">
                    <text v-if="pk.endReason === 'disconnect'" class="block text-rose-500 mb-1">
                        {{ pk.winner === 'user' ? '对手已断开连接' : '连接已断开' }}
                    </text>
                    <text class="block leading-tight text-text-muted">{{ pk.winner === 'user' ? '恭喜! 你击败了挑战者!' : '挑战失败，别灰心，再试一次!' }}</text>
                </view>
                <view class="flex flex-col gap-4 w-full max-w-xs">
                    <button @click="playAgain" class="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark_shadow-indigo-opacity-30 active_scale-95 transition-transform">
                        再去一次
                    </button>
                    <button @click="quitPK" class="w-full bg-slate-200 dark_bg-slate-700 text-slate-600 dark_text-slate-300 font-bold py-4 rounded-xl active_scale-95 transition-transform">
                        回到主页
                    </button>
                </view>
            </view>

            <!-- Lobby / Mode Selection -->
            <view v-if="isInLobby" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background p-8 text-center transition-colors">
                 <text class="text-4xl md_text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600 mb-2 block">PK 竞技场</text>
                 <text class="text-slate-500 dark_text-slate-400 text-xl font-bold mb-12 block">选择你的挑战模式</text>
                 
                 <view class="grid grid-cols-1 md_grid-cols-2 gap-6 w-full max-w-2xl">
                     <!-- Practice Mode -->
                     <button @click="startPK('bot')" class="group relative overflow-hidden bg-surface rounded-4xl p-8 border border-transparent shadow-sm transition-all text-left block">
                         <view class="text-6xl mb-4"><text>🤖</text></view>
                         <text class="text-2xl font-black text-text-main mb-2 block">人机练习</text>
                         <text class="text-text-muted font-bold block">与 Vocab Bot 切磋技艺</text>
                     </button>
                     
                     <!-- Ranked Mode -->
                     <button @click="startPK('online')" class="group relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-4xl text-white transition-all shadow-xl text-left block">
                         <view class="text-6xl mb-4 text-white drop-shadow-md"><text>🏆</text></view>
                         <text class="text-2xl font-black mb-2 block">排位对战</text>
                         <text class="text-rose-100 font-bold block">与真实玩家实时对决</text>
                     </button>
                 </view>
                 
                 <button @click="quitPK" class="mt-12 text-slate-400 font-bold">返回主页</button>
            </view>

            <!-- Searching Overlay -->
            <view v-else-if="isSearching" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-opacity-90 dark_bg-slate-dark-opacity-95 backdrop-blur-sm p-8 text-center rounded-3xl">
                <view class="w-24 h-24 mb-6 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></view>
                <text class="text-2xl font-black text-slate-800 dark_text-white mb-2 block">寻找对手中...</text>
                <button @click="quitPK" class="px-6 py-2 bg-slate-200 dark_bg-slate-700 text-slate-600 dark_text-slate-300 rounded-lg font-bold">取消</button>
            </view>

            <!-- Normal Gameplay Interface (Hidden if winner) -->
            <view v-else class="w-full h-full flex flex-col justify-center">
                <!-- Word Card -->
                <view class="bg-surface rounded-4xl shadow-sm border border-slate-100 dark_border-white-opacity-5 p-5 md_p-10 mb-4 md_mb-6 text-center relative animate-float w-full min-h-[35vh] flex flex-col justify-center">
                    <text class="text-3xl md_text-6xl font-black text-text-main mb-1 break-words block">{{ session.currentWord?.word }}</text>
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
                    
                    <!-- Feedback Overlay -->
                     <view v-if="session.isAnswered && session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden z-10">
                          <view class="text-6xl md_text-9xl text-green-500 opacity-20"><text>✅</text></view>
                     </view>
                     <view v-if="session.isAnswered && !session.isCorrect" class="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden z-10">
                          <view class="text-6xl md_text-9xl text-rose-500 opacity-20"><text>❌</text></view>
                     </view>
                </view>

                <!-- Options Grid -->
                <view class="grid grid-cols-1 md_grid-cols-2 gap-4">
                    <button 
                        v-for="(option, idx) in session.options" 
                        :key="idx"
                        @click="handleAnswer(option)"
                        class="p-6 rounded-2xl font-bold text-lg shadow-sm border-2 transition-all active_scale-95 text-left relative overflow-hidden group flex items-center gap-3"
                        :class="getOptionClass(option)"
                        :disabled="session.isAnswered"
                    >
                         <view class="w-8 h-8 md_w-10 md_h-10 rounded-lg bg-secondary flex items-center justify-center text-xs md_text-sm text-primary font-bold transition-colors shrink-0">
                            {{ String.fromCharCode(65 + idx) }}
                        </view>
                        <text class="relative z-10 flex-1">{{ option }}</text>
                    </button>
                </view>
            </view>
            
            <button @click="quitPK" v-if="!pk.winner" class="mt-8 text-slate-400 dark_text-slate-500 text-sm font-bold block">
                退出对战
            </button>

        </view>
    </view>
</template>
