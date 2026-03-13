<script setup>
import { onMounted, ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';
import { UI_ICONS } from '../utils/ui-icons.js';

const props = defineProps({
    onBack: Function
});

const handleBack = () => {
    if (props.onBack) {
        props.onBack();
    } else {
        Actions.setView('dashboard');
    }
};

const settings = GameState.settings;
const isAdmin = (GameState.user?.role === 'ADMIN');
const showResetConfirm = ref(false);
const resetLoading = ref(false);
const { t, locale } = useI18n();
const uiIcons = UI_ICONS;
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
const PROFILE_DEBUG = true;
const openid = ref(GameState.user?.openid || '');

const getAvatarUrl = (avatar) => {
    if (!avatar || typeof avatar !== 'string') return DEFAULT_AVATAR;
    return avatar.startsWith('http') ? avatar : DEFAULT_AVATAR;
};

const isDefaultProfile = () => {
    const name = String(GameState.user.username || '').trim();
    const avatar = String(GameState.user.avatar || '').trim();
    return (
        !name ||
        name === '准备出发的小萌新' ||
        /^player_\d+$/i.test(name) ||
        !avatar ||
        avatar === DEFAULT_AVATAR
    );
};

const syncProfileToServer = async ({ username, avatar }, successToast = false) => {
    const safeUsername = String(username || '').trim();
    const safeAvatar = String(avatar || '').trim();
    if (!safeUsername && !safeAvatar) return false;

    const res = await API.updateProfile({ username: safeUsername, avatar: safeAvatar });
    if (typeof console !== 'undefined') {
        console.log('[ProfileDebug] updateProfile response', res);
    }
    if (!res || !res.success) return false;

    Actions.setUser({
        username: safeUsername || GameState.user.username,
        nickname: safeUsername || GameState.user.nickname,
        avatar: safeAvatar || GameState.user.avatar,
        isProfileSet: true
    });

    if (successToast) {
        uni.showToast({ title: t('settings_sync_success'), icon: 'success' });
    }
    return true;
};

const toggleSound = () => {
    Actions.updateSettings('soundEnabled', !settings.soundEnabled);
};

const isLoggedIn = () => Boolean(GameState.user?.isLoggedIn || GameState.user?.openid || GameState.user?.id);

const login = async () => {
    if (isLoggedIn()) {
        uni.showToast({ title: '已登录', icon: 'none' });
        return;
    }
    try {
        const res = await API.login();
        if (res && res.success && res.data) {
            Actions.setUser(res.data);
            Actions.setLogin(true);
            uni.setStorageSync('vocab_user', JSON.stringify(res.data));
            uni.showToast({ title: '登录成功', icon: 'success' });
        } else {
            uni.showToast({ title: res?.msg || '登录失败', icon: 'none' });
        }
    } catch (e) {
        uni.showToast({ title: e?.message || '登录失败', icon: 'none' });
    }
};

const setLanguage = (language) => {
    Actions.updateSettings('language', language);
};

const handleReset = async () => {
    resetLoading.value = true;
    try {
        const res = await API.resetProgress();
        if (res && res.success) {
            Actions.reset();
            uni.reLaunch({ url: '/pages/index/index' });
        }
    } catch (e) {
        console.error('Reset failed', e);
    } finally {
        resetLoading.value = false;
        showResetConfirm.value = false;
    }
};

const logout = () => {
    Actions.reset();
    Actions.setLogin(false);
    uni.removeStorageSync('vocab_user');
    uni.reLaunch({ url: '/pages/index/index' });
};

const copyOpenId = () => {
    const value = String(GameState.user?.openid || '').trim();
    if (!value) {
        uni.showToast({ title: 'OpenID 暂无', icon: 'none' });
        return;
    }
    uni.setClipboardData({
        data: value,
        success: () => {
            uni.showToast({ title: 'OpenID 已复制', icon: 'success' });
        },
        fail: () => {
            uni.showToast({ title: '复制失败', icon: 'none' });
        }
    });
};

const adminClickCount = ref(0);
const handleSecretAdmin = () => {
    adminClickCount.value++;
    if (adminClickCount.value >= 5) {
        Actions.setView('admin-dashboard');
        adminClickCount.value = 0;
    }
};

const goToProfile = async () => {
    if (PROFILE_DEBUG) {
        console.log('[ProfileDebug] goToProfile click');
    }
    // WeChat nickname/avatar requires user gesture; this click path is suitable.
    const getProfile =
        (typeof uni !== 'undefined' && typeof uni.getUserProfile === 'function')
            ? uni.getUserProfile
            : (typeof wx !== 'undefined' && typeof wx.getUserProfile === 'function'
                ? wx.getUserProfile
                : null);

    if (getProfile) {
        try {
            const profile = await new Promise((resolve, reject) => {
                getProfile({
                    desc: t('settings_profile_auth_desc'),
                    lang: locale.value === 'en-US' ? 'en' : 'zh_CN',
                    success: resolve,
                    fail: reject
                });
            });

            const userInfo = profile?.userInfo || {};
            const username = String(userInfo.nickName || '').trim();
            const avatar = String(userInfo.avatarUrl || '').trim();
            if (PROFILE_DEBUG) {
                console.log('[ProfileDebug] getUserProfile result', { username, avatar });
            }

            if (!username && !avatar) {
                uni.showToast({ title: t('settings_sync_failed'), icon: 'none' });
                return;
            }

            if (await syncProfileToServer({ username, avatar }, true)) {
                try {
                    const refreshed = await API.login();
                    if (refreshed && refreshed.success && refreshed.data) {
                        Actions.setUser(refreshed.data);
                        uni.setStorageSync('vocab_user', JSON.stringify(refreshed.data));
                    }
                } catch (e) {
                    console.warn('Failed to refresh user after profile sync', e);
                }
                return;
            }
            uni.showToast({ title: t('settings_sync_failed'), icon: 'none' });
        } catch (e) {
            if (PROFILE_DEBUG) {
                console.log('[ProfileDebug] getUserProfile fail', e);
            }
            uni.showToast({ title: t('settings_sync_cancelled'), icon: 'none' });
        }
    } else {
        if (PROFILE_DEBUG) {
            console.log('[ProfileDebug] getUserProfile not available');
        }
    }
    Actions.setView('profile-setup');
};

onMounted(async () => {
    // Silent getUserInfo is restricted by WeChat; keep profile sync on user gesture only.
    openid.value = GameState.user?.openid || '';
});
</script>

<template>
    <view class="settings-page">
        <!-- Header -->
        <view class="header">
            <view class="back-btn" @click="handleBack">
                <text class="back-icon">←</text>
            </view>
            
            <view class="header-center">
                <text class="header-title">{{ t('settings_title') }}</text>
                <text class="build-tag">build 2026-03-05.1</text>
            </view>
            
            <view class="header-placeholder"></view>
        </view>

        <!-- User Card -->
        <view class="user-card" @click="goToProfile">
            <view class="user-avatar">
                <image class="avatar-img" :src="getAvatarUrl(GameState.user.avatar)" />
            </view>
            
            <view class="user-info">
                <text class="user-name">{{ GameState.user.nickname || GameState.user.username || t('settings_user_default') }}</text>
                <text class="user-level">Lv.{{ GameState.user.level || 1 }}</text>
            </view>
            
            <view class="user-arrow">→</view>
        </view>
        <view class="openid-row">
            <text class="openid-text">OpenID: {{ GameState.user.openid || '暂无' }}</text>
            <view class="openid-copy" :class="{ disabled: !GameState.user.openid }" @click="copyOpenId">
                复制
            </view>
        </view>

        <!-- Settings Sections -->
        <view class="settings-content">
            <!-- 偏好设置 -->
            <view class="section">
                <text class="section-title">{{ t('settings_preferences') }}</text>
                
                <view class="setting-item">
                    <view class="setting-left">
                        <image class="setting-icon-image" :src="uiIcons.sound" mode="aspectFit" />
                        <text class="setting-label">{{ t('settings_sound') }}</text>
                    </view>
                    
                    <view 
                        class="toggle" 
                        :class="{ active: settings.soundEnabled }"
                        @click="toggleSound"
                    >
                        <view class="toggle-knob"></view>
                    </view>
                </view>

                <view class="setting-item language-item">
                    <view class="setting-left">
                        <image class="setting-icon-image" :src="uiIcons.lang" mode="aspectFit" />
                        <text class="setting-label">{{ t('settings_language') }}</text>
                    </view>
                    <view class="language-switch">
                        <view class="lang-btn" :class="{ active: settings.language === 'zh-CN' }" @click="setLanguage('zh-CN')">
                            {{ t('settings_language_zh') }}
                        </view>
                        <view class="lang-btn" :class="{ active: settings.language === 'en-US' }" @click="setLanguage('en-US')">
                            {{ t('settings_language_en') }}
                        </view>
                    </view>
                </view>
            </view>

            <!-- 关于 -->
            <view class="section">
                <text class="section-title">{{ t('settings_about') }}</text>
                
                <view class="about-item">
                    <text class="about-label">{{ t('settings_version') }}</text>
                    <text class="about-value">v2.0.0</text>
                </view>
                
                <view class="about-item">
                    <text class="about-label">{{ t('settings_developer') }}</text>
                    <text class="about-value">Vocab Master Team</text>
                </view>
            </view>
        </view>

        <!-- Bottom Buttons -->
        <view class="bottom-actions">
            <view v-if="isLoggedIn()" class="action-btn logout" @click="logout">
                <text>{{ t('settings_logout') }}</text>
            </view>
            <view v-else class="action-btn logout" @click="login">
                <text>{{ t('settings_login') }}</text>
            </view>
            
            <view class="action-btn danger" @click="showResetConfirm = true">
                <text>{{ t('settings_reset') }}</text>
            </view>
        </view>

        <!-- Reset Confirm Modal -->
        <view v-if="showResetConfirm" class="modal-overlay" @click="showResetConfirm = false">
            <view class="modal-content" @click.stop="">
                <text class="modal-title">{{ t('settings_reset_title') }}</text>
                <text class="modal-desc">{{ t('settings_reset_desc') }}</text>
                
                <view class="modal-buttons">
                    <view class="modal-btn cancel" @click="showResetConfirm = false">
                        {{ t('settings_cancel') }}
                    </view>
                    <view class="modal-btn confirm" @click="handleReset" :disabled="resetLoading">
                        {{ resetLoading ? t('settings_resetting') : t('settings_confirm_reset') }}
                    </view>
                </view>
            </view>
        </view>

        <!-- Secret Admin -->
        <view class="secret-admin" @click="handleSecretAdmin">
            <text>Vocab Master v2.0</text>
        </view>
    </view>
</template>

<style scoped>
.settings-page {
    min-height: 100vh;
    background: #F6F1E8;
    padding: calc(env(safe-area-inset-top, 0px) + 176rpx) 41.9rpx 34.9rpx;
    display: flex;
    flex-direction: column;
    gap: 24.4rpx;
}

/* Header */
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 118.6rpx;
}

