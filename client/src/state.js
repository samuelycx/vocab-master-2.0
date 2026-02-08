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
        avatar: '🎓'
    },
    game: {
        view: 'dashboard', // welcome, dashboard, settings, arena, result, social, category_selection
        combo: 0,
        todayLearned: 0,
        lastSession: null, // { xp, coins, correct, total }
        categoryStats: {}, // NEW
        pk: {
            mode: 'bot', // bot, online, private
            isSearching: false,
            opponent: null,
            userScore: 0,
            opponentScore: 0,
            inviteCode: null, // NEW
        },
        social: { // NEW
            feed: [],
            following: [],
            followers: [],
            loading: false,
            activeTab: 'feed'
        }
    },
    system: {
        achievements: [], // Loaded from backend
        modules: { // NEW: Feature flags
            pk_arena_enabled: true
        }
    },
    settings: {
        soundEnabled: localStorage.getItem('vocab_sound') !== 'false', // Default true
        theme: localStorage.getItem('vocab_theme_v2') || 'default', // default, playful, dark
        darkMode: false // Deprecated but kept for compatibility logic if needed
    },
    overlay: { current: null, queue: [] } // { type: 'levelUp' | 'achievement', data: ... }
};

// Load from local storage
const saved = localStorage.getItem('vocab_v2_state');
let parsed = saved ? JSON.parse(saved) : initialState;

// Migration: Ensure new state properties exist
if (!parsed.overlay) parsed.overlay = { ...initialState.overlay };
if (!parsed.system) parsed.system = { ...initialState.system };
if (!parsed.settings) parsed.settings = { ...initialState.settings };

if (!parsed.game) parsed.game = { ...initialState.game };

// Ensure detailed settings exist
parsed.settings = { ...initialState.settings, ...parsed.settings };

// Ensure social state exists (Migration)
if (!parsed.game.social) {
    parsed.game.social = { ...initialState.game.social };
} else {
    parsed.game.social = { ...initialState.game.social, ...parsed.game.social };
}

const state = reactive(parsed);

// RESET VIEW to prevent stuck state
state.game.view = 'dashboard';

// Simple debounce utility
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Persist User State with debounce and try-catch
watch(() => state.user, debounce((newVal) => {
    try {
        localStorage.setItem('vocab_user', JSON.stringify(newVal));
    } catch (e) {
        console.error('Failed to save user state', e);
    }
}, 500), { deep: true });

// Persist Settings with debounce and try-catch
watch(() => state.settings, debounce((newVal) => {
    try {
        localStorage.setItem('vocab_settings', JSON.stringify(newVal));
    } catch (e) {
        console.error('Failed to save settings', e);
    }
}, 500), { deep: true });

// Theme Watcher
watch(() => state.settings.theme, (newTheme) => {
    // Remove all previous theme attributes
    document.documentElement.removeAttribute('data-theme');

    localStorage.setItem('vocab_theme_v2', newTheme);

    // Dynamically apply any theme as a data-theme attribute
    if (newTheme && newTheme !== 'default') {
        document.documentElement.setAttribute('data-theme', newTheme);
    }
}, { immediate: true });

// Sound Watcher
watch(() => state.settings.soundEnabled, (enabled) => {
    localStorage.setItem('vocab_sound', String(enabled));
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
        // Simple level up logic: level * 100
        if (state.user.xp >= state.user.level * 100) {
            state.user.level++;
            state.user.xp = 0; // Carry over logic omitted for brevity
            return true; // Leveled up
        }
        return false;
    },
    setModules(modules) {
        state.system.modules = modules;
    },
    setUser(userData) {
        // Merge provided userData into state.user
        // state.user = { ...state.user, ...userData }; // This might lose reactivity if replacing object? 
        // Better to assign properties
        Object.assign(state.user, userData);
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
            opponent: { name: opponentName || 'AI Challenger', avatar: avatar || '🤖', score: 0 },
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
        state.game.pk.endReason = reason; // 'score_limit', 'disconnect'
    },
    showOverlay(type, data) {
        state.overlay.queue.push({ type, data });
        if (!state.overlay.current) {
            this.processOverlayQueue();
        }
    },
    closeOverlay() {
        state.overlay.current = null;
        setTimeout(() => {
            this.processOverlayQueue();
        }, 100);
    },
    processOverlayQueue() {
        if (state.overlay.queue.length > 0) {
            state.overlay.current = state.overlay.queue.shift();
        }
    },
    reset() {
        // Restore user to initial state
        Object.assign(state.user, initialState.user);

        // Restore game state
        Object.assign(state.game, initialState.game);

        // Clear system achievements (they will be re-fetched on dashboard mount)
        state.system.achievements = [];

        // Reset view
        state.game.view = 'dashboard';

        // Explicitly clear local storage to be sure
        localStorage.removeItem('vocab_v2_state');
        localStorage.removeItem('vocab_theme');
        localStorage.removeItem('vocab_sound');

        // The watch(state) will eventually trigger but clearing first is safer
    }
};
