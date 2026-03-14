
<script setup>
import { computed, ref } from 'vue';
import { GameState, Actions } from '../state.js';

// Mock data if backend not fully ready, but ideal to pass via props or store
const userAchievements = computed(() => GameState.user?.achievements || []);
const allAchievements = computed(() => GameState.system?.achievements || []); 
// Note: We need to load system achievements somewhere. For now let's assume passed as props or load on mount.

const props = defineProps({
    achievements: {
        type: Array,
        default: () => []
    },
    userUnlocked: {
        type: Array,
        default: () => [] // Array of achievement IDs
    },
    onClose: Function
});

const categories = {
    'CONSISTENCY': { label: '毅力', icon: '🛡️', color: 'bg-blue-100 text-blue-600' },
    'PRECISION': { label: '技巧', icon: '🎯', color: 'bg-red-100 text-red-600' },
    'VOLUME': { label: '博学', icon: '📚', color: 'bg-purple-100 text-purple-600' },
    'WEALTH': { label: '财富', icon: '💰', color: 'bg-yellow-100 text-yellow-600' },
    'SPECIAL': { label: '特殊', icon: '🌟', color: 'bg-indigo-100 text-indigo-600' }
};

const getCategoryStyle = (cat) => categories[cat] || categories['SPECIAL'];

const isUnlocked = (achId) => props.userUnlocked.includes(achId);
const hoveredAchId = ref(null);

</script>

<template>
    <view class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.stop="onClose">
        <view class="bg-surface w-full max-w-lg rounded-3xl shadow-2xl max-h-80p flex flex-col overflow-hidden animate-slide-up" @click.stop="">
            <!-- Header -->
            <view class="p-6 border-b border-slate-100 dark_border-slate-800 flex justify-between items-center bg-slate-opacity-50 dark_bg-slate-dark-opacity-50">
                <view>
                    <text class="text-2xl font-black text-slate-800 dark_text-white block">成就墙</text>
                    <text class="text-slate-500 text-sm block">已解锁 {{ userUnlocked.length }} / {{ achievements.length }}</text>
                </view>
                <button @click="onClose" class="w-10 h-10 rounded-full bg-slate-100 dark_bg-slate-800 flex items-center justify-center">
                    <text class="text-slate-500">❌</text>
                </button>
            </view>

            <!-- Content -->
            <view class="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
                <view v-for="(catMeta, catKey) in categories" :key="catKey">
                    <view class="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <view class="w-6 h-6 rounded flex items-center justify-center text-xs" :class="catMeta.color">
                            <text>{{ catMeta.icon }}</text>
                        </view>
                        <text>{{ catMeta.label }}</text>
                    </view>
                    
                    <view class="grid grid-cols-2 lg_grid-cols-4 gap-4">
                        <view v-for="ach in achievements.filter(a => a.category === catKey)" :key="ach.id" 
                             class="flex flex-col items-center text-center gap-2 relative"
                             :class="{ 'opacity-50 grayscale': !isUnlocked(ach.id) }"
                             @click="hoveredAchId = (hoveredAchId === ach.id ? null : ach.id)">
                            
                            <!-- Icon -->
                            <view class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-300 relative z-10"
                                :class="isUnlocked(ach.id) ? 'bg-surface border border-slate-100 dark_border-slate-700' : 'bg-slate-100 dark_bg-slate-800 border border-transparent'">
                                <text>{{ ach.icon }}</text>
                                
                                <!-- Tooltip (Simple Toggle on Mobile) -->
                                <view v-if="hoveredAchId === ach.id" class="absolute bottom-full mb-2 w-32 bg-slate-800 text-white text-xxs p-2 rounded-lg shadow-xl z-20 pointer-events-none animate-fade-in">
                                    <text class="font-bold mb-1 text-yellow-400 block">{{ ach.name }}</text>
                                    <text class="leading-tight opacity-90 block">{{ ach.description }}</text>
                                    <view class="absolute -bottom-1 left-1-2 -translate-x-1-2 w-2 h-2 bg-slate-800 rotate-45"></view>
                                </view>
                            </view>
                            
                            <!-- Label -->
                            <text class="text-xxs font-bold text-slate-600 dark_text-slate-400 leading-tight px-1 block">{{ ach.name }}</text>

                            <!-- Lock Overlay -->
                            <view v-if="!isUnlocked(ach.id)" class="absolute top-0 right-2 z-10">
                                <text class="text-3xs text-slate-400">🔒</text>
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
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
