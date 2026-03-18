<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import { API } from '../api.js';
import { Actions, GameState } from '../state.js';
import { resolveAvatarUrl } from '../avatar.js';

const nickname = ref(GameState.user.nickname || GameState.user.username || '');
const avatarFile = ref(null);
const avatarPreview = ref(resolveAvatarUrl(GameState.user.avatar));
const saving = ref(false);
const errorMessage = ref('');

const previewUrl = computed(() => avatarPreview.value || resolveAvatarUrl(GameState.user.avatar));

const revokePreview = () => {
  if (avatarPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value);
  }
};

const goBack = () => Actions.setView('settings');

const onFileChange = (event) => {
  const [file] = Array.from(event?.target?.files || []);
  if (!file) return;
  revokePreview();
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
  errorMessage.value = '';
};

const saveProfile = async () => {
  saving.value = true;
  errorMessage.value = '';
  try {
    let nextAvatar = GameState.user.avatar;
    if (avatarFile.value) {
      const uploadRes = await API.uploadAvatar(avatarFile.value);
      if (!uploadRes?.success || !uploadRes.user?.avatar) {
        errorMessage.value = uploadRes?.error || uploadRes?.message || '头像上传失败';
        return;
      }
      nextAvatar = uploadRes.user.avatar;
    }

    const profileRes = await API.updateProfile({ nickname: nickname.value });
    if (!profileRes?.success || !profileRes.user) {
      errorMessage.value = profileRes?.error || profileRes?.message || '资料保存失败';
      return;
    }

    Actions.setUser({
      ...profileRes.user,
      avatar: nextAvatar || profileRes.user.avatar,
    });
    Actions.setView('settings');
  } catch (error) {
    console.error('Save profile failed', error);
    errorMessage.value = '资料保存失败';
  } finally {
    saving.value = false;
  }
};

onBeforeUnmount(() => {
  revokePreview();
});
</script>

<template>
  <div class="profile-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <div class="header-copy">
        <div class="title">编辑资料</div>
        <div class="subtitle">头像</div>
      </div>
      <div class="spacer"></div>
    </div>

    <section class="profile-card">
      <img data-test="avatar-preview" class="avatar-preview" :src="previewUrl" alt="avatar preview" />

      <label class="picker-btn">
        <span>选择本地图片</span>
        <input type="file" accept="image/*" @change="onFileChange" />
      </label>

      <label class="field">
        <span class="field-label">昵称</span>
        <input v-model="nickname" class="field-input" maxlength="24" placeholder="请输入昵称" />
      </label>
    </section>

    <button class="save-btn" :disabled="saving" @click="saveProfile">
      {{ saving ? '保存中...' : '保存资料' }}
    </button>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: calc(env(safe-area-inset-top, 0px) + 88px) 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header { display:flex; align-items:center; justify-content:space-between; }
.back-btn, .spacer { width: 44px; height: 44px; }
.back-btn { border:none; border-radius:999px; background:#fff; font-size:20px; font-weight:700; }
.header-copy { text-align:center; }
.title { font-size: 28px; font-weight: 700; color:#111; }
.subtitle { font-size: 16px; color:#7b758b; font-weight: 600; }

.profile-card {
  background:#fff9f1;
  border-radius: 28px;
  padding: 24px 20px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: 18px;
  box-shadow: 0 12px 24px rgba(17,17,17,.04);
}

.avatar-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 999px;
  border: 4px solid #fff;
  background: #fff;
}

.picker-btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #6f58d9;
  color: #fff;
  font-weight: 700;
  display:flex;
  align-items:center;
  justify-content:center;
  position: relative;
  overflow: hidden;
}

.picker-btn input {
  position:absolute;
  inset:0;
  opacity:0;
}

.field {
  width:100%;
  display:flex;
  flex-direction:column;
  gap: 8px;
}

.field-label { font-size:14px; font-weight:700; color:#7b758b; }

.field-input {
  width:100%;
  min-height:48px;
  border:none;
  border-radius:16px;
  background:#fff;
  padding: 0 14px;
  font-size:16px;
  color:#111;
}

.save-btn {
  min-height: 54px;
  border:none;
  border-radius: 20px;
  background:#111;
  color:#fff;
  font-size:18px;
  font-weight:700;
}

.error-text {
  margin: 0;
  color: #c62828;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
</style>
