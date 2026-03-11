<script setup>
import { ref, onMounted } from 'vue';
import { API } from '../api.js';
import { useI18n } from '../i18n.js';

const props = defineProps({
    onClose: Function
});

const leaderboard = ref([]);
const loading = ref(true);
const { t } = useI18n();

    const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

    const getAvatarUrl = (avatar) => {
        if (!avatar || typeof avatar !== 'string') return DEFAULT_AVATAR;
        return avatar.startsWith('http') || avatar.startsWith('cloud://') ? avatar : DEFAULT_AVATAR;
    };

    const loadLeaderboard = async () => {
        loading.value = true;
        try {
            const data = await API.getLeaderboard(20);
            leaderboard.value = data;
        } finally {
            loading.value = false;
        }
    };

onMounted(() => {
    loadLeaderboard();
});
</script>

<template>
    <view class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-dark-opacity-50 backdrop-blur-sm animate-fade-in" @click.stop="onClose">
        <view class="bg-surface w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-80vh overflow-hidden animate-slide-up relative" @click.stop="">
            
            <!-- Header -->
            <view class="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white relative overflow-hidden">
                <view class="relative z-10 flex justify-between items-center">
                    <view>
                        <text class="text-2xl font-black uppercase tracking-wider block">{{ t('leaderboard_title') }}</text>
                        <text class="text-yellow-100 font-bold text-sm block">{{ t('leaderboard_subtitle') }}</text>
                    </view>
                    <text class="text-4xl">#</text>
                </view>
                <!-- Background decor -->
                <view class="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                     <text class="text-8xl">#</text>
                </view>
                
                <button @click="onClose" class="absolute top-4 right-4 bg-black-opacity-20 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors">
                    <text>×</text>
                </button>
            </view>

            <!-- List -->
            <view class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <view v-if="loading" class="flex flex-col items-center justify-center h-40 gap-4 text-slate-400">
                    <view class="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></view>
                    <text>{{ t('common_loading') }}</text>
                </view>

                <view v-else-if="leaderboard.length === 0" class="text-center text-slate-400 py-10">
                    <text>{{ t('leaderboard_empty') }}</text>
                </view>

                <view 
                    v-else
                    v-for="(user, index) in leaderboard" 
                    :key="user.id"
                    class="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark_border-slate-700 bg-slate-50 dark_bg-slate-dark-opacity-50"
                    :class="{
                        'ring-2 ring-yellow-400 ring-offset-2 dark_ring-offset-slate-800 bg-yellow-50 dark_bg-yellow-opacity-20': index === 0,
                        'ring-2 ring-slate-300 ring-offset-2 dark_ring-offset-slate-800': index === 1,
                        'ring-2 ring-orange-300 ring-offset-2 dark_ring-offset-slate-800': index === 2
                    }"
                >
                    <!-- Rank -->
                    <view class="w-8 flex-shrink-0 text-center font-black text-xl" 
                        :class="{
                            'text-yellow-500 text-2xl': index === 0,
                            'text-slate-400 text-xl': index === 1,
                            'text-orange-400 text-xl': index === 2,
                            'text-slate-300 dark_text-slate-500': index > 2
                        }"
                    >
                        <text>{{ index + 1 }}</text>
                    </view>

                    <!-- Avatar -->
                    <view class="w-12 h-12 rounded-full bg-white dark_bg-slate-600 flex items-center justify-center text-xl shadow-sm border border-slate-100 dark_border-slate-500 relative overflow-hidden">
                        <image class="w-full h-full object-cover" :src="getAvatarUrl(user.avatar)" />
                        <view v-if="index < 3" class="absolute -top-1 -right-1 text-sm bg-white dark_bg-slate-800 rounded-full shadow-sm w-5 h-5 flex items-center justify-center">
                            <text>{{ index === 0 ? '1' : (index === 1 ? '2' : '3') }}</text>
                        </view>
                    </view>

                    <!-- Info -->
                    <view class="flex-1 min-w-0">
                        <text class="font-bold text-slate-800 dark_text-white truncate block">{{ user.username }}</text>
                        <text class="text-xs text-slate-500 dark_text-slate-400 font-medium block">{{ t('leaderboard_level', { level: user.level }) }}</text>
                    </view>

                    <!-- Score -->
                    <view class="text-right">
                        <text class="font-black text-indigo-500 dark_text-indigo-400 block">{{ user.xp }} XP</text>
                        <text class="text-xs text-slate-400 dark_text-slate-500 font-bold block" v-if="user.totalCorrect">{{ t('leaderboard_vocab', { count: user.totalCorrect }) }}</text>
                    </view>
                </view>
            </view>

            <view class="p-4 border-t border-slate-100 dark_border-slate-700 text-center text-xs text-slate-400 dark_text-slate-500">
                <text>{{ t('leaderboard_refresh') }}</text>
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
