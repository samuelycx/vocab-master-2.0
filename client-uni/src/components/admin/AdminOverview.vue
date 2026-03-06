<template>
    <view class="max-w-6xl mx-auto flex flex-col gap-8 animate-fade-in">
        <view>
            <text class="text-2xl md_text-3xl font-black text-slate-800 dark_text-white mb-2 block">概览</text>
            <text class="text-slate-500 dark_text-slate-400 block">Welcome back, Administrator.</text>
        </view>

        <!-- Stats Grid -->
        <DashboardWidgets :stats="stats" />

        <!-- Charts Section -->
        <AdminCharts />

        <!-- Activity Feed -->
        <view class="bg-surface rounded-2xl shadow-sm border border-slate-100 dark_border-slate-800 p-6">
            <text class="font-bold text-slate-800 dark_text-white mb-6 block">最近动态</text>
            <view class="flex flex-col gap-6">
                <view v-for="item in activityFeed" :key="item.id" class="flex gap-4">
                    <view :class="item.color" class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <text :class="item.icon"></text>
                    </view>
                    <view>
                        <view class="text-sm font-medium text-slate-800 dark_text-slate-200">
                            <text class="font-bold">{{ item.user }}</text>
                            <text>{{ item.action }}</text>
                        </view>
                        <text class="text-xs text-slate-400 mt-1 block">{{ item.time }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>
