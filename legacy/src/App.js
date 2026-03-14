import { computed } from 'vue';
import { GameState, Actions } from './state.js';
import Welcome from './components/Welcome.js';
import Dashboard from './components/Dashboard.js';
import GameArena from './components/GameArena.js';
import Result from './components/Result.js';

export default {
    components: { Welcome, Dashboard, GameArena, Result },
    setup() {
        const currentView = computed(() => GameState.game.view);

        const viewComponent = computed(() => {
            switch (currentView.value) {
                case 'welcome': return Welcome;
                case 'dashboard': return Dashboard;
                case 'arena': return GameArena;
                case 'result': return Result;
                default: return Welcome;
            }
        });

        const isGameView = computed(() => ['arena', 'result'].includes(currentView.value));

        return {
            currentView,
            viewComponent,
            isGameView
        };
    },
    template: `
        <div class="h-full flex flex-col relative w-full h-screen">
            <!-- Background Elements (Hide in Game) -->
            <div v-if="!isGameView" class="absolute top-0 left-0 w-full h-64 bg-primary rounded-b-[3rem] shadow-lg -z-10"></div>
            
            <!-- Dynamic View -->
            <transition 
                enter-active-class="transition duration-300 ease-out" 
                enter-from-class="transform translate-y-4 opacity-0" 
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in" 
                leave-from-class="transform translate-y-0 opacity-100" 
                leave-to-class="transform -translate-y-4 opacity-0"
                mode="out-in"
            >
                <component :is="viewComponent" class="flex-1 flex flex-col" />
            </transition>

            <!-- Navigation Bar (Only visible in Dashboard related views) -->
            <nav v-if="currentView === 'dashboard'" class="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-40 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button class="flex flex-col items-center text-primary transition-transform active:scale-95">
                    <i class="fas fa-home text-xl mb-1"></i>
                    <span class="text-[10px] font-bold">主页</span>
                </button>
                <button class="flex flex-col items-center text-slate-400 hover:text-secondary transition-transform active:scale-95">
                    <i class="fas fa-chart-bar text-xl mb-1"></i>
                    <span class="text-[10px] font-bold">排行</span>
                </button>
                <div class="-mt-8 bg-accent text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-rose-300 active:scale-95 transition-transform cursor-pointer border-4 border-white">
                    <i class="fas fa-play text-xl ml-1"></i>
                </div>
                <!-- ... -->
            </nav>
        </div>
    `
};
