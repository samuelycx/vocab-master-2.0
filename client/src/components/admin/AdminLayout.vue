<script setup>
import { ref } from 'vue';
import { GameState, Actions } from '../../state.js';

const props = defineProps({
    currentTab: String,
    onTabChange: Function
});

const user = GameState.user;

const menuItems = [
    { id: 'overview', label: '仪表盘', icon: 'fas fa-chart-pie' },
    { id: 'words', label: '单词管理', icon: 'fas fa-book' },
    { id: 'users', label: '用户管理', icon: 'fas fa-users' },
    { id: 'modules', label: '功能开关', icon: 'fas fa-toggle-on' }
];
</script>

<template>
    <div class="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex z-20">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div>
                    <h1 class="font-black text-slate-800 dark:text-white leading-tight">Admin</h1>
                    <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Dashboard</div>
                </div>
            </div>

            <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                <button 
                    v-for="item in menuItems" 
                    :key="item.id"
                    @click="onTabChange(item.id)"
                    class="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm hover:scale-[1.02] active:scale-[0.98]"
                    :class="currentTab === item.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'"
                >
                    <i :class="[item.icon, { 'scale-110': currentTab === item.id }]" class="w-5 text-center text-lg transition-transform"></i>
                    {{ item.label }}
                </button>
            </nav>

            <div class="p-4 border-t border-slate-100 dark:border-slate-700">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center border border-slate-200 dark:border-slate-500 text-lg">
                        {{ user.avatar }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-slate-700 dark:text-slate-200 truncate">{{ user.username }}</div>
                        <div class="text-xs text-slate-400 truncate">Administrator</div>
                    </div>
                </div>
                <button @click="Actions.setView('settings')" class="w-full mt-3 flex items-center justify-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold py-2">
                    <i class="fas fa-sign-out-alt"></i> 退出管理后台
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col h-full overflow-hidden relative">
            <!-- Mobile Header -->
            <header class="md:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm shadow">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <span class="font-black text-slate-800 dark:text-white">Admin Dashboard</span>
                </div>
                <button @click="Actions.setView('settings')" class="text-slate-400 hover:text-rose-500">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </header>
            
            <!-- Mobile Nav (Horizontal) -->
            <div class="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <div class="flex p-2 gap-2 min-w-max">
                    <button 
                        v-for="item in menuItems" 
                        :key="item.id"
                        @click="onTabChange(item.id)"
                        class="px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2"
                        :class="currentTab === item.id 
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
                    >
                        <i :class="item.icon"></i>
                        {{ item.label }}
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 md:p-8 relative">
                <transition 
                    enter-active-class="transition duration-300 ease-out" 
                    enter-from-class="transform translate-y-4 opacity-0" 
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-200 ease-in" 
                    leave-from-class="transform translate-y-0 opacity-100" 
                    leave-to-class="transform -translate-y-4 opacity-0"
                    mode="out-in"
                >
                    <div :key="currentTab" class="h-full">
                        <slot></slot>
                    </div>
                </transition>
            </div>
        </main>
    </div>
</template>
