// WeChat Cloud Development API Client
// All mini program requests go through cloud functions or cloud storage.

import { DEFAULT_LEARN_COUNT } from './constants.js';
import { mergeUserState } from './utils/user-snapshot.js';
import { normalizeLeaderboardEntries } from './utils/leaderboard.js';
import { buildProfileSavePlan } from './utils/profile-save.js';

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

const normalizeAuthResponse = (res) => {
    if (!res?.success || !res.data) {
        return res;
    }
    return {
        ...res,
        data: mergeUserState({}, res.data)
    };
};

const uploadAvatarToCloud = async (filePath) => {
    if (!filePath) return '';
    if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.uploadFile !== 'function') {
        throw new Error('Cloud upload not available');
    }

    const ext = filePath.includes('.') ? filePath.slice(filePath.lastIndexOf('.')) : '.png';
    const cloudPath = `avatars/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath
    });

    return res?.fileID || '';
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

    async getReviewCount(userId) {
        const res = await callCloud('progress', 'getReviewCount');
        if (!res.success) return 0;

        if (typeof res.data === 'number') {
            return Math.max(0, Number(res.data) || 0);
        }

        const total = Number(res.data?.total ?? res.total);
        return Number.isFinite(total) && total >= 0 ? Math.floor(total) : 0;
    },

    async getReviewSession(userId, limit = 30) {
        const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 30));
        const res = await callCloud('progress', 'getReviewSession', { limit: safeLimit });
        if (res.success && Array.isArray(res.data)) {
            return res.data;
        }

        if (res.success && Array.isArray(res.data?.items)) {
            return res.data.items;
        }

        return [];
    },

    async getReviews(userId) {
        // Backward-compatible alias while callers migrate to getReviewSession.
        return this.getReviewSession(userId, 20);
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
        
        return normalizeAuthResponse(await callCloud('auth', 'login', { deviceInfo: combinedInfo }));
    },

    async updateProfile({ username, avatar, currentProfile = {} } = {}) {
        const nextAvatar = avatar || currentProfile.avatar || '';
        const nextUsername = username || currentProfile.username || currentProfile.nickname || '';
        const nextProfile = { username: nextUsername, avatar: nextAvatar };
        let savePlan = buildProfileSavePlan({ currentProfile, nextProfile });
        if (!savePlan.validation.ok) {
            return {
                success: false,
                code: savePlan.validation.errors[0]?.code || 'INVALID_PROFILE',
                msg: '请输入有效昵称'
            };
        }

        let uploadedAvatar = '';
        if (savePlan.upload.required) {
            try {
                uploadedAvatar = await uploadAvatarToCloud(savePlan.upload.filePath);
            } catch (e) {
                console.error('avatar upload failed', e);
                return {
                    success: false,
                    code: 'AVATAR_UPLOAD_FAILED',
                    msg: '头像上传失败',
                    error: e.message
                };
            }

            savePlan = buildProfileSavePlan({
                currentProfile,
                nextProfile,
                uploadedAvatar
            });
        }

        if (!savePlan.write.allowed || !savePlan.write.payload) {
            return {
                success: false,
                code: savePlan.write.blockedBy === 'upload' ? 'AVATAR_UPLOAD_FAILED' : 'INVALID_PROFILE',
                msg: savePlan.write.blockedBy === 'upload' ? '头像上传失败' : '请输入有效昵称'
            };
        }

        return normalizeAuthResponse(await callCloud('auth', 'updateProfile', {
            ...savePlan.write.payload,
            uploadedAvatar
        }));
    },

    // --- Admin API ---
    async fillPhonetics(limit = 500) {
        return await callCloud('admin', 'fillPhonetics', { limit });
    },

    // --- Progress API ---
    async syncProgress(userId, wordId, status, xp = 0, coins = 0, maxCombo = 0, mode = 'learn') {
        return await callCloud('progress', 'syncProgress', {
            wordId,
            status,
            xp,
            coins,
            maxCombo,
            mode
        });
    },

    async getStats(userId) {
        const res = await callCloud('progress', 'getStats');
        if (!res.success) return null;
        // Normalize shape for existing UI callers.
        if (res.data && res.data.user) {
            return {
                ...res.data,
                user: mergeUserState({}, res.data.user)
            };
        }
        return { user: mergeUserState({}, res.data) };
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
    async getLeaderboard(limit = 20) {
        const res = await callCloud('progress', 'getLeaderboard', { limit });
        return res.success && Array.isArray(res.data) ? normalizeLeaderboardEntries(res.data) : [];
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
