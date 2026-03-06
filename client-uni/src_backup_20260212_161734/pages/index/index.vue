<script setup>
import { computed, onMounted } from 'vue';
import Welcome from '../../components/Welcome.vue';
import Dashboard from '../../components/Dashboard.vue';
import GameArena from '../../components/GameArena.vue';
import PKArena from '../../components/PKArena.vue';
import Result from '../../components/Result.vue';
import Settings from '../../components/Settings.vue';
import VocabularyList from '../../components/VocabularyList.vue';
import AchievementWall from '../../components/AchievementWall.vue';
import LevelUpModal from '../../components/LevelUpModal.vue';
import AchievementUnlockModal from '../../components/AchievementUnlockModal.vue';
import AdminDashboard from '../../components/AdminDashboard.vue';
import SocialView from '../../components/SocialView.vue';

import { Actions, GameState } from '../../state.js';
import { API } from '../../api.js';

onMounted(async () => {
  try {
    // Auto-login (Moved from Welcome.vue)
    if (!GameState.user.id) {
      const storedUser = uni.getStorageSync('vocab_user');
      const username = 'player_' + Math.floor(Math.random() * 10000);
      let userToLogin = username;
      
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userToLogin = parsed.username || username;
        } catch (e) {
          console.warn('Failed to parse stored user', e);
        }
      }

      try {
        const res = await API.login(userToLogin);
        if (res && res.success && res.data) {
          Actions.setUser(res.data);
          uni.setStorageSync('vocab_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('Auto-login failed', err);
      }
    }

    // Fetch System Configs (Feature Flags)
    try {
      const configs = await API.getSystemConfigs();
      if (configs) {
        Actions.setModules(configs);
      }
    } catch (e) {
      console.warn('Failed to load system configs', e);
    }

    // Refresh stats if user is logged in
    if (GameState.user.id) {
      try {
        const stats = await API.getStats(GameState.user.id);
        if (stats && stats.user) {
          Actions.setUser(stats.user);
        }
      } catch (e) {
        console.warn('Failed to refresh stats', e);
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

};

const viewComponent = computed(() => views[currentView.value] || Welcome);

const isGameView = computed(() => ['arena', 'pk', 'result'].includes(currentView.value));
</script>

<template>
    <view 
        :class="['theme-' + GameState.settings.theme, GameState.settings.darkMode ? 'dark' : '', 'h-screen w-full flex flex-col relative bg-background text-text-main font-body overflow-hidden']"
        :style="{ 
            '--status-bar-height': GameState.systemLayout.statusBarHeight + 'px',
            '--nav-bar-height': GameState.systemLayout.navigationBarHeight + 'px',
            '--header-height': (GameState.systemLayout.statusBarHeight + GameState.systemLayout.navigationBarHeight) + 'px'
        }"
    >
        
        <!-- Dynamic View -->
        <view :class="['flex-1 relative overflow-hidden', !isGameView ? 'overflow-y-auto pb-24' : 'h-full flex flex-col']">
             <Welcome v-if="currentView === 'welcome' || !views[currentView]" class="min-h-full" />
             <Dashboard v-else-if="currentView === 'dashboard'" class="min-h-full" />
             <Settings v-else-if="currentView === 'settings'" class="min-h-full" />
             <VocabularyList v-else-if="currentView === 'vocabulary'" class="min-h-full" />
             <GameArena v-else-if="currentView === 'arena'" class="min-h-full" />
             <PKArena v-else-if="currentView === 'pk'" class="min-h-full" />
             <Result v-else-if="currentView === 'result'" class="min-h-full" />
             <SocialView v-else-if="currentView === 'social'" class="min-h-full" />
             <AchievementWall v-else-if="currentView === 'achievement-wall'" class="min-h-full" />
             <AdminDashboard v-else-if="currentView === 'admin-dashboard'" class="min-h-full" />

        </view>

        <!-- Bottom Navigation Bar (Fixed) -->
        <view v-if="!isGameView" class="absolute bottom-0 w-full h-20 bg-surface border-t border-slate-100 dark_border-white-opacity-5
 flex justify-around items-center z-40 pb-2">
            <button @click="Actions.setView('dashboard')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'dashboard' ? 'text-primary' : 'text-slate-400'">
                <text class="text-2xl group-active_scale-95 transition-transform" :class="currentView === 'dashboard' ? 'filled' : ''">🏠</text>
                <text class="text-xxs font-bold">首页</text>
            </button>
            <button @click="Actions.setView('vocabulary')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'vocabulary' ? 'text-primary' : 'text-slate-400'">
                <text class="text-2xl group-active_scale-95 transition-transform">📖</text>
                 <text class="text-xxs font-bold">词库</text>
            </button>
             <button @click="Actions.setView('pk')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'pk' ? 'text-primary' : 'text-slate-400'">
                <text class="text-2xl group-active_scale-95 transition-transform">⚔️</text>
                 <text class="text-xxs font-bold">竞技</text>
            </button>
            <button @click="Actions.setView('social')" class="flex flex-col items-center gap-1 w-16 group" :class="currentView === 'social' ? 'text-primary' : 'text-slate-400'">
                <text class="text-2xl group-active_scale-95 transition-transform">📊</text>
                 <text class="text-xxs font-bold">排行</text>
            </button>
        </view>

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
    </view>
</template>
