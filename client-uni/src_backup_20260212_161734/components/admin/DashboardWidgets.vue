<script setup>
defineProps({
    stats: {
        type: Object,
        required: true,
        default: () => ({
            totalUsers: 0,
            activeToday: 0,
            totalWords: 0,
            reportCount: 0
        })
    }
});
</script>

<template>
    <view class="grid grid-cols-2 lg_grid-cols-4 gap-4 animate-fade-in">
        <view class="bg-surface backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark_border-slate-800 active_translate-y-1 transition-all group flex flex-col justify-between">
            <view class="flex justify-between items-start mb-4">
                <text class="text-slate-400 text-xxs font-black uppercase tracking-widest-2 block">Total Users</text>
                <view class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark_shadow-none transition-transform group-hover_rotate-12">
                    <text>👥</text>
                </view>
            </view>
            <view>
                <text class="text-4xl font-black text-slate-800 dark_text-white block">{{ stats.totalUsers }}</text>
                <view class="text-xxs text-green-500 font-black mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <text>⬆️</text>
                    <text>12% increase</text>
                </view>
            </view>
        </view>

        <view class="bg-surface backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark_border-slate-800 active_translate-y-1 transition-all group flex flex-col justify-between">
            <view class="flex justify-between items-start mb-4">
                <text class="text-slate-400 text-xxs font-black uppercase tracking-widest-2 block">Active Today</text>
                <view class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark_shadow-none transition-transform group-hover_rotate-12">
                    <text>📈</text>
                </view>
            </view>
            <view>
                <text class="text-4xl font-black text-slate-800 dark_text-white block">{{ stats.activeToday }}</text>
                <text class="text-xxs text-emerald-500 font-black mt-2 uppercase tracking-wider block">Daily Activity</text>
            </view>
        </view>

        <view class="bg-surface backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark_border-slate-800 active_translate-y-1 transition-all group flex flex-col justify-between">
            <view class="flex justify-between items-start mb-4">
                <text class="text-slate-400 text-xxs font-black uppercase tracking-widest-2 block">Total Words</text>
                <view class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-200 dark_shadow-none transition-transform group-hover_rotate-12">
                    <text>📚</text>
                </view>
            </view>
            <view>
                <text class="text-4xl font-black text-slate-800 dark_text-white block">{{ stats.totalWords }}</text>
                <text class="text-xxs text-sky-500 font-black mt-2 uppercase tracking-wider block">4 Books Loaded</text>
            </view>
        </view>

        <view class="bg-surface backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark_border-slate-800 active_translate-y-1 transition-all group flex flex-col justify-between">
            <view class="flex justify-between items-start mb-4">
                <text class="text-slate-400 text-xxs font-black uppercase tracking-widest-2 block">System Health</text>
                <view class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 dark_shadow-none transition-transform group-hover_rotate-12">
                    <text>💓</text>
                </view>
            </view>
            <view>
                <text class="text-4xl font-black text-slate-800 dark_text-white block">98.2%</text>
                <view class="text-xxs text-green-500 font-black mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <view class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></view>
                    <text>Operational</text>
                </view>
            </view>
        </view>
    </view>
</template>
