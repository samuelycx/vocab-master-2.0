<script setup>
import { Actions } from '../state.js';
import { API } from '../api.js';

const start = async () => {
    uni.showLoading({ title: '登录中...' });
    try {
        const res = await API.login();
        uni.hideLoading();
        
        if (res && res.success && res.data) {
            Actions.setUser(res.data);
            uni.setStorageSync('vocab_user', JSON.stringify(res.data));
        }
        
        Actions.setView('dashboard');
    } catch (err) {
        uni.hideLoading();
        console.error('Login failed', err);
        uni.showToast({ title: '登录失败', icon: 'none' });
    }
};
</script>

<template>
    <view class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        
        <view class="mb-12 relative">
            <view class="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-10 relative">
                <text class="text-6xl text-primary transform -rotate-12">🎓</text>
            </view>
            <!-- Decorative blobs -->
            <view class="absolute -top-4 -right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-60 animate-bounce-in" style="animation-delay: 0.2s"></view>
            <view class="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-300 rounded-full opacity-60 animate-bounce-in" style="animation-delay: 0.5s"></view>
        </view>

        <text class="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight block">
            Vocab <text class="text-primary">Master</text>
        </text>
        <text class="text-slate-400 mb-12 font-medium block">让单词成为你的超能力</text>

        <button 
            @click="start"
            class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 btn-press flex items-center justify-center gap-3"
        >
            开始冒险 <text>➡️</text>
        </button>

        <text class="mt-8 text-xs text-slate-400 block">Ver 2.0 Alpha</text>
    </view>
</template>
