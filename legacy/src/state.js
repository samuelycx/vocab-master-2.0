import { reactive, watch } from 'vue';

// Initial State
const initialState = {
    user: {
        level: 1,
        xp: 0,
        streak: 1,
        coins: 100,
        avatar: '🎓'
    },
    game: {
        view: 'welcome', // welcome, dashboard, arena, result
        combo: 0,
        todayLearned: 0,
    }
};

// Load from local storage
const saved = localStorage.getItem('vocab_v2_state');
const state = reactive(saved ? JSON.parse(saved) : initialState);

// RESET VIEW to prevent stuck state
state.game.view = 'welcome';

// Persistence
watch(state, (newVal) => {
    localStorage.setItem('vocab_v2_state', JSON.stringify(newVal));
}, { deep: true });

export const GameState = state;

export const Actions = {
    setView(view) {
        state.game.view = view;
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
    addCoins(amount) {
        state.user.coins += amount;
    },
    resetCombo() {
        state.game.combo = 0;
    },
    incrementCombo() {
        state.game.combo++;
    }
};
