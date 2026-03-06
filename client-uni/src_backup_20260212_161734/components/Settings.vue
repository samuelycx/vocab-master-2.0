<script setup>
import { ref } from 'vue';
import { GameState, Actions } from '../state.js';
import { API } from '../api.js';

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
const showResetConfirm = ref(false);
const resetLoading = ref(false);

const toggleSound = () => {
    Actions.updateSettings('soundEnabled', !settings.soundEnabled);
};

const setTheme = (theme) => {
    Actions.updateSettings('theme', theme);
};

const handleReset = async () => {
    resetLoading.value = true;
    try {
        const res = await API.resetProgress(GameState.user.id);
        if (res && res.success) {
            Actions.reset();
            // Reload page in Uni-app way
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
    uni.removeStorageSync('vocab_user');
    uni.reLaunch({ url: '/pages/index/index' });
};

const adminClickCount = ref(0);
const handleSecretAdmin = () => {
    adminClickCount.value++;
    if (adminClickCount.value >= 5) {
        Actions.setView('admin-dashboard');
        adminClickCount.value = 0;
    }
};
</script>

<template>
    <view class="flex-1 flex flex-col p-4 md_p-6 w-full max-w-5xl mx-auto h-full overflow-hidden bg-background relative z-30 transition-colors">
        <!-- Header -->
        <view class="flex items-center gap-4 mb-6">
            <button @click="handleBack" class="w-10 h-10 rounded-full bg-surface border var(--border-style) flex items-center justify-center text-slate-500 hover_text-primary active_scale-95 transition-all shadow-sm">
                <text>⬅️</text>
            </button>
            <text class="text-2xl font-black text-color block">设置</text>
        </view>

        <view class="flex-1 overflow-y-auto flex flex-col gap-6">
            <!-- Preferences -->
            <view>
                <text class="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-2 block">偏好设置</text>
                <view class="theme-card">
                    <!-- Sound -->
                    <view class="p-4 flex justify-between items-center border-b border-slate-50 border-slate-700">
                        <view class="flex items-center gap-3">
                            <view class="w-10 h-10 rounded-full bg-indigo-50 bg-indigo-opacity-30 flex items-center justify-center text-indigo-500 text-indigo-400">
                                <text>{{ settings.soundEnabled ? '🔊' : '🔇' }}</text>
                            </view>
                            <view>
                                <text class="font-bold text-slate-800 text-white block">音效</text>
                                <text class="text-xs text-slate-400 text-slate-500 block">开启游戏声音效果</text>
                            </view>
                        </view>
                        <button 
                            @click="toggleSound"
                            class="w-12 h-6 rounded-full transition-colors relative"
                            :class="settings.soundEnabled ? 'bg-primary' : 'bg-slate-200 bg-slate-600'"
                        >
                            <view 
                                class="w-5 h-5 bg-white rounded-full absolute top-0-5 transition-transform shadow-sm"
                                :class="settings.soundEnabled ? 'left-safe-toggle-on' : 'left-safe-toggle-off'"
                            ></view>
                        </button>
                    </view>

                    <!-- Theme Selection (Visual) -->
                    <view class="p-4 border-b border-slate-50 dark_border-white-opacity-5">
                        <view class="flex items-center gap-3 mb-4">
                            <view class="w-10 h-10 rounded-full bg-indigo-50 dark_bg-indigo-opacity-30 flex items-center justify-center text-indigo-500 dark_text-indigo-400">
                                <text>🎨</text>
                            </view>
                            <view>
                                <text class="font-bold text-slate-800 dark_text-white block">界面主题</text>
                                <text class="text-xs text-slate-400 dark_text-slate-500 block">选择你喜欢的风格</text>
                            </view>
                        </view>
                        
                        <view class="grid grid-cols-1 md_grid-cols-3 gap-4">
                             <!-- Classic Green -->
                             <view @click="setTheme('academic')" class="cursor-pointer group relative">
                                <view class="aspect-16-10 rounded-xl overflow-hidden border-4 transition-all shadow-md"
                                    :class="settings.theme === 'academic' ? 'border-academic-accent ring-4 ring-green-opacity-20' : 'border-transparent hover_border-gray-200'">
                                    <view class="w-full h-full bg-academic-bg p-3 flex flex-col gap-2 relative">
                                        <view class="absolute top-2 right-2 w-6 h-6 bg-academic-accent rounded-full flex items-center justify-center text-dark-academic text-xs font-bold" v-if="settings.theme === 'academic'">✓</view>
                                        <view class="h-2 w-1-3 bg-green-opacity-20 rounded-full"></view>
                                        <view class="flex-1 bg-white rounded-lg border border-gray-100 p-2 flex gap-2">
                                            <view class="w-6 h-6 rounded-full bg-academic-accent"></view>
                                            <view class="flex-1 flex flex-col gap-1">
                                                <view class="h-1-5 w-3-4 bg-gray-100 rounded-full"></view>
                                                <view class="h-1-5 w-1-2 bg-gray-100 rounded-full"></view>
                                            </view>
                                        </view>
                                    </view>
                                </view>
                                <view class="mt-2 text-center text-sm font-bold text-slate-700 dark_text-slate-300">Classic Green</view>
                             </view>

                             <!-- Sunset Orange -->
                             <view @click="setTheme('playful')" class="cursor-pointer group relative">
                                <view class="aspect-16-10 rounded-xl overflow-hidden border-4 transition-all shadow-md"
                                    :class="settings.theme === 'playful' ? 'border-playful-accent ring-4 ring-orange-opacity-20' : 'border-transparent hover_border-gray-200'">
                                    <view class="w-full h-full bg-playful-bg p-3 flex flex-col gap-2 relative">
                                        <view class="absolute top-2 right-2 w-6 h-6 bg-playful-accent rounded-full flex items-center justify-center text-white text-xs font-bold" v-if="settings.theme === 'playful'">✓</view>
                                        <view class="h-2 w-1-3 bg-orange-opacity-20 rounded-full"></view>
                                        <view class="flex-1 bg-white rounded-lg border border-orange-100 p-2 flex gap-2">
                                            <view class="w-6 h-6 rounded-full bg-playful-accent"></view>
                                            <view class="flex-1 flex flex-col gap-1">
                                                <view class="h-1-5 w-3-4 bg-orange-50 rounded-full"></view>
                                                <view class="h-1-5 w-1-2 bg-orange-50 rounded-full"></view>
                                            </view>
                                        </view>
                                    </view>
                                </view>
                                <view class="mt-2 text-center text-sm font-bold text-slate-700 dark_text-slate-300">Sunset Orange</view>
                             </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- Account -->
            <view>
                <text class="text-sm font-bold text-slate-400 text-slate-500 uppercase tracking-wider mb-3 px-2 block">账户</text>
                <view class="bg-white bg-slate-800 rounded-2xl shadow-sm border border-slate-100 border-slate-700 overflow-hidden transition-colors">
                    <view class="p-4 flex justify-between items-center border-b border-slate-50 border-slate-700">
                        <view class="flex items-center gap-3">
                            <view class="w-10 h-10 rounded-full bg-slate-100 bg-slate-700 flex items-center justify-center text-slate-500 text-slate-400">
                                <text>👤</text>
                            </view>
                            <view>
                                <text class="font-bold text-slate-800 text-white block">用户名</text>
                                <text class="text-xs text-slate-400 text-slate-500 block">{{ GameState.user.username }}</text>
                            </view>
                        </view>
                    </view>
                    
                    <button @click="logout" class="w-full p-4 text-left font-bold text-slate-600 text-slate-300 hover_bg-slate-50 hover_bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-50 border-slate-700">
                        <view class="w-10 h-10 rounded-full bg-slate-100 bg-slate-700 flex items-center justify-center text-slate-500 text-slate-400">
                            <text>🚪</text>
                        </view>
                        退出登录
                    </button>

                    <button @click="Actions.setView('admin-dashboard')" class="w-full p-4 text-left font-bold text-indigo-500 hover_bg-indigo-50 hover_bg-indigo-opacity-10 transition-colors flex items-center gap-3">
                        <view class="w-10 h-10 rounded-full bg-indigo-50 bg-indigo-opacity-30 flex items-center justify-center text-indigo-500 shadow-sm shadow-indigo-100 shadow-none">
                            <text>🛡️</text>
                        </view>
                        管理后台
                    </button>
                </view>
            </view>

            <!-- Danger Zone -->
            <view>
                <text class="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 px-2 block">危险区域</text>
                <view class="bg-white bg-slate-800 rounded-2xl shadow-sm border border-rose-100 border-rose-900 overflow-hidden transition-colors">
                    <button @click="showResetConfirm = true" class="w-full p-4 text-left font-bold text-rose-500 hover_bg-rose-50 hover_bg-rose-opacity-20 transition-colors flex items-center gap-3">
                        <view class="w-10 h-10 rounded-full bg-rose-100 bg-rose-opacity-30 flex items-center justify-center text-rose-500">
                            <text>🗑️</text>
                        </view>
                        <view>
                            <text class="block">重置学习进度</text>
                            <text class="text-xs text-rose-300 font-normal block">清空所有单词记录和等级（不可恢复）</text>
                        </view>
                    </button>
                </view>
            </view>

            <view @click="handleSecretAdmin" class="text-center text-slate-300 text-xs py-8 cursor-pointer select-none">
                Vocab Master v2.0
            </view>
        </view>

        <!-- Confirm Modal -->
        <view v-if="showResetConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black-opacity-50 backdrop-blur-sm p-4">
            <view class="bg-white bg-slate-800 rounded-3xl p-6 w-full max-w-sm animate-pop border border-slate-100 border-slate-700 shadow-xl">
                <text class="text-xl font-black text-slate-800 text-white mb-2 block">确定要重置吗？</text>
                <text class="text-slate-500 text-slate-400 mb-6 block">此操作将清空你所有的学习记录、等级和成就。此操作无法撤销。</text>
                <view class="flex gap-3">
                    <button @click="showResetConfirm = false" class="flex-1 py-3 font-bold text-slate-500 text-slate-300 bg-slate-100 bg-slate-700 rounded-xl transition-colors">取消</button>
                    <button @click="handleReset" class="flex-1 py-3 font-bold text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-200 shadow-rose-opacity-30 transition-colors" :disabled="resetLoading">
                        {{ resetLoading ? '重置中...' : '确定重置' }}
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>
