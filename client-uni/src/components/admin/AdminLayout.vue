<script setup>
import { GameState, Actions } from '../../state.js';
const user = GameState.user;
const props = defineProps({
    currentTab: String,
    onTabChange: Function
});

const menuItems = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'words', label: '单词', icon: 'W' },
    { id: 'users', label: '用户', icon: '👥' },
    { id: 'modules', label: '设置', icon: '⚙️' }
];
</script>

<template>
    <view class="flex h-screen w-full bg-slate-50 dark_bg-slate-950 overflow-hidden">
        <!-- Sidebar -->
        <view class="w-64 bg-surface border-r border-slate-200 dark_border-slate-800 flex flex-col hidden md_flex z-20">
            <view class="p-6 border-b border-slate-100 dark_border-slate-800 flex items-center gap-3">
                <view class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark_shadow-none">
                    <text>🛡️</text>
                </view>
                <view>
                    <text class="font-black text-slate-800 dark_text-white leading-tight block">Admin</text>
                    <text class="text-xs text-slate-400 font-bold uppercase tracking-wider block">Dashboard</text>
                </view>
            </view>

            <view class="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                <button 
                    v-for="item in menuItems" 
                    :key="item.id"
                    @click="onTabChange(item.id)"
                    class="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm active_scale-95"
                    :class="currentTab === item.id 
                        ? 'bg-indigo-50 dark_bg-indigo-opacity-20 text-indigo-600 dark_text-indigo-400 shadow-sm' 
                        : 'text-slate-500 dark_text-slate-400'"
                >
                    <text :class="{ 'scale-110': currentTab === item.id }" class="w-5 text-center text-lg transition-transform block">{{ item.icon }}</text>
                    <text>{{ item.label }}</text>
                </button>
            </view>

            <view class="p-4 border-t border-slate-100 dark_border-slate-800">
                <view class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark_bg-slate-dark-opacity-50">
                    <view class="w-10 h-10 rounded-full bg-white dark_bg-slate-700 flex items-center justify-center border border-slate-200 dark_border-slate-600 text-lg">
                        <text>{{ user.avatar }}</text>
                    </view>
                    <view class="flex-1 min-w-0">
                        <text class="font-bold text-slate-700 dark_text-slate-200 truncate block">{{ user.username }}</text>
                        <text class="text-xs text-slate-400 truncate block">Administrator</text>
                    </view>
                </view>
                <button @click="Actions.setView('settings')" class="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 active_text-rose-500 transition-colors text-sm font-bold py-2">
                    <text>🚪</text>
                    <text>退出管理后台</text>
                </button>
            </view>
        </view>

        <!-- Main Content -->
        <view class="flex-1 flex flex-col h-full overflow-hidden relative">
            <!-- Mobile Header -->
            <view class="md_hidden h-16 bg-surface border-b border-slate-200 dark_border-slate-800 flex items-center justify-between px-4 z-20">
                <view class="flex items-center gap-3">
                    <view class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm shadow">
                        <text>🛡️</text>
                    </view>
                    <text class="font-black text-slate-800 dark_text-white block">Admin Dashboard</text>
                </view>
                <button @click="Actions.setView('settings')" class="text-slate-400">
                    <text class="text-xl">❌</text>
                </button>
            </view>
            
            <!-- Mobile Nav (Horizontal) -->
            <view class="md_hidden bg-surface border-b border-slate-200 dark_border-slate-800 overflow-x-auto">
                <view class="flex p-2 gap-2 min-w-max">
                    <button 
                        v-for="item in menuItems" 
                        :key="item.id"
                        @click="onTabChange(item.id)"
                        class="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2"
                        :class="currentTab === item.id 
                            ? 'bg-indigo-500 text-white shadow-md' 
                            : 'bg-slate-50 dark_bg-slate-800 text-slate-500 dark_text-slate-400'"
                    >
                        <text>{{ item.icon }}</text>
                        <text>{{ item.label }}</text>
                    </button>
                </view>
            </view>

            <view class="flex-1 overflow-y-auto p-4 md_p-8 relative">
                <view :key="currentTab" class="h-full">
                    <slot></slot>
                </view>
            </view>
        </view>
    </view>
</template>
