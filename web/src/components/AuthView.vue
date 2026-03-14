<script setup>
import { computed, reactive, ref } from 'vue';
import { AuthSession } from '../auth-session.js';

const mode = ref('login');
const loading = ref(false);
const errorMessage = ref('');
const form = reactive({ username: '', password: '' });

const submitLabel = computed(() => mode.value === 'login' ? '登录' : '注册');
const helperText = computed(() => mode.value === 'login'
  ? '用你的账号继续学习、排行和 PK。'
  : '创建账号后，学习记录会自动同步。');

async function handleSubmit() {
  if (loading.value) return;
  errorMessage.value = '';
  loading.value = true;

  const payload = {
    username: form.username.trim(),
    password: form.password,
  };

  const result = mode.value === 'login'
    ? await AuthSession.login(payload)
    : await AuthSession.register(payload);

  if (!result?.success) {
    errorMessage.value = result?.message || result?.error || '操作失败，请稍后重试';
  }

  loading.value = false;
}
</script>

<template>
  <div class="auth-page">
    <div class="bg-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <div class="auth-content">
      <div class="logo-container">
        <div class="logo">VM</div>
        <div class="logo-glow"></div>
      </div>

      <div class="title-section">
        <span class="title">Vocab</span>
        <span class="title-accent">Master</span>
      </div>

      <p class="subtitle">{{ helperText }}</p>

      <div class="mode-switch">
        <button class="mode-pill" :class="{ active: mode === 'login' }" @click="mode = 'login'">登录</button>
        <button data-test="switch-register" class="mode-pill" :class="{ active: mode === 'register' }" @click="mode = 'register'">注册</button>
      </div>

      <form class="auth-card" @submit.prevent="handleSubmit">
        <label class="field-label">用户名</label>
        <input data-test="username" v-model="form.username" class="field-input" type="text" autocomplete="username" placeholder="请输入用户名">

        <label class="field-label">密码</label>
        <input data-test="password" v-model="form.password" class="field-input" type="password" autocomplete="current-password" placeholder="请输入密码">

        <p v-if="errorMessage" class="error-box">{{ errorMessage }}</p>

        <button data-test="submit" type="submit" class="start-btn" :disabled="loading">
          <span class="start-text">{{ loading ? '处理中...' : submitLabel }}</span>
          <span class="start-icon">GO</span>
        </button>
      </form>

      <p class="version">Web Edition • v2.0</p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #5a459d 0%, #7b66c5 50%, #9b8ad5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
}
.bg-decoration { position: absolute; inset: 0; pointer-events: none; }
.bg-circle { position: absolute; border-radius: 999px; opacity: .12; }
.circle-1 { width: 220px; height: 220px; background: white; top: -70px; right: -60px; }
.circle-2 { width: 180px; height: 180px; background: #a8f0c6; bottom: -40px; left: -50px; }
.circle-3 { width: 120px; height: 120px; background: #f9e975; top: 42%; left: -30px; }
.auth-content { position: relative; z-index: 1; width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; }
.auth-content {
  animation: riseIn .45s cubic-bezier(.22,1,.36,1);
}
.logo-container { position: relative; margin-bottom: 24px; }
.logo { width: 110px; height: 110px; background: white; border-radius: 28px; display:flex; align-items:center; justify-content:center; font-size: 42px; font-weight: 900; color: #5a459d; box-shadow: 0 10px 36px rgba(0,0,0,.18); position: relative; z-index: 2; }
.logo-glow { position: absolute; inset: -12px; border-radius: 36px; background: radial-gradient(circle, rgba(168,240,198,.45) 0%, transparent 70%); }
.title-section { display: flex; gap: 8px; margin-bottom: 10px; }
.title, .title-accent { font-size: 34px; font-weight: 900; letter-spacing: .02em; }
.title { color: white; }
.title-accent { color: #a8f0c6; }
.subtitle { color: rgba(255,255,255,.74); text-align: center; margin-bottom: 20px; font-size: 15px; line-height: 1.5; }
.mode-switch { width: 100%; display: flex; gap: 10px; margin-bottom: 16px; }
.mode-pill { flex: 1; min-height: 44px; border-radius: 18px; border: 1px solid rgba(255,255,255,.22); background: rgba(255,255,255,.12); color: white; font-size: 16px; font-weight: 700; }
.mode-pill.active { background: white; color: #1a1a1a; }
.auth-card { width: 100%; background: rgba(255,255,255,.96); border-radius: 26px; padding: 20px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 14px 36px rgba(0,0,0,.16); }
.field-label { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.field-input { width: 100%; min-height: 50px; border-radius: 18px; border: none; background: #f3f4f6; padding: 0 16px; font-size: 16px; font-weight: 600; color: #111; outline: none; }
.error-box { border-radius: 16px; background: #fff1f2; color: #e11d48; padding: 12px 14px; font-size: 14px; font-weight: 600; }
.start-btn { width: 100%; margin-top: 8px; border: none; border-radius: 20px; min-height: 58px; background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,.08); padding: 0 20px; display:flex; align-items:center; justify-content:space-between; }
.start-btn:disabled { opacity: .7; }
.start-text { font-size: 20px; font-weight: 900; color: #1a1a1a; }
.start-icon { width: 40px; height: 40px; border-radius: 999px; background: #5a459d; color: white; display:flex; align-items:center; justify-content:center; font-size: 14px; font-weight: 900; }
.version { margin-top: 18px; color: rgba(255,255,255,.72); font-size: 12px; }

@keyframes riseIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
