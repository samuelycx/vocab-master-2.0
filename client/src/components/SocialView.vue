<script setup>
import { ref, onMounted, computed } from 'vue';
import { API } from '../api.js';
import { GameState, Actions } from '../state.js';

const user = computed(() => GameState.user);
const activeTab = computed({
    get: () => GameState.game.social.activeTab,
    set: (val) => Actions.setSocialTab(val)
});
const leaderboard = ref([]);
const friends = ref({ following: [], followers: [] });
const searchResults = ref([]);
const feed = ref([]);
const searchQuery = ref('');
const loading = ref(false);

const loadSocialData = async () => {
    if (!user.value?.id) return;
    loading.value = true;
    try {
        const [feedData, friendsData, lbData] = await Promise.all([
            API.getSocialFeed(user.value.id),
            API.getFriends(user.value.id),
            API.getLeaderboard()
        ]);
        feed.value = feedData || [];
        friends.value = friendsData || { following: [], followers: [] };
        leaderboard.value = lbData || [];
    } catch (e) {
        console.error('Failed to load social data', e);
    } finally {
        loading.value = false;
    }
};

const handleSearch = async () => {
    if (!searchQuery.value) {
        searchResults.value = [];
        return;
    }
    loading.value = true;
    searchResults.value = await API.searchUsers(searchQuery.value);
    loading.value = false;
};

const follow = async (targetId) => {
    if (!user.value?.id) return;
    const res = await API.followUser(user.value.id, targetId);
    if (res) {
        await loadSocialData();
        if (activeTab.value === 'search') handleSearch();
    }
};

const unfollow = async (targetId) => {
    if (!user.value?.id) return;
    const res = await API.unfollowUser(user.value.id, targetId);
    if (res) {
        await loadSocialData();
        if (activeTab.value === 'search') handleSearch();
    }
};

const isFollowing = (userId) => {
    return friends.value.following.some(f => f.id === userId);
};

const formatTime = (ts) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

onMounted(loadSocialData);
</script>

