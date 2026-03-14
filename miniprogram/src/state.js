import { reactive, watch } from 'vue';

// Initial State
const initialState = {
    user: {
        id: null,
        username: 'Guest',
        level: 1,
        xp: 0,
        streak: 1,
        coins: 100,
        avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        isProfileSet: true,
        openid: null,
        isLoggedIn: false
    },
    game: {
        view: 'dashboard', // welcome, dashboard, settings, arena, result, social, category_selection
        combo: 0,
        todayLearned: 0,
        lastSession: null, // { xp, coins, correct, total }
        categoryStats: {},
        pk: {
            mode: 'bot',
            isSearching: false,
            opponent: null,
            userScore: 0,
            opponentScore: 0,
            inviteCode: null,
        },
        social: {
            feed: [],
            following: [],
            followers: [],
            loading: false,
            activeTab: 'feed'
        }
    },
    system: {
        achievements: [],
        modules: {
            pk_arena_enabled: true
        }
    },
    settings: {
        soundEnabled: uni.getStorageSync('vocab_sound') !== 'false',
        theme: uni.getStorageSync('vocab_theme_v2') || 'academic',
        language: uni.getStorageSync('vocab_lang') || 'zh-CN',
        darkMode: false
    },
    systemLayout: {
        statusBarHeight: 0,
        navigationBarHeight: 44, // Default
        safeAreaTop: 0
    },
    overlay: { current: null, queue: [] }
};

// Initialize system layout
try {
    // 使用新API替代废弃的getSystemInfoSync
    const deviceInfo = uni.getDeviceInfo()
    const windowInfo = uni.getWindowInfo()
    const appBaseInfo = uni.getAppBaseInfo()
    
    initialState.systemLayout.statusBarHeight = windowInfo.statusBarHeight || 0;
    initialState.systemLayout.safeAreaTop = windowInfo.safeArea ? windowInfo.safeArea.top : windowInfo.statusBarHeight;

    // Calculate navigation bar height (usually capsule button info is better)
    if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
        const menuButton = uni.getMenuButtonBoundingClientRect();
        initialState.systemLayout.navigationBarHeight = (menuButton.top - windowInfo.statusBarHeight) * 2 + menuButton.height;
    }
} catch (e) {
    console.warn('Failed to get system info', e);
}

// Load from local storage
const saved = uni.getStorageSync('vocab_v2_state');
let parsed = initialState;
try {
    if (saved) {
        parsed = JSON.parse(saved);
    }
} catch (e) {
    console.error('Failed to parse saved state, resetting to initial', e);
    parsed = initialState;
}

// Migration: Ensure new state properties exist
if (!parsed.overlay) parsed.overlay = { ...initialState.overlay };
if (!parsed.system) parsed.system = { ...initialState.system };
if (!parsed.settings) parsed.settings = { ...initialState.settings };
if (!parsed.game) parsed.game = { ...initialState.game };
if (!parsed.user) parsed.user = { ...initialState.user };
parsed.systemLayout = { ...initialState.systemLayout }; // Always fresh from hardware

parsed.settings = { ...initialState.settings, ...parsed.settings };
parsed.user = { ...initialState.user, ...parsed.user };

if (!parsed.game.social) {
    parsed.game.social = { ...initialState.game.social };
} else {
    parsed.game.social = { ...initialState.game.social, ...parsed.game.social };
}

const state = reactive(parsed);

state.game.view = 'dashboard';

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

watch(() => state.user, debounce((newVal) => {
    try {
        uni.setStorageSync('vocab_user', JSON.stringify(newVal));
    } catch (e) {
        console.error('Failed to save user state', e);
    }
}, 500), { deep: true });

watch(() => state.settings, debounce((newVal) => {
    try {
        uni.setStorageSync('vocab_settings', JSON.stringify(newVal));
    } catch (e) {
        console.error('Failed to save settings', e);
    }
}, 500), { deep: true });

watch(() => state.settings.theme, (newTheme) => {
    uni.setStorageSync('vocab_theme_v2', newTheme);
}, { immediate: true });

watch(() => state.settings.soundEnabled, (enabled) => {
    uni.setStorageSync('vocab_sound', String(enabled));
});

watch(() => state.settings.language, (language) => {
    uni.setStorageSync('vocab_lang', language || 'zh-CN');
});

export const GameState = state;

export const Actions = {
    updateSettings(key, value) {
        state.settings[key] = value;
    },
    setView(view) {
        state.game.view = view;
    },
    setSocialTab(tab) {
        state.game.social.activeTab = tab;
    },
    addXP(amount) {
        state.user.xp += amount;
        if (state.user.xp >= state.user.level * 100) {
            state.user.level++;
            state.user.xp = 0;
            return true;
        }
        return false;
    },
    setModules(modules) {
        state.system.modules = modules;
    },
    setUser(userData) {
        Object.assign(state.user, userData);
        if (userData && Object.prototype.hasOwnProperty.call(userData, 'isLoggedIn')) {
            state.user.isLoggedIn = Boolean(userData.isLoggedIn);
        }
    },
    clearUser() {
        Object.assign(state.user, initialState.user);
    },
    setLogin(isLoggedIn) {
        state.user.isLoggedIn = Boolean(isLoggedIn);
    },
    addCoins(amount) {
        state.user.coins += amount;
    },
    resetCombo() {
        state.game.combo = 0;
    },
    incrementCombo() {
        state.game.combo++;
    },
    setLastSession(data) {
        state.game.lastSession = data;
    },
    initPK(opponentName, avatar) {
        state.game.pk = {
            isActive: true,
            opponent: { name: opponentName || 'AI Challenger', avatar: avatar || 'BOT', score: 0 },
            userScore: 0,
            round: 0,
            winner: null
        };
    },
    updatePKScore(isUser, points) {
        if (isUser) {
            state.game.pk.userScore += points;
        } else {
            state.game.pk.opponent.score += points;
        }
    },
    endPK(winner, reason) {
        state.game.pk.isActive = false;
        state.game.pk.winner = winner;
        state.game.pk.endReason = reason;
    },
    showOverlay(type, data) {
        state.overlay.queue.push({ type, data });
        if (!state.overlay.current) {
            Actions.processOverlayQueue();
        }
    },
    closeOverlay() {
        state.overlay.current = null;
        setTimeout(() => {
            Actions.processOverlayQueue();
        }, 100);
    },
    processOverlayQueue() {
        if (state.overlay.queue.length > 0) {
            state.overlay.current = state.overlay.queue.shift();
        }
    },
    reset() {
        Object.assign(state.user, initialState.user);
        Object.assign(state.game, initialState.game);
        state.system.achievements = [];
        state.game.view = 'dashboard';
        uni.removeStorageSync('vocab_v2_state');
        uni.removeStorageSync('vocab_theme');
        uni.removeStorageSync('vocab_sound');
    }
};
