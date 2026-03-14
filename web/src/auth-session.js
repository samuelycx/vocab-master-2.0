import { API } from './api.js';
import { Actions } from './state.js';

const TOKEN_KEY = 'vocab_token';

function applyAuthenticatedSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    Actions.setAuthToken(token);
    Actions.setAuthStatus('authenticated');
    Actions.setUser(user);
    Actions.setView('dashboard');
}

function clearPersistedSession() {
    localStorage.removeItem(TOKEN_KEY);
    Actions.clearAuth();
}

export const AuthSession = {
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    async restoreSession() {
        const token = this.getToken();
        if (!token) {
            Actions.clearAuth();
            Actions.setView('auth');
            return false;
        }

        const result = await API.getCurrentUser(token);
        if (!result?.success || !result.user) {
            clearPersistedSession();
            Actions.setView('auth');
            return false;
        }

        applyAuthenticatedSession(token, result.user);
        return true;
    },

    async login({ username, password }) {
        const result = await API.loginWithPassword(username, password);
        if (result?.success && result.token && result.user) {
            applyAuthenticatedSession(result.token, result.user);
            return result;
        }

        Actions.setAuthStatus('anonymous');
        return result || { success: false, message: 'Login failed' };
    },

    async register({ username, password }) {
        const result = await API.registerWithPassword(username, password);
        if (result?.success && result.token && result.user) {
            applyAuthenticatedSession(result.token, result.user);
            return result;
        }

        Actions.setAuthStatus('anonymous');
        return result || { success: false, message: 'Register failed' };
    },

    async logout() {
        const token = this.getToken();
        if (token) {
            try {
                await API.logout(token);
            } catch (error) {
                console.error('Logout failed', error);
            }
        }

        clearPersistedSession();
        Actions.reset();
        Actions.setView('auth');
    }
};
