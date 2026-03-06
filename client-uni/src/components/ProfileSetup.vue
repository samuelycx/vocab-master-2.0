<script setup>
import { ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';

const user = GameState.user;
const nickname = ref(user.username || '');
const avatarUrl = ref(user.avatar || '');

const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

const isEmoji = (str) => {
    if (!str || typeof str !== 'string') return false;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
};

const getAvatarUrl = (avatar) => {
    if (!avatar || isEmoji(avatar)) return DEFAULT_AVATAR;
    if (avatar.startsWith('http')) return avatar;
    return DEFAULT_AVATAR;
};

const onChooseAvatar = (e) => {
    const { avatarUrl: newAvatar } = e.detail;
    avatarUrl.value = newAvatar;
};

const saveProfile = async () => {
    if (!nickname.value || nickname.value === '准备出发的小萌新') {
        uni.showToast({ title: '请输入昵称', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '保存中...' });
    
    // In WeChat Cloud, you might need to upload the file first if avatarUrl is a temporary path
    // But for simplicity, we'll try to save it directly or handle upload later
    
    const res = await API.updateProfile({
        username: nickname.value,
        avatar: avatarUrl.value
    });

    uni.hideLoading();

    if (res && res.success) {
        Actions.setUser({
            username: nickname.value,
            avatar: avatarUrl.value,
            isProfileSet: true
        });
        uni.showToast({ title: '设置成功', icon: 'success' });
        Actions.setView('settings');
    } else {
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
};
</script>

<template>
    <view class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900-opacity-40 backdrop-blur-md p-6">
        <view class="bg-surface w-full max-w-sm rounded-[40px] p-10 shadow-2xl animate-pop border border-slate-50 dark_border-white-opacity-5">
            <view class="flex flex-col items-center mb-10">
                <text class="w-16 h-16 bg-primary-opacity-10 rounded-3xl flex items-center justify-center text-3xl mb-4">
                    👤
                </text>
                <text class="text-3xl font-black text-text-main mb-1 block text-center">Hello there!</text>
                <text class="text-text-muted text-sm block text-center font-bold">First, let's set up your profile.</text>
            </view>

            <view class="flex flex-col items-center gap-10">
                <!-- Avatar Selector -->
                <button 
                    class="w-28 h-28 rounded-4xl bg-surface border-4 border-white dark_border-slate-800 shadow-soft overflow-hidden relative group p-0 transition-transform active_scale-95"
                    open-type="chooseAvatar" 
                    @chooseavatar="onChooseAvatar"
                >
                    <image :src="getAvatarUrl(avatarUrl)" class="w-full h-full object-cover" />
                    <view class="absolute inset-0 bg-primary-opacity-20 flex items-center justify-center opacity-0 group-active_opacity-100 transition-opacity">
                        <text class="text-primary-dark text-xs font-black uppercase tracking-widest">Change</text>
                    </view>
                </button>

                <!-- Nickname Input -->
                <view class="w-full">
                    <text class="text-3xs font-black text-text-muted uppercase tracking-widest mb-3 ml-1 block">Your Scholar Name</text>
                    <input 
                        type="nickname" 
                        v-model="nickname"
                        class="w-full bg-slate-50 dark_bg-white-opacity-5 p-5 rounded-2xl font-black text-text-main outline-none border border-transparent focus_border-primary transition-all"
                        placeholder="Type your name..."
                        @blur="(e) => nickname = e.detail.value"
                    />
                </view>

                <!-- Save Button -->
                <button 
                    @click="saveProfile"
                    class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-slate-900-opacity-20 active_scale-95 transition-all"
                >
                    Get Started
                </button>
            </view>
        </view>
    </view>
</template>

<style scoped>
.animate-pop {
    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes pop {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
