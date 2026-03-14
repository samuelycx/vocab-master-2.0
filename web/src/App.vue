<script setup>
import { computed, onMounted } from 'vue';
import Welcome from './components/Welcome.vue';
import Dashboard from './components/Dashboard.vue';
import GameArena from './components/GameArena.vue';
import PKArena from './components/PKArena.vue';
import Result from './components/Result.vue';
import Settings from './components/Settings.vue';
import VocabularyList from './components/VocabularyList.vue';
import AchievementWall from './components/AchievementWall.vue';
import LevelUpModal from './components/LevelUpModal.vue';
import AchievementUnlockModal from './components/AchievementUnlockModal.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import SocialView from './components/SocialView.vue';
import BookSelection from './components/BookSelection.vue';
import { Actions, GameState } from './state.js';
import { API } from './api.js';

onMounted(async () => {
  try {
      // Auto-login (Moved from Welcome.vue)
      if (!GameState.user.id) {
          const storedUser = localStorage.getItem('vocab_user');
          const username = 'player_' + Math.floor(Math.random() * 10000);
          const userToLogin = storedUser ? JSON.parse(storedUser).username : username;

          try {
              const res = await API.login(userToLogin);
              if (res && res.success) {
                  Actions.setUser(res.user);
                  localStorage.setItem('vocab_user', JSON.stringify(res.user));
              }
          } catch (err) {
              console.error('Auto-login failed', err);
          }
      }

      // Fetch System Configs (Feature Flags)
      const configs = await API.getSystemConfigs();
      if (configs) {
          Actions.setModules(configs);
      }

      // Refresh stats if user is logged in
      if (GameState.user.id) {
          const stats = await API.getStats(GameState.user.id);
          if (stats && stats.user) {
              Actions.setUser(stats.user);
          }
      }
  } catch (e) {
      console.error('App initialization failed', e);
  }
});
const currentView = computed(() => GameState.game.view);
const overlayState = computed(() => GameState.overlay || { current: null, queue: [] });

const views = {
    'welcome': Welcome,
    'dashboard': Dashboard,
    'settings': Settings,
    'vocabulary': VocabularyList,
    'arena': GameArena,
    'pk': PKArena,
    'result': Result,
    'social': SocialView,
    'achievement-wall': AchievementWall,
    'admin-dashboard': AdminDashboard,
    'category-selection': BookSelection
};

const viewComponent = computed(() => views[currentView.value] || Welcome);

const isGameView = computed(() => ['arena', 'pk', 'result'].includes(currentView.value));
</script>

<template>
    <div class="h-full flex flex-col relative w-full h-screen bg-background text-text-main font-body overflow-hidden">
        
        <!-- Dynamic View -->
        <div class="flex-1 overflow-y-auto pb-24">
             <transition 
                enter-active-class="transition duration-300 ease-out" 
                enter-from-class="transform translate-y-4 opacity-0" 
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in" 
                leave-from-class="transform translate-y-0 opacity-100" 
                leave-to-class="transform -translate-y-4 opacity-0"
                mode="out-in"
            >
                <component :is="viewComponent" class="min-h-full" />
            </transition>
        </div>

        <!-- Bottom Navigation Bar (Fixed) -->
        <nav v-if="!isGameView" class="absolute bottom-0 w-full h-20 bg-surface border-t border-slate-100 dark:border-white/5 flex justify-around items-center z-40 pb-2">
            <button @click="Actions.setView('dashboard')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'dashboard' ? 'text-primary' : 'text-slate-400'">
                <span class="material-symbols-outlined text-2xl group-active:scale-95 transition-transform" :class="currentView === 'dashboard' ? 'filled' : ''">home</span>
                <span class="text-[10px] font-bold">首页</span>
            </button>
            <button @click="Actions.setView('category-selection')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'category-selection' || currentView === 'vocabulary' ? 'text-primary' : 'text-slate-400'">
                <span class="material-symbols-outlined text-2xl group-active:scale-95 transition-transform">book_2</span>
                 <span class="text-[10px] font-bold">学习</span>
            </button>
             <button @click="Actions.setView('pk')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'pk' ? 'text-primary' : 'text-slate-400'">
                <span class="material-symbols-outlined text-2xl group-active:scale-95 transition-transform">swords</span>
                 <span class="text-[10px] font-bold">竞技</span>
            </button>
            <button @click="Actions.setView('social')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'social' ? 'text-primary' : 'text-slate-400'">
                <span class="material-symbols-outlined text-2xl group-active:scale-95 transition-transform">leaderboard</span>
                 <span class="text-[10px] font-bold">排行</span>
            </button>
        </nav>

        <!-- Global Overlays -->
        <LevelUpModal 
            v-if="overlayState.current?.type === 'levelUp'" 
            :level="overlayState.current.data.level"
            :rankTitle="overlayState.current.data.rankTitle"
            :rankIcon="overlayState.current.data.rankIcon"
            :onClose="Actions.closeOverlay"
        />
        
        <AchievementUnlockModal 
            v-if="overlayState.current?.type === 'achievement'" 
            :achievement="overlayState.current.data"
            :onClose="Actions.closeOverlay"
        />
    </div>
</template>
