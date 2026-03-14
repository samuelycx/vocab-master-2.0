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
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div class="flex justify-between items-start mb-4">
                <div class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Users</div>
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:rotate-12">
                    <i class="fas fa-users"></i>
                </div>
            </div>
            <div>
                <div class="text-4xl font-black text-slate-800 dark:text-white">{{ stats.totalUsers }}</div>
                <div class="text-[10px] text-green-500 font-black mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <i class="fas fa-arrow-up"></i> 12% increase
                </div>
            </div>
        </div>

        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div class="flex justify-between items-start mb-4">
                <div class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Active Today</div>
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transition-transform group-hover:rotate-12">
                    <i class="fas fa-chart-line"></i>
                </div>
            </div>
            <div>
                <div class="text-4xl font-black text-slate-800 dark:text-white">{{ stats.activeToday }}</div>
                <div class="text-[10px] text-emerald-500 font-black mt-2 uppercase tracking-wider">Daily Activity</div>
            </div>
        </div>

        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div class="flex justify-between items-start mb-4">
                <div class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Words</div>
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-200 dark:shadow-none transition-transform group-hover:rotate-12">
                    <i class="fas fa-book"></i>
                </div>
            </div>
            <div>
                <div class="text-4xl font-black text-slate-800 dark:text-white">{{ stats.totalWords }}</div>
                <div class="text-[10px] text-sky-500 font-black mt-2 uppercase tracking-wider">4 Books Loaded</div>
            </div>
        </div>

        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
            <div class="flex justify-between items-start mb-4">
                <div class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">System Health</div>
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none transition-transform group-hover:rotate-12">
                    <i class="fas fa-heartbeat"></i>
                </div>
            </div>
            <div>
                <div class="text-4xl font-black text-slate-800 dark:text-white">98.2%</div>
                <div class="text-[10px] text-green-500 font-black mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Operational
                </div>
            </div>
        </div>
    </div>
</template>
