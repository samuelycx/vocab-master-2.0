<script setup>
import { computed, onMounted, watch } from 'vue';
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
import SocialView from '../../components/SocialView.vue';
import UIPreview from '../../components/UIPreview.vue';
import ProfileSetup from '../../components/ProfileSetup.vue';

import { Actions, GameState } from '../../state.js';
import { API } from '../../api.js';
import { GameEngine } from '../../engine.js';

const LOGIN_DEBUG = true;

onMounted(async () => {
  try {
    // Auto-login (Moved from Welcome.vue)
    if (LOGIN_DEBUG) {
      console.log('[LoginDebug] cached user', {
        id: GameState.user.id,
        openid: GameState.user.openid,
        username: GameState.user.username,
        isProfileSet: GameState.user.isProfileSet,
        at: Date.now()
      });
    }

    if (!GameState.user.id) {
      try {
        const res = await API.login();
        if (LOGIN_DEBUG) {
          console.log('[LoginDebug] login response', res);
        }
        if (res && res.success && res.data) {
          Actions.setUser(res.data);
          uni.setStorageSync('vocab_user', JSON.stringify(res.data));
        } else if (res && res.success === false && res.msg) {
          uni.showToast({ title: res.msg, icon: 'none' });
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
watch(() => GameState.game.view, (next, prev) => {
  if (prev !== next) {
    GameEngine.stopAudio();
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
    'preview': UIPreview,
    'profile-setup': ProfileSetup,
    // 移除管理后台入口 - 安全优化
    // 'admin-dashboard': AdminDashboard,

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
        <view :class="['flex-1 relative overflow-hidden', !isGameView ? 'overflow-y-auto pb-6' : 'h-full flex flex-col']">
             <Welcome v-if="currentView === 'welcome' || !views[currentView]" class="min-h-full" />
             <Dashboard v-else-if="currentView === 'dashboard'" class="min-h-full" />
             <Settings v-else-if="currentView === 'settings'" class="min-h-full" />
             <VocabularyList v-else-if="currentView === 'vocabulary'" class="min-h-full" />
             <GameArena v-else-if="currentView === 'arena'" class="min-h-full" />
             <PKArena v-else-if="currentView === 'pk'" class="min-h-full" />
             <Result v-else-if="currentView === 'result'" class="min-h-full" />
             <SocialView v-else-if="currentView === 'social'" class="min-h-full" />
             <AchievementWall v-else-if="currentView === 'achievement-wall'" class="min-h-full" />
             <UIPreview v-else-if="currentView === 'preview'" class="min-h-full" />
             <ProfileSetup v-else-if="currentView === 'profile-setup'" class="min-h-full" />

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
