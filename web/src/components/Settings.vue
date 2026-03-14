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
            // Use the comprehensive reset action
            Actions.reset();
            // Reload page to reset state completely
            window.location.reload();
        }
    } catch (e) {
        console.error('Reset failed', e);
    } finally {
        resetLoading.value = false;
        showResetConfirm.value = false;
    }
};

const logout = () => {
    localStorage.removeItem('vocab_user');
    window.location.reload();
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
    <div class="flex-1 flex flex-col p-4 md:p-6 w-full max-w-5xl mx-auto h-full overflow-hidden bg-background relative z-30 transition-colors">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
            <button @click="handleBack" class="w-10 h-10 rounded-full bg-surface border var(--border-style) flex items-center justify-center text-slate-500 hover:text-primary active:scale-95 transition-all shadow-sm">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-2xl font-black text-color">设置</h1>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6">
            <!-- Preferences -->
            <section>
                <h3 class="text-sm font-bold text-muted uppercase tracking-wider mb-3 px-2">偏好设置</h3>
                <div class="theme-card">
                    <!-- Sound -->
                    <div class="p-4 flex justify-between items-center border-b border-slate-50 border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 bg-indigo-900/30 flex items-center justify-center text-indigo-500 text-indigo-400">
                                <i class="fas" :class="settings.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'"></i>
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 text-white">音效</div>
                                <div class="text-xs text-slate-400 text-slate-500">开启游戏声音效果</div>
                            </div>
                        </div>
                        <button 
                            @click="toggleSound"
                            class="w-12 h-6 rounded-full transition-colors relative"
                            :class="settings.soundEnabled ? 'bg-primary' : 'bg-slate-200 bg-slate-600'"
                        >
                            <div 
                                class="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm"
                                :class="settings.soundEnabled ? 'left-[calc(100%-1.35rem)]' : 'left-0.5'"
                            ></div>
                        </button>
                    </div>

                    <!-- Theme Selection (Visual) -->
                    <div class="p-4 border-b border-slate-50 dark:border-white/5">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                                <i class="fas fa-palette"></i>
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 dark:text-white">界面主题</div>
                                <div class="text-xs text-slate-400 dark:text-slate-500">选择你喜欢的风格</div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <!-- Classic Green -->
                             <div @click="setTheme('academic')" class="cursor-pointer group relative">
                                <div class="aspect-[16/10] rounded-xl overflow-hidden border-4 transition-all shadow-md"
                                    :class="settings.theme === 'academic' ? 'border-[#25f46a] ring-4 ring-[#25f46a]/20' : 'border-transparent hover:border-gray-200'">
                                    <div class="w-full h-full bg-[#f5f8f6] p-3 flex flex-col gap-2 relative">
                                        <div class="absolute top-2 right-2 w-6 h-6 bg-[#25f46a] rounded-full flex items-center justify-center text-[#0d1c12] text-xs font-bold" v-if="settings.theme === 'academic'">✓</div>
                                        <div class="h-2 w-1/3 bg-[#25f46a]/20 rounded-full"></div>
                                        <div class="flex-1 bg-white rounded-lg border border-gray-100 p-2 flex gap-2">
                                            <div class="w-6 h-6 rounded-full bg-[#25f46a]"></div>
                                            <div class="flex-1 space-y-1">
                                                <div class="h-1.5 w-3/4 bg-gray-100 rounded-full"></div>
                                                <div class="h-1.5 w-1/2 bg-gray-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300">Classic Green</div>
                             </div>



                             <!-- Sunset Orange -->
                             <div @click="setTheme('playful')" class="cursor-pointer group relative">
                                <div class="aspect-[16/10] rounded-xl overflow-hidden border-4 transition-all shadow-md"
                                    :class="settings.theme === 'playful' ? 'border-[#f97316] ring-4 ring-[#f97316]/20' : 'border-transparent hover:border-gray-200'">
                                    <div class="w-full h-full bg-[#fff7ed] p-3 flex flex-col gap-2 relative">
                                        <div class="absolute top-2 right-2 w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center text-white text-xs font-bold" v-if="settings.theme === 'playful'">✓</div>
                                        <div class="h-2 w-1/3 bg-[#f97316]/20 rounded-full"></div>
                                        <div class="flex-1 bg-white rounded-lg border border-orange-100 p-2 flex gap-2">
                                            <div class="w-6 h-6 rounded-full bg-[#f97316]"></div>
                                            <div class="flex-1 space-y-1">
                                                <div class="h-1.5 w-3/4 bg-orange-50 rounded-full"></div>
                                                <div class="h-1.5 w-1/2 bg-orange-50 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 text-center text-sm font-bold text-slate-700 dark:text-slate-300">Sunset Orange</div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Account -->
            <section>
                <h3 class="text-sm font-bold text-slate-400 text-slate-500 uppercase tracking-wider mb-3 px-2">账户</h3>
                <div class="bg-white bg-slate-800 rounded-2xl shadow-sm border border-slate-100 border-slate-700 overflow-hidden transition-colors">
                    <div class="p-4 flex justify-between items-center border-b border-slate-50 border-slate-700">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-100 bg-slate-700 flex items-center justify-center text-slate-500 text-slate-400">
                                <i class="fas fa-user"></i>
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 text-white">用户名</div>
                                <div class="text-xs text-slate-400 text-slate-500">{{ GameState.user.username }}</div>
                            </div>
                        </div>
                    </div>
                    
                    <button @click="logout" class="w-full p-4 text-left font-bold text-slate-600 text-slate-300 hover:bg-slate-50 hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-50 border-slate-700">
                        <div class="w-10 h-10 rounded-full bg-slate-100 bg-slate-700 flex items-center justify-center text-slate-500 text-slate-400">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        退出登录
                    </button>

                    <button @click="Actions.setView('admin-dashboard')" class="w-full p-4 text-left font-bold text-indigo-500 hover:bg-indigo-50 hover:bg-indigo-900/10 transition-colors flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-50 bg-indigo-900/30 flex items-center justify-center text-indigo-500 shadow-sm shadow-indigo-100 shadow-none">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        管理后台
                    </button>
                </div>
            </section>

            <!-- Danger Zone -->
            <section>
                <h3 class="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 px-2">危险区域</h3>
                <div class="bg-white bg-slate-800 rounded-2xl shadow-sm border border-rose-100 border-rose-900 overflow-hidden transition-colors">
                    <button @click="showResetConfirm = true" class="w-full p-4 text-left font-bold text-rose-500 hover:bg-rose-50 hover:bg-rose-900/20 transition-colors flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-rose-100 bg-rose-900/30 flex items-center justify-center text-rose-500">
                            <i class="fas fa-trash-alt"></i>
                        </div>
                        <div>
                            <div>重置学习进度</div>
                            <div class="text-xs text-rose-300 font-normal">清空所有单词记录和等级（不可恢复）</div>
                        </div>
                    </button>
                </div>
            </section>

            <div @click="handleSecretAdmin" class="text-center text-slate-300 text-xs py-8 cursor-pointer select-none">
                Vocab Master v2.0
            </div>
        </div>

        <!-- Confirm Modal -->
        <div v-if="showResetConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-white bg-slate-800 rounded-3xl p-6 w-full max-w-sm animate-pop border border-slate-100 border-slate-700 shadow-xl">
                <h3 class="text-xl font-black text-slate-800 text-white mb-2">确定要重置吗？</h3>
                <p class="text-slate-500 text-slate-400 mb-6">此操作将清空你所有的学习记录、等级和成就。此操作无法撤销。</p>
                <div class="flex gap-3">
                    <button @click="showResetConfirm = false" class="flex-1 py-3 font-bold text-slate-500 text-slate-300 bg-slate-100 bg-slate-700 rounded-xl hover:bg-slate-200 hover:bg-slate-600 transition-colors">取消</button>
                    <button @click="handleReset" class="flex-1 py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-200 shadow-rose-900/30 transition-colors" :disabled="resetLoading">
                        {{ resetLoading ? '重置中...' : '确定重置' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
