import { GameState } from '../state.js';
import { GameEngine } from '../engine.js';

export default {
    setup() {
        const startChallenge = () => {
            GameEngine.startSession(10);
        };

        return {
            state: GameState,
            user: GameState.user,
            startChallenge
        };
    },
    template: `
        <div class="flex-1 flex flex-col p-6 w-full max-w-full overflow-y-auto pb-24">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8 text-white">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl border-2 border-white/30">
                        {{ user.avatar }}
                    </div>
                    <div>
                        <div class="text-xs opacity-80 font-bold uppercase tracking-wider">Level {{ user.level }}</div>
                        <div class="font-bold text-lg">学习者</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <div class="bg-black/20 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold border border-white/10">
                        <i class="fas fa-fire text-orange-400"></i> {{ user.streak }}
                    </div>
                    <div class="bg-black/20 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold border border-white/10">
                        <i class="fas fa-star text-yellow-400"></i> {{ user.coins }}
                    </div>
                </div>
            </div>

            <!-- Bento Grid -->
            <div class="grid grid-cols-2 gap-4">
                <!-- Main Card: Continue -->
                <div @click="startChallenge" class="col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group btn-press cursor-pointer">
                    <div class="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div class="relative z-10">
                        <div class="text-primary font-bold mb-1 uppercase text-xs tracking-wider">今日任务</div>
                        <h3 class="text-2xl font-black text-slate-800 mb-2">每日挑战</h3>
                        <p class="text-slate-400 text-sm mb-4">完成 20 个单词复习</p>
                        <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div class="bg-primary h-full rounded-full w-1/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                    </div>
                </div>
                <!-- ... other items same as before ... -->
                <!-- Stats: Learned -->
                <div class="bg-orange-50 rounded-3xl p-5 shadow-sm border border-orange-100 relative group btn-press cursor-pointer">
                    <i class="fas fa-book-open text-orange-400 text-2xl mb-2 group-hover:scale-110 transition-transform block origin-left"></i>
                    <div class="text-2xl font-black text-slate-800">{{ state.game.todayLearned }}</div>
                    <div class="text-xs text-orange-400 font-bold">今日新词</div>
                </div>

                <!-- Stats: Accuracy -->
                <div class="bg-emerald-50 rounded-3xl p-5 shadow-sm border border-emerald-100 relative group btn-press cursor-pointer">
                    <i class="fas fa-bullseye text-emerald-500 text-2xl mb-2 group-hover:scale-110 transition-transform block origin-left"></i>
                    <div class="text-2xl font-black text-slate-800">92%</div>
                    <div class="text-xs text-emerald-500 font-bold">正确率</div>
                </div>

                <!-- Action: PK Arena -->
                <div class="col-span-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 shadow-lg shadow-rose-200 text-white relative overflow-hidden btn-press cursor-pointer">
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20">
                        <i class="fas fa-swords"></i>
                    </div>
                    <div class="relative z-10">
                        <div class="font-bold text-lg mb-1 flex items-center gap-2">
                            <i class="fas fa-bolt"></i> 竞技场
                        </div>
                        <p class="text-white/80 text-sm">与好友实时 PK 单词量</p>
                    </div>
                </div>
            </div>

            <!-- Recent Achievements -->
            <div class="mt-8">
                <h3 class="font-bold text-slate-800 mb-4 px-2">最近成就</h3>
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                        🏆
                    </div>
                    <div>
                        <div class="font-bold text-slate-800">单词大师 I</div>
                        <div class="text-xs text-slate-400">累计学习 100 个单词</div>
                    </div>
                </div>
            </div>
        </div>
    `
};
