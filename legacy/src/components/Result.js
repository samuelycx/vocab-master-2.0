import { Actions } from '../state.js';

export default {
    setup() {
        const goHome = () => {
            Actions.setView('dashboard');
        };
        return { goHome };
    },
    template: `
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white relative overflow-hidden">
             <!-- Confetti Effect (CSS only implementation for simple demo) -->
             <div class="absolute inset-0 pointer-events-none">
                <div v-for="i in 20" :key="i" class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce" :style="{ left: Math.random()*100 + '%', top: Math.random()*50 + '%', animationDelay: Math.random() + 's' }"></div>
             </div>

            <div class="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-8 animate-bounce-in">
                <span class="text-6xl">🏆</span>
            </div>

            <h2 class="text-3xl font-black text-slate-800 mb-2">挑战完成!</h2>
            <p class="text-slate-400 mb-8">收获颇丰的一天</p>

            <div class="grid grid-cols-2 gap-4 w-full mb-8">
                <div class="bg-indigo-50 p-4 rounded-2xl">
                    <div class="text-primary font-black text-2xl">+50</div>
                    <div class="text-xs text-slate-500 uppercase font-bold">XP 经验</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-2xl">
                    <div class="text-orange-500 font-black text-2xl">+10</div>
                    <div class="text-xs text-slate-500 uppercase font-bold">金币</div>
                </div>
            </div>

            <button 
                @click="goHome"
                class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 btn-press"
            >
                返回主页
            </button>
        </div>
    `
};
