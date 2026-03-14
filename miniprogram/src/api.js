// WeChat Cloud Development API Client
// This replaces the REST-based api.js to use Cloud Functions

import { DEFAULT_LEARN_COUNT } from './constants.js';

const callCloud = async (name, type, data = {}) => {
    try {
        if (typeof wx === 'undefined' || !wx.cloud) {
            console.error('wx.cloud not found - are you on WeChat Simulator?');
            return { success: false, code: 'CLOUD_NOT_READY', msg: 'Cloud not ready' };
        }

        const res = await wx.cloud.callFunction({
            name,
            data: { type, data }
        });

        if (res.result && res.result.success !== undefined) {
            const code = res.result.code || (res.result.success ? 'OK' : 'UNKNOWN_ERROR');
            const msg = res.result.msg || res.result.error || (res.result.success ? '' : 'Request failed');
            return { ...res.result, code, msg };
        }
        return { success: true, code: 'OK', msg: '', data: res.result };
    } catch (e) {
        console.error(`Cloud Function [${name}.${type}] Error:`, e);
        return { success: false, code: 'REQUEST_ERROR', msg: e.message, error: e.message };
    }
};

export const API = {
    // --- Word API ---
    async getSessionWords(count = DEFAULT_LEARN_COUNT) {
        if (typeof console !== 'undefined') {
            console.log('[CountDebug] getSessionWords request', { count });
        }
        const res = await callCloud('words', 'getSessionWords', { count });
        if (typeof console !== 'undefined') {
            console.log('[CountDebug] getSessionWords response', {
                success: res?.success,
                size: Array.isArray(res?.data) ? res.data.length : 0,
                total: res?.total,
                requested: res?.requested,
                sampled: res?.sampled
            });
        }
        return res.success ? res.data : [];
    },

    async searchWords(query) {
        const res = await callCloud('words', 'searchWords', { query });
        return res.success ? res.data : [];
    },

    async getReviews(userId) {
        const res = await callCloud('progress', 'getReviews', { limit: 20 });
        return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async getMistakes(userId) {
        const res = await callCloud('progress', 'getMistakes', { limit: 20 });
        return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async getLearnedWords(userId, page = 1, limit = 20, search = '') {
        const res = await callCloud('progress', 'getLearnedWords', { page, limit, search });
        return {
            data: res.success && Array.isArray(res.data) ? res.data : [],
            lastPage: res.lastPage || 1,
            total: Number(res.total) || 0
        };
    },

    // --- Auth API ---
    async login() {
        // In Cloud mode, we strictly use openid retrieved by the cloud context
        // 获取设备信息用于设备绑定（使用新API）
        const deviceInfo = wx.getDeviceInfo()
        const windowInfo = wx.getWindowInfo()
        const appBaseInfo = wx.getAppBaseInfo()
        
        const combinedInfo = {
            model: deviceInfo.model,
            system: deviceInfo.system,
            platform: deviceInfo.platform,
            SDKVersion: appBaseInfo.SDKVersion,
            windowWidth: windowInfo.windowWidth,
            windowHeight: windowInfo.windowHeight
        }
        
        return await callCloud('auth', 'login', { deviceInfo: combinedInfo });
    },

    async updateProfile({ username, avatar }) {
        return await callCloud('auth', 'updateProfile', { username, avatar });
    },

    // --- Admin API ---
    async fillPhonetics(limit = 500) {
        return await callCloud('admin', 'fillPhonetics', { limit });
    },

    // --- Progress API ---
    async syncProgress(userId, wordId, status, xp = 0, coins = 0, maxCombo = 0) {
        return await callCloud('progress', 'syncProgress', {
            wordId,
            status,
            xp,
            coins,
            maxCombo
        });
    },

    async getStats(userId) {
        const res = await callCloud('progress', 'getStats');
        if (!res.success) return null;
        // Normalize shape for existing UI callers.
        if (res.data && res.data.user) return res.data;
        return { user: res.data };
    },

    async getAchievements() {
        const res = await callCloud('progress', 'getAchievements');
        return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async getSystemConfigs() {
        return {
            pk_arena_enabled: true,
            version: '2.0-cloud'
        };
    },

    // --- Social API ---
    async getLeaderboard() {
        const res = await callCloud('progress', 'getLeaderboard', { limit: 20 });
        return res.success && Array.isArray(res.data) ? res.data : [];
    },

    async searchUsers(query) {
        return [];
    },

    async resetProgress() {
        return await callCloud('progress', 'resetProgress', {});
    },

    async updateCategory(userId, category) {
        console.log('Category system removed, skipping update');
        return true;
    },

    async getSocialFeed(userId) {
        const res = await callCloud('progress', 'getSocialFeed', { limit: 20 });
        return res.success && Array.isArray(res.data) ? res.data : [];
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
    },

    async normalizeWords(limit = 2000) {
        return await callCloud('admin', 'normalizeWords', { limit });
    }
};
