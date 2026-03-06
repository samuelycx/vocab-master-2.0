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
    <view class="bg-slate-50 dark_bg-slate-950 min-h-screen flex flex-col p-4 md_p-8">
        <view class="max-w-4xl mx-auto w-full flex flex-col gap-8 flex-1 flex flex-col">
            <!-- Header -->
            <view class="flex flex-col md_flex-row md_items-center justify-between gap-4">
                <view class="flex items-center gap-4">
                    <button @click="Actions.setView('dashboard')" class="p-2 bg-surface rounded-xl shadow-sm active_scale-95 transition-transform">
                        <text class="text-xl">🔙</text>
                    </button>
                    <view>
                        <text class="text-3xl font-black text-slate-800 dark_text-white block">社交朋友圈</text>
                        <text class="text-slate-500 dark_text-slate-400 block">发现新朋友，分享学习进度</text>
                    </view>
                </view>
                
                <view class="flex bg-slate-opacity-50 dark_bg-slate-800 p-1 rounded-xl overflow-x-auto">
                    <button 
                        @click="activeTab = 'feed'"
                        :class="activeTab === 'feed' ? 'bg-surface dark_bg-slate-700 shadow-sm text-indigo-600 dark_text-indigo-400' : 'text-slate-500'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        动态
                    </button>
                    <button 
                        @click="activeTab = 'leaderboard'"
                        :class="activeTab === 'leaderboard' ? 'bg-surface dark_bg-slate-700 shadow-sm text-indigo-600 dark_text-indigo-400' : 'text-slate-500'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        榜单
                    </button>
                    <button 
                        @click="activeTab = 'friends'"
                        :class="activeTab === 'friends' ? 'bg-surface dark_bg-slate-700 shadow-sm text-indigo-600 dark_text-indigo-400' : 'text-slate-500'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        好友
                    </button>
                    <button 
                        @click="activeTab = 'search'"
                        :class="activeTab === 'search' ? 'bg-surface dark_bg-slate-700 shadow-sm text-indigo-600 dark_text-indigo-400' : 'text-slate-500'"
                        class="px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
                    >
                        探索
                    </button>
                </view>
            </view>

            <!-- Content Area -->
            <view class="flex-1 pb-10">
                
                <!-- Loading State -->
                <view v-if="loading && activeTab !== 'search'" class="py-20 text-center">
                    <view class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></view>
                </view>

                <view v-else>
                    <!-- Activity Feed -->
                    <view v-if="activeTab === 'feed'" class="flex flex-col gap-4">
                        <view v-for="item in feed" :key="item.id" 
                            class="bg-surface p-4 rounded-3xl shadow-sm border border-slate-100 dark_border-slate-800 flex gap-4 animate-slide-up">
                            <view class="text-3xl w-14 h-14 bg-slate-50 dark_bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                <text>{{ item.avatar }}</text>
                            </view>
                            <view class="flex-1">
                                <view class="flex justify-between items-start mb-1">
                                    <text class="font-black text-slate-800 dark_text-white">{{ item.username }}</text>
                                    <text class="text-xxs text-slate-400 font-bold uppercase">{{ formatTime(item.timestamp) }}</text>
                                </view>
                                <view class="text-sm text-slate-600 dark_text-slate-400 leading-relaxed block">
                                    <text>{{ item.title }}</text>
                                    <view v-if="item.description" class="mt-2 p-3 bg-slate-50 dark_bg-slate-dark-opacity-50 rounded-2xl italic text-xs border border-slate-100 dark_border-slate-700">
                                        <text>"{{ item.description }}"</text>
                                    </view>
                                </view>
                                <view v-if="item.type === 'ACHIEVEMENT'" class="mt-3 inline-block p-2 bg-yellow-50 dark_bg-yellow-opacity-10 rounded-xl border border-yellow-100 dark_border-yellow-opacity-20">
                                    <text class="text-2xl">{{ item.icon }}</text>
                                </view>
                            </view>
                        </view>
                        <view v-if="feed.length === 0" class="py-20 text-center text-slate-400">
                            <text class="text-5xl block mb-4">📭</text>
                            <text class="font-bold block">还没有好友动态，去探索新朋友吧</text>
                        </view>
                    </view>

                    <!-- Leaderboard -->
                    <view v-if="activeTab === 'leaderboard'" class="bg-surface rounded-2-5rem shadow-sm border border-slate-100 dark_border-slate-800 overflow-hidden">
                        <view v-for="(u, index) in leaderboard" :key="u.id" class="p-4 md_p-6 flex items-center justify-between border-b border-slate-50 dark_border-slate-800 last_border-0">
                            <view class="flex items-center gap-4">
                                <view class="w-8 text-center font-black text-slate-300 dark_text-slate-700 italic text-xl">
                                    <text>{{ index + 1 }}</text>
                                </view>
                                <view class="w-12 h-12 bg-slate-100 dark_bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                    <text>{{ u.avatar }}</text>
                                </view>
                                <view>
                                    <view class="font-bold text-slate-800 dark_text-white flex items-center gap-2">
                                        <text>{{ u.username }}</text>
                                        <text v-if="u.id === user?.id" class="bg-indigo-100 dark_bg-indigo-opacity-30 text-indigo-600 dark_text-indigo-400 text-xxs px-2 py-0-5 rounded-full font-black uppercase">我</text>
                                    </view>
                                    <text class="text-xxs text-slate-400 font-bold tracking-wider uppercase block">Level {{ u.level }} • {{ u.streak }} 天连胜</text>
                                </view>
                            </view>
                            <view class="text-right">
                                <text class="text-xl font-black text-indigo-500 block">{{ u.xp }}</text>
                                <text class="text-xxs font-bold text-slate-300 uppercase tracking-widest leading-none block">Total XP</text>
                            </view>
                        </view>
                    </view>

                    <!-- Friends List -->
                    <view v-if="activeTab === 'friends'" class="flex flex-col gap-8">
                        <view>
                            <text class="font-black text-slate-400 text-xs uppercase tracking-widest-2 mb-4 pl-4 block">你的关注 ({{ friends.following.length }})</text>
                            <view class="grid grid-cols-1 md_grid-cols-2 gap-4">
                                <view v-for="f in friends.following" :key="f.id" class="flex items-center justify-between p-4 bg-surface rounded-3xl border border-slate-100 dark_border-slate-800 shadow-sm transition-all">
                                    <view class="flex items-center gap-3">
                                        <view class="w-12 h-12 bg-slate-50 dark_bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner"><text>{{ f.avatar }}</text></view>
                                        <view>
                                            <text class="font-bold text-sm text-slate-800 dark_text-white block">{{ f.username }}</text>
                                            <text class="text-xxs text-slate-400 font-bold uppercase tracking-tight block">Lv.{{ f.level }} • {{ f.xp }} XP</text>
                                        </view>
                                    </view>
                                    <button @click="unfollow(f.id)" class="text-xxs font-black uppercase tracking-widest text-rose-500 px-3 py-2 rounded-xl">取消关注</button>
                                </view>
                                <view v-if="friends.following.length === 0" class="col-span-full py-20 text-center bg-surface border-2 border-dashed border-slate-200 dark_border-slate-800 rounded-3xl text-slate-400 italic text-sm">
                                    <text>还没有关注任何人</text>
                                </view>
                            </view>
                        </view>

                        <view>
                            <text class="font-black text-slate-400 text-xs uppercase tracking-widest-2 mb-4 pl-4 block">你的粉丝 ({{ friends.followers.length }})</text>
                            <view class="grid grid-cols-1 md_grid-cols-2 gap-4">
                                <view v-for="f in friends.followers" :key="f.id" class="flex items-center justify-between p-4 bg-surface rounded-3xl border border-slate-100 dark_border-slate-800 shadow-sm transition-all">
                                    <view class="flex items-center gap-3">
                                        <view class="w-12 h-12 bg-slate-50 dark_bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner"><text>{{ f.avatar }}</text></view>
                                        <view>
                                            <text class="font-bold text-sm text-slate-800 dark_text-white block">{{ f.username }}</text>
                                            <text class="text-xxs text-slate-400 font-bold uppercase tracking-tight block">Lv.{{ f.level }} • {{ f.xp }} XP</text>
                                        </view>
                                    </view>
                                    <button 
                                        v-if="!isFollowing(f.id)"
                                        @click="follow(f.id)" 
                                        class="text-xxs font-black uppercase tracking-widest text-indigo-500 px-3 py-2 rounded-xl"
                                    >
                                        回粉
                                    </button>
                                    <view v-else class="text-xxs font-black uppercase tracking-widest text-slate-300 bg-slate-50 dark_bg-slate-800 px-3 py-1-5 rounded-xl border border-slate-100 dark_border-slate-700">
                                        <text>互相关注</text>
                                    </view>
                                </view>
                                <view v-if="friends.followers.length === 0" class="col-span-full py-20 text-center bg-surface border-2 border-dashed border-slate-200 dark_border-slate-800 rounded-3xl text-slate-400 italic text-sm">
                                    <text>还没有粉丝</text>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- Search / Explore -->
                    <view v-if="activeTab === 'search'" class="flex flex-col gap-8">
                        <view class="relative">
                            <input 
                                v-model="searchQuery"
                                @input="handleSearch"
                                type="text" 
                                placeholder="通过用户名搜索全世界的同学..." 
                                class="w-full px-6 py-5 bg-surface rounded-3xl shadow-sm outline-none font-bold placeholder_text-slate-300 dark_text-white dark_placeholder_text-slate-600"
                            />
                        </view>

                        <view v-if="loading" class="py-10 text-center">
                            <view class="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></view>
                        </view>

                        <view v-else class="grid grid-cols-1 md_grid-cols-2 gap-4">
                            <view v-for="u in searchResults" :key="u.id" class="flex items-center justify-between p-4 bg-surface rounded-3xl border border-slate-100 dark_border-slate-800 shadow-sm transition-all">
                                <view class="flex items-center gap-3">
                                    <view class="w-12 h-12 bg-slate-50 dark_bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner"><text>{{ u.avatar }}</text></view>
                                    <view>
                                        <text class="font-bold text-sm text-slate-800 dark_text-white block">{{ u.username }}</text>
                                        <text class="text-xxs text-slate-400 font-bold uppercase italic tracking-tighter block">Level {{ u.level }}</text>
                                    </view>
                                </view>
                                
                                <view v-if="u.id === user?.id">
                                    <text class="text-xxs font-black text-slate-200 uppercase tracking-widest">你自己</text>
                                </view>
                                <button 
                                    v-else-if="!isFollowing(u.id)"
                                    @click="follow(u.id)"
                                    class="bg-indigo-600 text-white text-xxs font-black uppercase tracking-widest px-5 py-2-5 rounded-xl shadow-sm active_scale-95"
                                >
                                    关注
                                </button>
                                <button 
                                    v-else
                                    @click="unfollow(u.id)"
                                    class="text-rose-500 text-xxs font-black uppercase tracking-widest px-5 py-2-5 bg-rose-opacity-10 dark_bg-rose-opacity-20 rounded-xl"
                                >
                                    已关注
                                </button>
                            </view>
                            <view v-if="searchQuery && searchResults.length === 0 && !loading" class="col-span-full py-20 text-center text-slate-300 italic">
                                <text>没有找到匹配的小伙伴哦</text>
                            </view>
                            <view v-if="!searchQuery" class="col-span-full py-20 text-center">
                                <text class="text-4xl mb-4 block">🌍</text>
                                <text class="text-slate-400 font-bold uppercase tracking-widest text-xs block">探索更大更广阔的社交圈</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<style scoped>
.animate-slide-up {
    animation: slideUp 0.4s ease-out forwards;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
