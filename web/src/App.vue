<script setup>
import { computed, onMounted, ref } from 'vue';
import AuthView from './components/AuthView.vue';
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
import { AuthSession } from './auth-session.js';

const booting = ref(true);
onMounted(async () => {
  try {
      const restored = await AuthSession.restoreSession();
      if (!restored) {
          Actions.setView('auth');
      }

      // Fetch System Configs (Feature Flags)
      const configs = await API.getSystemConfigs();
      if (configs) {
          Actions.setModules(configs);
      }

      // Refresh stats if user is logged in
      if (GameState.user.id) {
          const stats = await API.getStats();
          if (stats && stats.user) {
              Actions.setUser(stats.user);
          }
      }
  } catch (e) {
      console.error('App initialization failed', e);
  } finally {
      booting.value = false;
  }
});
const currentView = computed(() => GameState.game.view);
const overlayState = computed(() => GameState.overlay || { current: null, queue: [] });

const views = {
    'auth': AuthView,
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
const showBottomNav = computed(() => !isGameView.value && !['auth', 'welcome'].includes(currentView.value));
</script>

<template>
    <div class="app-shell">
        <div v-if="booting" class="flex-1 flex items-center justify-center">
            <div class="text-center space-y-3">
                <div class="mx-auto h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <p class="text-sm font-bold text-text-muted">正在恢复登录状态...</p>
            </div>
        </div>
        
        <!-- Dynamic View -->
        <div v-else class="view-viewport">
             <transition 
                enter-active-class="transition duration-300 ease-out" 
                enter-from-class="transform translate-y-4 opacity-0" 
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in" 
                leave-from-class="transform translate-y-0 opacity-100" 
                leave-to-class="transform -translate-y-4 opacity-0"
                mode="out-in"
            >
                <component :is="viewComponent" class="view-screen" />
            </transition>
        </div>

        <!-- Bottom Navigation Bar (Fixed) -->
        <nav v-if="showBottomNav" class="bottom-nav">
            <button @click="Actions.setView('dashboard')" class="nav-btn" :class="{ active: currentView === 'dashboard' }">
                <span class="nav-icon">⌂</span>
                <span class="nav-label">首页</span>
            </button>
            <button @click="Actions.setView('vocabulary')" class="nav-btn" :class="{ active: currentView === 'category-selection' || currentView === 'vocabulary' }">
                <span class="nav-icon">📘</span>
                <span class="nav-label">词库</span>
            </button>
             <button @click="Actions.setView('pk')" class="nav-btn" :class="{ active: currentView === 'pk' }">
                <span class="nav-icon">⚔️</span>
                <span class="nav-label">竞技</span>
            </button>
            <button @click="Actions.setView('social')" class="nav-btn" :class="{ active: currentView === 'social' }">
                <span class="nav-icon">🏆</span>
                <span class="nav-label">排行</span>
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

<style scoped>
.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f6f1e8;
  color: #111827;
}

.view-viewport {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 96px;
}

.view-screen {
  min-height: 100%;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
}

.bottom-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: min(calc(100% - 32px), 398px);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  z-index: 40;
  min-height: 74px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 40px rgba(17, 17, 17, 0.08);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  padding: 10px 8px;
  backdrop-filter: blur(10px);
}

.nav-btn {
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #a1a1aa;
}

.nav-btn.active {
  color: #6f58d9;
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 11px;
  font-weight: 700;
}
</style>