.back-btn {
    width: 76.7rpx;
    height: 76.7rpx;
    background: #ffffff;
    border-radius: 38.4rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-btn:active {
    transform: scale(0.96);
}

.back-icon {
    font-size: 31.4rpx;
    font-weight: 600;
    color: #111111;
}

.header-title {
    font-size: 48.8rpx;
    font-weight: 600;
    color: #111111;
}

.header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
}

.build-tag {
    font-size: 24.4rpx;
    color: #7B758B;
    font-weight: 600;
}

.header-placeholder {
    width: 76.7rpx;
}

/* User Card */
.user-card {
    background: linear-gradient(180deg, #fffaf4 0%, #fff6ec 100%);
    border-radius: 38.4rpx;
    padding: 0 27.9rpx;
    display: flex;
    align-items: center;
    gap: 24.4rpx;
    height: 164rpx;
    justify-content: space-between;
    border: 2rpx solid #f1e6d7;
    box-shadow: 0 14rpx 34rpx rgba(26, 26, 26, 0.04);
}

.openid-row {
    margin-top: 10.5rpx;
    background: #FFF9F1;
    border-radius: 20.9rpx;
    padding: 16.3rpx 22.4rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 22.4rpx;
    color: #6b7280;
}

.openid-text {
    max-width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.openid-copy {
    padding: 6.9rpx 20.9rpx;
    border-radius: 20.9rpx;
    background: #ede7dd;
    color: #111111;
    font-weight: 600;
}

.openid-copy.disabled {
    opacity: 0.5;
}

.user-avatar {
  width: 90.7rpx;
  height: 90.7rpx;
  background: #ffffff;
  border-radius: 45.3rpx;
    display: flex;
    align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(26, 26, 26, 0.08);
}

.avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 36.6rpx;
    font-weight: 500;
    color: #111111;
    display: block;
}

.user-level {
    font-size: 24.4rpx;
    color: #6B7280;
    font-weight: 600;
}

.user-arrow {
    font-size: 31.4rpx;
    color: #6B7280;
}

/* Settings Content */
.settings-content {
    flex: 1;
}

.section {
    margin-bottom: 24.4rpx;
}

.section-title {
    font-size: 24.4rpx;
    font-weight: 500;
    color: #9CA3AF;
    display: block;
    margin-bottom: 17.4rpx;
}

/* Setting Item */
.setting-item {
    background: #ffffff;
    border-radius: 38.4rpx;
    padding: 27.9rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 17.4rpx;
}

.language-item {
    align-items: flex-start;
}

.language-switch {
    display: flex;
    gap: 12rpx;
}

.lang-btn {
    min-width: 112rpx;
    text-align: center;
    padding: 10rpx 16rpx;
    border-radius: 999rpx;
    background: #EDE7DD;
    color: #6B7280;
    font-size: 24.4rpx;
    font-weight: 600;
}

.lang-btn.active {
    background: #6F58D9;
    color: #fff;
}

.setting-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.setting-icon-image {
    width: 34rpx;
    height: 34rpx;
}

.setting-label {
    font-size: 31.4rpx;
    font-weight: 600;
    color: #111111;
}

/* Toggle */
.toggle {
    width: 104.7rpx;
    height: 55.8rpx;
    background: #EDE7DD;
    border-radius: 27.9rpx;
    position: relative;
    transition: all 0.3s ease;
}

.toggle.active {
    background: #A8F0C6;
}

.toggle-knob {
    width: 48.8rpx;
    height: 48.8rpx;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 3.5rpx;
    left: 3.5rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.toggle.active .toggle-knob {
    left: 52.3rpx;
}

/* About */
.about-item {
    background: #ffffff;
    border-radius: 38.4rpx;
    padding: 27.9rpx;
    display: flex;
    justify-content: space-between;
    margin-bottom: 17.4rpx;
}

.about-label {
    font-size: 31.4rpx;
    font-weight: 600;
    color: #111111;
}

.about-value {
    font-size: 31.4rpx;
    color: #6B7280;
}

/* Bottom Actions */
.bottom-actions {
    display: flex;
    flex-direction: column;
    gap: 24.4rpx;
    margin-top: 45.3rpx;
    padding-bottom: 34.9rpx;
}

.action-btn {
    width: 100%;
    padding: 27.9rpx;
    border-radius: 38.4rpx;
    text-align: center;
    font-size: 31.4rpx;
    font-weight: 600;
    transition: all 0.2s ease;
}

.action-btn.logout {
    background: white;
    color: #333;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.action-btn.logout:active {
    background: #f5f5f5;
}

.action-btn.danger {
    background: transparent;
    color: #ef4444;
    border: 2rpx solid #ef4444;
}

.action-btn.danger:active {
    background: #fef2f2;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 40rpx;
}

.modal-content {
    background: white;
    border-radius: 32rpx;
    padding: 48rpx;
    width: 100%;
    max-width: 560rpx;
}

.modal-title {
    font-size: 36rpx;
    font-weight: 800;
    color: #1a1a1a;
    display: block;
    margin-bottom: 16rpx;
}

.modal-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    display: block;
    margin-bottom: 32rpx;
}

.modal-buttons {
    display: flex;
    gap: 20rpx;
}

.modal-btn {
    flex: 1;
    padding: 24rpx;
    border-radius: 20rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 700;
}

.modal-btn.cancel {
    background: #f0f0f0;
    color: #666;
}

.modal-btn.confirm {
    background: #ef4444;
    color: white;
}

.modal-btn[disabled] {
    opacity: 0.6;
}

/* Secret Admin */
.secret-admin {
    text-align: center;
    padding: 31.4rpx 40rpx 10.5rpx;
    opacity: 0.12;
}

.secret-admin text {
    font-size: 22rpx;
    color: #999;
}
</style>
