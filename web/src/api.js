import { Actions } from './state.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getStoredToken() {
    return localStorage.getItem('vocab_token');
}

async function requestJSON(path, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {})
    };
    const token = options.token ?? getStoredToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    if (!response.ok) {
        if (response.status === 401 && token) {
            localStorage.removeItem('vocab_token');
            Actions.clearAuth();
            Actions.setView('auth');
        }
        return {
            success: false,
            status: response.status,
            ...data,
        };
    }

    return data;
}

export const API = {
    async getSessionWords(count = 10, category = 'GENERAL') {
        try {
            const data = await requestJSON(`/words/session?count=${count}${category ? `&category=${category}` : ''}`, {
                method: 'GET',
            });
            return data?.data?.words || [];
        } catch (e) {
            console.error('Failed to fetch words', e);
            return [];
        }
    },

    async updateCategory(category) {
        try {
            const res = await requestJSON(`/progress/set-category`, {
                method: 'POST',
                body: JSON.stringify({ category })
            });
            return res;
        } catch (e) {
            console.error('Failed to update category', e);
            return null;
        }
    },

    async getReviews() {
        try {
            return await requestJSON('/word/review', { method: 'GET' });
        } catch (e) {
            console.error('Failed to fetch reviews', e);
            return [];
        }
    },

    async getReviewCount() {
        try {
            const res = await requestJSON('/progress/reviews', { method: 'GET' });
            return res?.data?.total ?? 0;
        } catch (e) {
            console.error('Failed to fetch review count', e);
            return 0;
        }
    },

    async getMistakes() {
        try {
            return await requestJSON('/word/mistakes', { method: 'GET' });
        } catch (e) {
            console.error('Failed to fetch mistakes', e);
            return [];
        }
    },

    async getLearnedWords(page = 1, limit = 20, search = '') {
        try {
            return await requestJSON(`/word/learned?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
                method: 'GET',
            });
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async loginWithPassword(username, password) {
        try {
            return await requestJSON('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        } catch (e) {
            console.error('Login failed', e);
            return { success: false, error: e.message };
        }
    },

    async registerWithPassword(username, password) {
        try {
            return await requestJSON('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        } catch (e) {
            console.error('Register failed', e);
            return { success: false, error: e.message };
        }
    },

    async getCurrentUser(token) {
        try {
            return await requestJSON('/auth/me', {
                method: 'GET',
                token,
            });
        } catch (e) {
            console.error('Get current user failed', e);
            return { success: false, error: e.message };
        }
    },

    async logout(token) {
        try {
            return await requestJSON('/auth/logout', {
                method: 'POST',
                token,
            });
        } catch (e) {
            console.error('Logout failed', e);
            return { success: false, error: e.message };
        }
    },

    async updateProfile(payload) {
        try {
            return await requestJSON('/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
        } catch (e) {
            console.error('Update profile failed', e);
            return { success: false, error: e.message };
        }
    },

    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            return await requestJSON('/auth/avatar', {
                method: 'POST',
                body: formData,
            });
        } catch (e) {
            console.error('Upload avatar failed', e);
            return { success: false, error: e.message };
        }
    },

    async syncProgress(wordId, status, xp = 0, coins = 0, mode = 'learn') {
        try {
            const res = await requestJSON(`/progress/sync`, {
                method: 'POST',
                body: JSON.stringify({
                    wordId,
                    status,
                    xpGained: xp,
                    coinsGained: coins,
                    mode
                })
            });
            return res;
        } catch (e) {
            console.error('Sync failed', e);
            return null;
        }
    },

    async getStats() {
        try {
            const res = await requestJSON('/progress/stats', { method: 'GET' });
            return res?.data || null;
        } catch (e) {
            console.error('Failed to get stats', e);
            return null;
        }
    },

    async getAchievements() {
        // Mock or real endpoint. For now we might need a new endpoint or embed in stats.
        // Let's assume we fetch all definitions from a new endpoint.
        // But for speed, let's hardcode the definitions on client or fetch them.
        // Let's create a simple endpoint for definitions in backend if needed, 
        // or just hardcode visually in frontend?
        // Better to fetch. Let's add getAchievements to API.
        try {
            return await requestJSON('/progress/achievements', { method: 'GET' });
        } catch (e) {
            return [];
        }
    },



    // --- System API ---
    async getSystemConfigs() {
        try {
            return await requestJSON('/config', { method: 'GET', token: null });
        } catch (e) {
            console.error('Failed to load configs', e);
            return { pk_arena_enabled: true }; // Default fallback
        }
    },

    // --- Admin API ---
    async createWord(wordData) {
        try {
            const res = await requestJSON('/admin/word', {
                method: 'POST',
                body: JSON.stringify(wordData)
            });
            return res?.success === false ? null : res;
        } catch (e) {
            console.error('Failed to create word', e);
            return null;
        }
    },

    async deleteWord(wordId) {
        try {
            const res = await requestJSON(`/admin/word/${wordId}`, {
                method: 'DELETE'
            });
            return res?.success === false ? null : res;
        } catch (e) {
            console.error('Failed to delete word', e);
            return null;
        }
    },

    async toggleModule(key, enabled) {
        try {
            const res = await requestJSON('/admin/module/toggle', {
                method: 'POST',
                body: JSON.stringify({ key, enabled })
            });
            return res?.success === false ? null : res;
        } catch (e) {
            console.error('Failed to toggle module', e);
            return null;
        }
    },

    async getUsers() {
        try {
            const res = await requestJSON('/admin/users', { method: 'GET' });
            return Array.isArray(res) ? res : [];
        } catch (e) {
            console.error('Failed to get users', e);
            return [];
        }
    },

    async setUserCategory(userId, category) {
        try {
            const res = await requestJSON(`/admin/set-category`, {
                method: 'POST',
                body: JSON.stringify({ userId, category })
            });
            return res;
        } catch (e) {
            console.error('Failed to set category', e);
            return null;
        }
    },

    async banUser(userId) {
        try {
            const res = await requestJSON(`/admin/user/${userId}/ban`, {
                method: 'POST'
            });
            return res?.success === false ? null : res;
        } catch (e) {
            console.error('Failed to ban user', e);
            return null;
        }
    },

    async resetProgress() {
        try {
            const res = await requestJSON(`/progress/reset`, {
                method: 'POST',
            });
            return res;
        } catch (e) {
            console.error('Reset failed', e);
            return null;
        }
    },
    async importWords(words) {
        try {
            const res = await requestJSON('/admin/words/import', {
                method: 'POST',
                body: JSON.stringify(words)
            });
            return res?.success === false ? null : res;
        } catch (e) {
            console.error('Failed to import words', e);
            return null;
        }
    },

    async exportWords() {
        try {
            const res = await requestJSON('/admin/words/export', { method: 'GET' });
            return Array.isArray(res) ? res : null;
        } catch (e) {
            console.error('Failed to export words', e);
            return null;
        }
    },

    // --- Social API ---
    async getSocialFeed() {
        try {
            return await requestJSON('/social/feed', { method: 'GET' });
        } catch (e) {
            console.error('Failed to fetch social feed', e);
            return [];
        }
    },

    async getLeaderboard() {
        try {
            const res = await requestJSON('/leaderboard', { method: 'GET', token: null });
            return res?.data?.entries || [];
        } catch (e) {
            console.error('Failed to fetch leaderboard', e);
            return [];
        }
    },

    async getFriends() {
        try {
            return await requestJSON('/social/friends', { method: 'GET' });
        } catch (e) {
            console.error('Failed to fetch friends', e);
            return { following: [], followers: [] };
        }
    },

    async followUser(followingId) {
        try {
            const res = await requestJSON(`/social/follow`, {
                method: 'POST',
                body: JSON.stringify({ followingId })
            });
            return res;
        } catch (e) {
            console.error('Failed to follow user', e);
            return null;
        }
    },

    async unfollowUser(followingId) {
        try {
            const res = await requestJSON(`/social/unfollow`, {
                method: 'POST',
                body: JSON.stringify({ followingId })
            });
            return res;
        } catch (e) {
            console.error('Failed to unfollow user', e);
            return null;
        }
    },

    async searchUsers(query) {
        try {
            return await requestJSON(`/social/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
            });
        } catch (e) {
            console.error('Failed to search users', e);
            return [];
        }
    }
};
