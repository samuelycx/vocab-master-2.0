<script setup>
import { Actions } from '../state.js';

const start = () => {
  Actions.setView('auth');
};
</script>

<template>
  <div class="welcome-page">
    <div class="bg-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <div class="welcome-content">
      <div class="logo-container">
        <div class="logo">VM</div>
        <div class="logo-glow"></div>
      </div>

      <div class="title-section">
        <span class="title">Vocab</span>
        <span class="title-accent">Master</span>
      </div>

      <p class="subtitle">Mastering words, one level at a time.</p>

      <button class="start-btn" @click="start">
        <span class="start-text">Start Adventure</span>
        <span class="start-icon">GO</span>
      </button>

      <p class="version">Web Edition • v2.0</p>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
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
.welcome-content { position: relative; z-index: 1; width: 100%; max-width: 360px; display: flex; flex-direction: column; align-items: center; }
.logo-container { position: relative; margin-bottom: 24px; }
.logo { width: 110px; height: 110px; background: white; border-radius: 28px; display:flex; align-items:center; justify-content:center; font-size: 42px; font-weight: 900; color: #5a459d; box-shadow: 0 10px 36px rgba(0,0,0,.18); position: relative; z-index: 2; }
.logo-glow { position: absolute; inset: -12px; border-radius: 36px; background: radial-gradient(circle, rgba(168,240,198,.45) 0%, transparent 70%); }
.title-section { display: flex; gap: 8px; margin-bottom: 10px; }
.title, .title-accent { font-size: 34px; font-weight: 900; letter-spacing: .02em; }
.title { color: white; }
.title-accent { color: #a8f0c6; }
.subtitle { color: rgba(255,255,255,.74); text-align: center; margin-bottom: 26px; font-size: 15px; line-height: 1.5; }
.start-btn { width: 100%; border: none; border-radius: 22px; min-height: 62px; background: white; box-shadow: 0 14px 36px rgba(0,0,0,.16); padding: 0 20px; display:flex; align-items:center; justify-content:space-between; }
.start-text { font-size: 20px; font-weight: 900; color: #1a1a1a; }
.start-icon { width: 40px; height: 40px; border-radius: 999px; background: #5a459d; color: white; display:flex; align-items:center; justify-content:center; font-size: 14px; font-weight: 900; }
.version { margin-top: 18px; color: rgba(255,255,255,.72); font-size: 12px; }
</style>
