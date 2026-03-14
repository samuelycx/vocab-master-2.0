<script setup>
import { ref, watch, onMounted } from 'vue';
import { GameState } from '../state.js';
import { API } from '../api.js';

const props = defineProps({
    onBack: Function
});

const words = ref([]);
const page = ref(1);
const totalPages = ref(1);
const search = ref('');
const loading = ref(false);
const userId = GameState.user.id;

const loadWords = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const res = await API.getLearnedWords(userId, page.value, 20, search.value);
        const data = (res && Array.isArray(res.data)) ? res.data : [];
        
        if (page.value === 1) {
            words.value = data;
        } else {
            words.value = [...words.value, ...data];
        }
        totalPages.value = res?.lastPage || 1;
        } catch (error) {
            console.error('loadWords failed', error);
            if (page.value === 1) {
                words.value = [];
            }
        } finally {
        loading.value = false;
    }
};

// Debounce search
let timeout;
watch(search, () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        page.value = 1;
        loadWords();
    }, 300);
});

const loadMore = () => {
    if (page.value < totalPages.value) {
        page.value++;
        loadWords();
    }
};

const getStatusColor = (status, repetition) => {
    if (status === 'MASTERED' || repetition > 3) return 'bg-green-100 text-green-700';
    if (status === 'LEARNING') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-500';
};

const getStatusLabel = (status, repetition) => {
    if (status === 'MASTERED' || repetition > 3) return '已掌握';
    if (status === 'LEARNING') return '学习中';
    return '新词';
};

const safeParseMeanings = (meanings) => {
    if (!meanings) return '';
    if (typeof meanings !== 'string') {
        if (Array.isArray(meanings) && meanings.length > 0) {
            return meanings[0];
        }
        return String(meanings);
    }
    try {
        const parsed = JSON.parse(meanings);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
        }
        return meanings;
    } catch (e) {
        return meanings;
    }
};

onMounted(() => {
    if (!userId) {
        console.warn('User not logged in');
        return;
    }
    loadWords();
});
</script>

<template>
    <view class="flex-1 flex flex-col p-4 md_p-6 w-full max-w-5xl mx-auto h-screen overflow-hidden transition-colors">
        <!-- Header -->
        <view class="flex items-center gap-4 mb-6">
            <button @click="onBack" class="w-10 h-10 rounded-full bg-surface border border-slate-100 dark_border-white-opacity-5 flex items-center justify-center active_scale-95 transition-all">
                <text>⬅️</text>
            </button>
            <text class="text-2xl font-black text-text-main block">我的词汇量</text>
        </view>

        <!-- Search -->
        <view class="relative mb-6">
            <text class="absolute left-4 top-1-2 -translate-y-1-2 text-text-muted">🔍</text>
            <input 
                v-model="search"
                type="text" 
                placeholder="搜索单词..." 
                class="w-full pl-12 pr-4 py-4 rounded-2xl border border-transparent shadow-sm outline-none font-bold text-text-main bg-surface transition-colors placeholder_text-text-muted"
            >
        </view>

        <!-- List -->
        <view class="flex-1 overflow-y-auto flex flex-col gap-3 pb-24 pr-2">
            <view v-if="(!words || words.length === 0) && !loading" class="text-center py-20 text-slate-400">
                <view class="text-6xl mb-4 opacity-20"><text>📖</text></view>
                <text class="block">暂无单词记录</text>
                <text class="text-sm mt-2 block">快去开始每日挑战吧！</text>
            </view>

            <template v-for="record in words" :key="record.id">
                <view 
                    v-if="record && record.word"
                    class="bg-surface rounded-2xl p-4 flex justify-between items-center animate-slide-up shadow-sm border border-slate-100 dark_border-white-opacity-5"
                >
                    <view>
                        <view class="flex items-baseline gap-2 mb-1">
                            <text class="text-xl font-black text-text-main">{{ record.word.text || record.word.word || 'Loading...' }}</text>
                            <text class="text-xs font-bold text-text-muted italic">{{ record.word.partOfSpeech || '' }}</text>
                        </view>
                        
                        <text class="text-text-muted text-sm line-clamp-1 block">
                             {{ safeParseMeanings(record.word.meanings) }}
                        </text>
                    </view>

                    <view class="flex flex-col items-end gap-2">
                        <text class="px-3 py-1 rounded-full text-xs font-bold" :class="getStatusColor(record.status, record.repetition)">
                            {{ getStatusLabel(record.status, record.repetition) }}
                    </text>
                        <view v-if="record.nextReview" class="text-xxs text-text-muted font-medium">
                            <text>复习: {{ new Date(record.nextReview).toLocaleDateString() }}</text>
                        </view>
                    </view>
                </view>
            </template>

            <!-- Loader / Load More -->
            <view v-if="page < totalPages" class="py-4 text-center">
                <button @click="loadMore" class="text-primary font-bold text-sm" :disabled="loading">
                    <text>{{ loading ? '加载中...' : '加载更多' }}</text>
                </button>
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
