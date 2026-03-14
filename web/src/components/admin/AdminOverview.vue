<script setup>
import { computed } from 'vue';
import { GameState } from '../../state.js';
import DashboardWidgets from './DashboardWidgets.vue';
import AdminCharts from './AdminCharts.vue';

// Mock data for now, real data integration later
const stats = {
    totalUsers: 142,
    activeToday: 28,
    totalWords: 1250,
    reportCount: 3
};

const activityFeed = [
    { id: 1, user: 'User_88', action: 'Leveled up to Lvl 5', time: '10 mins ago', icon: 'fas fa-arrow-up', color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
    { id: 2, user: 'VocabMaster', action: 'Added 50 new words', time: '1 hour ago', icon: 'fas fa-plus', color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20' },
    { id: 3, user: 'NewUser_99', action: 'Registered', time: '2 hours ago', icon: 'fas fa-user-plus', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' },
    { id: 4, user: 'User_42', action: 'Completed Daily Challenge', time: '3 hours ago', icon: 'fas fa-check', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20' }
];

</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2">概览</h2>
            <p class="text-slate-500 dark:text-slate-400">Welcome back, Administrator.</p>
        </div>

        <!-- Stats Grid -->
        <DashboardWidgets :stats="stats" />

        <!-- Charts Section -->
        <AdminCharts />

        <!-- Activity Feed -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 class="font-bold text-slate-800 dark:text-white mb-6">最近动态</h3>
            <div class="space-y-6">
                <div v-for="item in activityFeed" :key="item.id" class="flex gap-4">
                    <div :class="item.color" class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <i :class="item.icon"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">
                            <span class="font-bold">{{ item.user }}</span> {{ item.action }}
                        </div>
                        <div class="text-xs text-slate-400 mt-1">{{ item.time }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
