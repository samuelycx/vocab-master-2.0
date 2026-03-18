<script setup>
import { ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';
import { AuthSession } from '../auth-session.js';
import { resolveAvatarUrl } from '../avatar.js';

const props = defineProps({
  onBack: Function,
});

const handleBack = () => {
  if (props.onBack) props.onBack();
  else Actions.setView('dashboard');
};

const settings = GameState.settings;
const showResetConfirm = ref(false);
const resetLoading = ref(false);

const toggleSound = () => {
  Actions.updateSettings('soundEnabled', !settings.soundEnabled);
};

const setLanguage = (language) => {
  Actions.updateSettings('language', language);
};

const handleReset = async () => {
  resetLoading.value = true;
  try {
    const res = await API.resetProgress();
    if (res?.success) {
      Actions.reset();
      window.location.reload();
    }
  } catch (e) {
    console.error('Reset failed', e);
  } finally {
    resetLoading.value = false;
    showResetConfirm.value = false;
  }
};

const logout = async () => {
  await AuthSession.logout();
};

const copyOpenId = async () => {
  const value = String(GameState.user?.openid || '').trim();
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch (e) {
    console.warn('Copy openid failed', e);
  }
};
</script>

<template>
  <div class="settings-page">
    <div data-test="settings-header" class="header">
      <button class="back-btn" @click="handleBack">
        <span class="back-icon">←</span>
      </button>

      <div class="header-center">
        <div class="header-title">设置</div>
        <div class="build-tag">build 2026-03-05.1</div>
      </div>

      <div class="header-placeholder"></div>
    </div>

    <button class="user-card" @click="Actions.setView('profile-setup')">
      <div class="user-avatar">
        <img class="avatar-img" :src="resolveAvatarUrl(GameState.user.avatar)" alt="avatar" />
      </div>

      <div class="user-info">
        <div class="user-name">{{ GameState.user.nickname || GameState.user.username || '微信用户' }}</div>
        <div class="user-level">Lv.{{ GameState.user.level || 1 }}</div>
      </div>

      <div class="user-arrow">→</div>
    </button>

    <div class="openid-row">
      <div class="openid-text">OpenID: {{ GameState.user.openid || '暂无' }}</div>
      <button class="openid-copy" :class="{ disabled: !GameState.user.openid }" @click="copyOpenId">复制</button>
    </div>

    <div class="settings-content">
      <section data-test="settings-preferences" class="section">
        <div class="section-title">偏好设置</div>

        <div class="setting-item">
          <div class="setting-left">
            <div class="setting-icon">🔊</div>
            <div class="setting-label">音效</div>
          </div>

          <button class="toggle" :class="{ active: settings.soundEnabled }" @click="toggleSound">
            <div class="toggle-knob"></div>
          </button>
        </div>

        <div class="setting-item language-item">
          <div class="setting-left">
            <div class="setting-icon">🌐</div>
            <div class="setting-label">语言</div>
          </div>

          <div class="language-switch">
            <button class="lang-btn" :class="{ active: settings.language !== 'en-US' }" @click="setLanguage('zh-CN')">中文</button>
            <button class="lang-btn" :class="{ active: settings.language === 'en-US' }" @click="setLanguage('en-US')">English</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-title">关于</div>

        <div class="about-item">
          <div class="about-label">版本</div>
          <div class="about-value">v2.0.0</div>
        </div>

        <div class="about-item">
          <div class="about-label">开发者</div>
          <div class="about-value">Vocab Master Team</div>
        </div>
      </section>
    </div>

    <div data-test="settings-account" class="bottom-actions">
      <button class="action-btn logout" @click="logout">退出登录</button>
      <button data-test="settings-danger" class="action-btn danger" @click="showResetConfirm = true">重置学习进度</button>
    </div>

    <div v-if="showResetConfirm" class="modal-overlay" @click="showResetConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-title">确定要重置吗？</div>
        <div class="modal-desc">此操作将清空你所有的学习记录、等级和成就。此操作无法撤销。</div>

        <div class="modal-buttons">
          <button class="modal-btn cancel" @click="showResetConfirm = false">取消</button>
          <button class="modal-btn confirm" :disabled="resetLoading" @click="handleReset">
            {{ resetLoading ? '重置中...' : '确定重置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #F6F1E8;
  padding: 108px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.back-btn {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 18px;
  font-weight: 700;
  color: #111111;
}

.header-title {
  font-size: 31px;
  font-weight: 700;
  color: #111111;
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.build-tag {
  font-size: 15px;
  color: #7B758B;
  font-weight: 600;
}

.header-placeholder {
  width: 44px;
}

.user-card {
  background: linear-gradient(180deg, #fffaf4 0%, #fff6ec 100%);
  border-radius: 24px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  height: 104px;
  justify-content: space-between;
  border: 1px solid #f1e6d7;
  box-shadow: 0 8px 20px rgba(26, 26, 26, 0.04);
}

.openid-row {
  margin-top: 6px;
  background: #FFF9F1;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
}

.openid-text {
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.openid-copy {
  padding: 4px 12px;
  border-radius: 14px;
  background: #ede7dd;
  color: #111111;
  font-weight: 700;
  border: none;
}

.openid-copy.disabled {
  opacity: 0.5;
}

.user-avatar {
  width: 58px;
  height: 58px;
  background: #ffffff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 6px 14px rgba(26, 26, 26, 0.08);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-size: 23px;
  font-weight: 700;
  color: #111111;
}

.user-level {
  font-size: 15px;
  color: #6B7280;
  font-weight: 600;
}

.user-arrow {
  font-size: 18px;
  color: #6B7280;
}

.settings-content {
  flex: 1;
}

.section {
  margin-bottom: 14px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #9CA3AF;
  display: block;
  margin-bottom: 10px;
}

.setting-item,
.about-item {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  border: none;
}

.language-item {
  align-items: flex-start;
}

.language-switch {
  display: flex;
  gap: 8px;
}

.lang-btn {
  min-width: 78px;
  text-align: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: #EDE7DD;
  color: #6B7280;
  font-size: 15px;
  font-weight: 700;
  border: none;
}

.lang-btn.active {
  background: #6F58D9;
  color: #fff;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  font-size: 20px;
}

.setting-label,
.about-label,
.about-value {
  font-size: 20px;
  font-weight: 700;
  color: #111111;
}

.about-value {
  color: #6B7280;
  font-weight: 600;
}

.toggle {
  width: 60px;
  height: 32px;
  background: #EDE7DD;
  border-radius: 999px;
  position: relative;
  border: none;
}

.toggle.active {
  background: #A8F0C6;
}

.toggle-knob {
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.toggle.active .toggle-knob {
  left: 30px;
}

.bottom-actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 26px;
  padding-bottom: 18px;
}

.action-btn {
  width: 100%;
  padding: 18px;
  border-radius: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  border: none;
}

.action-btn.logout {
  background: white;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-btn.danger {
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 360px;
}

.modal-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.modal-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  border: none;
}

.modal-btn.cancel {
  background: #f0f0f0;
  color: #666;
}

.modal-btn.confirm {
  background: #ef4444;
  color: white;
}
</style>
