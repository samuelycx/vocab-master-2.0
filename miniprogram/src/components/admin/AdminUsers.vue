<script setup>
import { ref, onMounted } from 'vue';
import { API } from '../../api.js';

const users = ref([]);
const loading = ref(false);

const fetchUsers = async () => {
    loading.value = true;
    users.value = await API.getUsers();
    loading.value = false;
};

const toggleBan = async (user) => {
    uni.showModal({
        title: '确认',
        content: `确定要 ${user.role === 'BANNED' ? '取消封禁' : '封禁'} 用户 ${user.username} 吗?`,
        success: async (res) => {
            if (res.confirm) {
                await API.banUser(user.id);
                await fetchUsers();
            }
        }
    });
};

onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <view class="flex flex-col gap-6 animate-fade-in">
        <view>
            <text class="text-2xl font-black text-slate-800 dark_text-white block">用户管理</text>
            <text class="text-slate-500 text-sm block">Manage user accounts and progress.</text>
        </view>
        
        <view v-if="loading" class="text-center py-12">
            <view class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></view>
            <text class="text-slate-400 font-bold block">Loading users...</text>
        </view>

        <view v-else class="grid gap-4">
            <view v-for="u in users" :key="u.id" class="bg-surface p-4 rounded-xl shadow-sm border border-slate-100 dark_border-slate-800 flex flex-col md_flex-row md_items-center justify-between gap-4">
                <view class="flex items-center gap-4">
                    <view class="text-3xl w-12 h-12 bg-slate-50 dark_bg-slate-800 rounded-full flex items-center justify-center">
                        <text>{{ u.avatar }}</text>
                    </view>
                    <view>
                        <view class="font-bold text-slate-800 dark_text-white flex items-center gap-2">
                            <text>{{ u.username }}</text>
                            <text v-if="u.role === 'ADMIN'" class="bg-indigo-100 text-indigo-600 text-xxs px-2 py-0-5 rounded font-black uppercase">Admin</text>
                        </view>
                        <text class="text-xs text-slate-400 block">Level {{ u.level }} • {{ u.xp }} XP</text>
                    </view>
                </view>
                
                <view class="flex items-center gap-3 w-full md_w-auto">
                    <button 
                        @click="toggleBan(u)"
                        class="p-2 rounded-lg transition-colors border active_scale-95"
                        :class="u.role === 'BANNED' ? 'bg-green-50 text-green-500 hover_bg-green-100 border-green-100' : 'bg-rose-50 text-rose-500 hover_bg-rose-100 border-rose-100'"
                    >
                        <text>{{ u.role === 'BANNED' ? 'V' : 'X' }}</text>
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>
