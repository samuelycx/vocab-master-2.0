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
        if (res) {
            if (page.value === 1) {
                words.value = res.data;
            } else {
                words.value = [...words.value, ...res.data];
            }
            totalPages.value = res.lastPage;
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

onMounted(() => {
    loadWords();
});
</script>

<template>
    <div class="flex-1 flex flex-col p-4 md:p-6 w-full max-w-5xl mx-auto h-full overflow-hidden transition-colors">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
            <button @click="onBack" class="w-10 h-10 rounded-full bg-surface border border-slate-100 dark:border-white/5 flex items-center justify-center text-text-muted hover:text-primary active:scale-95 transition-all">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h1 class="text-2xl font-black text-text-main">我的词汇量</h1>
        </div>

        <!-- Search -->
        <div class="relative mb-6">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
            <input 
                v-model="search"
                type="text" 
                placeholder="搜索单词..." 
                class="w-full pl-12 pr-4 py-4 rounded-2xl border border-transparent shadow-sm focus:border-primary focus:outline-none font-bold text-text-main bg-surface transition-colors placeholder:text-text-muted/50"
            >
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto space-y-3 pb-24 pr-2" id="vocab-list">
            <div v-if="words.length === 0 && !loading" class="text-center py-20 text-slate-400">
                <div class="text-6xl mb-4 opacity-20"><i class="fas fa-book-open"></i></div>
                <p>暂无单词记录</p>
                <p class="text-sm mt-2">快去开始每日挑战吧！</p>
            </div>

            <div 
                v-for="record in words" 
                :key="record.id" 
                class="bg-surface rounded-2xl p-4 flex justify-between items-center animate-slide-up shadow-sm border border-slate-100 dark:border-white/5"
            >
                <div>
                    <div class="flex items-baseline gap-2 mb-1">
                        <h3 class="text-xl font-black text-text-main">{{ record.word.word }}</h3>
                        <span class="text-xs font-bold text-text-muted italic">{{ record.word.partOfSpeech }}</span>
                    </div>
                    
                    <!-- Parse JSON meanings/examples if needed, or show simple fallback -->
                    <!-- Assuming meanings cleaned to array -->
                    <p class="text-text-muted text-sm line-clamp-1">
                         {{ Array.isArray(JSON.parse(record.word.meanings || '[]')) ? JSON.parse(record.word.meanings)[0] : record.word.meanings }}
                    </p>
                </div>

                <div class="flex flex-col items-end gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold" :class="getStatusColor(record.status, record.repetition)">
                        {{ getStatusLabel(record.status, record.repetition) }}
                    </span>
                    <div v-if="record.nextReview" class="text-[10px] text-text-muted font-medium">
                        复习: {{ new Date(record.nextReview).toLocaleDateString() }}
                    </div>
                </div>
            </div>

            <!-- Loader / Load More -->
            <div v-if="page < totalPages" class="py-4 text-center">
                <button @click="loadMore" class="text-primary font-bold text-sm hover:underline" :disabled="loading">
                    {{ loading ? '加载中...' : '加载更多' }}
                </button>
            </div>
        </div>
    </div>
</template>
