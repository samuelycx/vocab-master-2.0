// WeChat Cloud Development API Client
// This replaces the REST-based api.js to use Cloud Functions

const callCloud = async (name, type, data = {}) => {
    try {
        if (typeof wx === 'undefined' || !wx.cloud) {
            console.error('wx.cloud not found - are you on WeChat Simulator?');
            return { success: false, msg: 'Cloud not ready' };
        }

        const res = await wx.cloud.callFunction({
            name,
            data: { type, data }
        });

        if (res.result && res.result.success !== undefined) {
            return res.result;
        }
        return { success: true, data: res.result };
    } catch (e) {
        console.error(`Cloud Function [${name}.${type}] Error:`, e);
        return { success: false, error: e.message };
    }
};

export const API = {
    // --- Word API ---
    async getSessionWords(count = 10) {
        const res = await callCloud('words', 'getSessionWords', { count });
        return res.success ? res.data : [];
    },

    async searchWords(query) {
        const res = await callCloud('words', 'searchWords', { query });
        return res.success ? res.data : [];
    },

    async getReviews(userId) {
        // Implement in cloud later if needed
        return [];
    },

    async getMistakes(userId) {
        // Implement in cloud later if needed
        return [];
    },

    async getLearnedWords(userId, page = 1, limit = 20, search = '') {
        const res = await callCloud('progress', 'getLearnedWords', { page, limit, search });
        return {
            data: res.success && Array.isArray(res.data) ? res.data : [],
            lastPage: res.lastPage || 1
        };
    },

    // --- Auth API ---
    async login() {
        // In Cloud mode, we strictly use openid retrieved by the cloud context
        return await callCloud('auth', 'login');
    },

    // --- Progress API ---
    async syncProgress(userId, wordId, status, xp = 0, coins = 0) {
        return await callCloud('progress', 'syncProgress', {
            wordId,
            status,
            xp,
            coins
        });
    },

    async getStats(userId) {
        const res = await callCloud('progress', 'getStats');
        return res.success ? res.data : null;
    },

    async getAchievements() {
        // Static for now or fetch from DB
        return [];
    },

    async getSystemConfigs() {
        return {
            pk_arena_enabled: true,
            version: '2.0-cloud'
        };
    },

    // --- Social API ---
    async getLeaderboard() {
        // Implement in progress or social CF
        const res = await callCloud('progress', 'getStats'); // Placeholder or specific leaderboard CF
        return [];
    },

    async searchUsers(query) {
        return [];
    },

    async resetProgress(userId) {
        return { success: true };
    },

    async updateCategory(userId, category) {
        console.log('Category system removed, skipping update');
        return true;
    },

    async getSocialFeed(userId) {
        return [];
    },

    async getFriends(userId) {
        return { following: [], followers: [] };
    },

    async followUser(userId, targetId) {
        console.log(`User ${userId} following ${targetId}`);
        return { success: true };
    },

    async unfollowUser(userId, targetId) {
        console.log(`User ${userId} unfollowing ${targetId}`);
        return { success: true };
    },

    async createWord(payload) {
        const res = await callCloud('admin', 'createWord', payload);
        return res.success;
    },

    async getUsers() {
        const res = await callCloud('admin', 'getUsers');
        return res.success ? res.data : [];
    },

    async banUser(userId) {
        const res = await callCloud('admin', 'banUser', { userId });
        return res.success;
    },

    async setCategory(userId, category) {
        const res = await callCloud('admin', 'setCategory', { userId, category });
        return res.success;
    },

    async toggleModule(key, enabled) {
        const res = await callCloud('admin', 'toggleModule', { key, enabled });
        return res.success;
    }
};
