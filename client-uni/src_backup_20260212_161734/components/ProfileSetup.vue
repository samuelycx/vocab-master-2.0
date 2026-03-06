<script setup>
import { ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';

const user = GameState.user;
const nickname = ref(user.username || '');
const avatarUrl = ref(user.avatar || '');

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
    
    const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
            type: 'updateProfile',
            data: {
                username: nickname.value,
                avatar: avatarUrl.value
            }
        }
    });

    uni.hideLoading();

    if (res.result && res.result.success) {
        Actions.setUser({
            username: nickname.value,
            avatar: avatarUrl.value,
            isProfileSet: true
        });
        uni.showToast({ title: '设置成功', icon: 'success' });
    } else {
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
};
</script>

<template>
    <view class="fixed inset-0 z-50 flex items-center justify-center bg-black-opacity-60 backdrop-blur-md p-6">
        <view class="bg-surface w-full max-w-sm rounded-4xl p-8 shadow-2xl animate-pop">
            <text class="text-2xl font-black text-text-main mb-2 block text-center">完善个人资料</text>
            <text class="text-text-muted text-sm mb-8 block text-center font-medium">设置你的名字和头像开始冒险吧</text>

            <view class="flex flex-col items-center gap-8">
                <!-- Avatar Selector -->
                <button 
                    class="w-24 h-24 rounded-full bg-secondary border-4 border-white shadow-lg overflow-hidden relative group p-0"
                    open-type="chooseAvatar" 
                    @chooseavatar="onChooseAvatar"
                >
                    <image :src="avatarUrl" class="w-full h-full object-cover" />
                    <view class="absolute inset-0 bg-black-opacity-20 flex items-center justify-center opacity-0 group-active_opacity-100 transition-opacity">
                        <text class="text-white text-xs font-bold">更换</text>
                    </view>
                </button>

                <!-- Nickname Input -->
                <view class="w-full">
                    <text class="text-xs font-bold text-text-muted uppercase mb-2 ml-1 block">你的昵称</text>
                    <input 
                        type="nickname" 
                        v-model="nickname"
                        class="w-full bg-secondary p-4 rounded-2xl font-bold text-text-main outline-none"
                        placeholder="点击输入昵称"
                        @blur="(e) => nickname = e.detail.value"
                    />
                </view>

                <!-- Save Button -->
                <button 
                    @click="saveProfile"
                    class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg active_scale-95 transition-all mt-4"
                >
                    开启旅程
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