<template>
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col p-4 md:p-8">
        <div class="max-w-4xl mx-auto w-full space-y-8 flex-1 flex flex-col">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button @click="Actions.setView('dashboard')" class="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-transform">
                        <span class="text-xl">🔙</span>
                    </button>
                    <div>
                        <h1 class="text-3xl font-black text-slate-800 dark:text-white">社交朋友圈</h1>
                        <p class="text-slate-500 dark:text-slate-400">发现新朋友，分享学习进度</p>
                    </div>
                </div>
                
                <div class="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
                    <button 
                        @click="activeTab = 'feed'"
                        :class="activeTab === 'feed' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        动态
                    </button>
                    <button 
                        @click="activeTab = 'leaderboard'"
                        :class="activeTab === 'leaderboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        榜单
                    </button>
                    <button 
                        @click="activeTab = 'friends'"
                        :class="activeTab === 'friends' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        好友
                    </button>
                    <button 
                        @click="activeTab = 'search'"
                        :class="activeTab === 'search' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        探索
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto no-scrollbar pb-10">
                
                <!-- Loading State -->
                <div v-if="loading && activeTab !== 'search'" class="py-20 text-center">
                    <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                </div>

                <div v-else>
                    <!-- Activity Feed -->
                    <div v-if="activeTab === 'feed'" class="space-y-4">
                        <div v-for="item in feed" :key="item.id" 
                            class="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 animate-slide-up">
                            <div class="text-3xl w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                {{ item.avatar }}
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start mb-1">
                                    <span class="font-black text-slate-800 dark:text-white">{{ item.username }}</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase">{{ formatTime(item.timestamp) }}</span>
                                </div>
                                <div class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {{ item.title }}
                                    <div v-if="item.description" class="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl italic text-xs border border-slate-100 dark:border-slate-700">
                                        "{{ item.description }}"
                                    </div>
                                </div>
                                <div v-if="item.type === 'ACHIEVEMENT'" class="mt-3 inline-block p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                    <span class="text-2xl">{{ item.icon }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="feed.length === 0" class="py-20 text-center text-slate-400">
                            <span class="text-5xl block mb-4">📭</span>
                            <p class="font-bold">还没有好友动态，去探索新朋友吧</p>
                        </div>
                    </div>

                    <!-- Leaderboard -->
                    <div v-if="activeTab === 'leaderboard'" class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
                        <div v-for="(u, index) in leaderboard" :key="u.id" class="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div class="flex items-center gap-4">
                                <div class="w-8 text-center font-black text-slate-300 dark:text-slate-700 italic text-xl">
                                    {{ index + 1 }}
                                </div>
                                <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                    {{ u.avatar }}
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        {{ u.username }}
                                        <span v-if="u.id === user?.id" class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">我</span>
                                    </div>
                                    <div class="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Level {{ u.level }} • {{ u.streak }} 天连胜</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-black text-indigo-500">{{ u.xp }}</div>
                                <div class="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Total XP</div>
                            </div>
                        </div>
                    </div>

                    <!-- Friends List -->
                    <div v-if="activeTab === 'friends'" class="space-y-8">
                        <div>
                            <h3 class="font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-4 pl-4">你的关注 ({{ friends.following.length }})</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="f in friends.following" :key="f.id" class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner">{{ f.avatar }}</div>
                                        <div>
                                            <div class="font-bold text-sm text-slate-800 dark:text-white">{{ f.username }}</div>
                                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lv.{{ f.level }} • {{ f.xp }} XP</div>
                                        </div>
                                    </div>
                                    <button @click="unfollow(f.id)" class="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-xl transition-colors">取消关注</button>
                                </div>
                                <div v-if="friends.following.length === 0" class="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 italic text-sm">
                                    还没有关注任何人
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-4 pl-4">你的粉丝 ({{ friends.followers.length }})</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="f in friends.followers" :key="f.id" class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner">{{ f.avatar }}</div>
                                        <div>
                                            <div class="font-bold text-sm text-slate-800 dark:text-white">{{ f.username }}</div>
                                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Lv.{{ f.level }} • {{ f.xp }} XP</div>
                                        </div>
                                    </div>
                                    <button 
                                        v-if="!isFollowing(f.id)"
                                        @click="follow(f.id)" 
                                        class="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-2 rounded-xl transition-colors"
                                    >
                                        回粉
                                    </button>
                                    <div v-else class="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">互相关注</div>
                                </div>
                                <div v-if="friends.followers.length === 0" class="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 italic text-sm">
                                    还没有粉丝
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Search / Explore -->
                    <div v-if="activeTab === 'search'" class="space-y-8">
                        <div class="relative group">
                            <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input 
                                v-model="searchQuery"
                                @input="handleSearch"
                                type="text" 
                                placeholder="通过用户名搜索全世界的同学..." 
                                class="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-900 border-none rounded-3xl shadow-sm focus:ring-4 ring-indigo-500/10 outline-none transition-all font-bold placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-600"
                            />
                        </div>

                        <div v-if="loading" class="py-10 text-center">
                            <div class="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        </div>

                        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="u in searchResults" :key="u.id" class="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-0.5">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner">{{ u.avatar }}</div>
                                    <div>
                                        <div class="font-bold text-sm text-slate-800 dark:text-white">{{ u.username }}</div>
                                        <div class="text-[10px] text-slate-400 font-bold uppercase italic tracking-tighter">Level {{ u.level }}</div>
                                    </div>
                                </div>
                                
                                <div v-if="u.id === user?.id">
                                    <span class="text-[10px] font-black text-slate-200 uppercase tracking-widest">你自己</span>
                                </div>
                                <button 
                                    v-else-if="!isFollowing(u.id)"
                                    @click="follow(u.id)"
                                    class="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                                >
                                    关注
                                </button>
                                <button 
                                    v-else
                                    @click="unfollow(u.id)"
                                    class="text-rose-500 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl transition-all"
                                >
                                    已关注
                                </button>
                            </div>
                            <div v-if="searchQuery && searchResults.length === 0 && !loading" class="col-span-full py-20 text-center text-slate-300 italic">
                                没有找到匹配的小伙伴哦
                            </div>
                            <div v-if="!searchQuery" class="col-span-full py-20 text-center">
                                <div class="text-4xl mb-4">🌍</div>
                                <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">探索更大更广阔的社交圈</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.animate-slide-up {
    animation: slideUp 0.4s ease-out forwards;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
