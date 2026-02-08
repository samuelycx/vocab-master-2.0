
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
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="onClose">
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-slide-up">
            <!-- Header -->
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 class="text-2xl font-black text-slate-800">成就墙</h2>
                    <p class="text-slate-500 text-sm">已解锁 {{ userUnlocked.length }} / {{ achievements.length }}</p>
                </div>
                <button @click="onClose" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <i class="fas fa-times text-slate-500"></i>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto flex-1 space-y-8">
                <div v-for="(catMeta, catKey) in categories" :key="catKey">
                    <h3 class="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span class="w-6 h-6 rounded flex items-center justify-center text-xs" :class="catMeta.color">{{ catMeta.icon }}</span>
                        {{ catMeta.label }}
                    </h3>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="ach in achievements.filter(a => a.category === catKey)" :key="ach.id" 
                             class="flex flex-col items-center text-center gap-2 group cursor-pointer relative"
                             :class="{ 'opacity-50 grayscale': !isUnlocked(ach.id) }"
                             @mouseenter="hoveredAchId = ach.id"
                             @mouseleave="hoveredAchId = null">
                            
                            <!-- Icon -->
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-300 group-hover:scale-110 relative z-10"
                                :class="isUnlocked(ach.id) ? 'bg-gradient-to-br from-white to-slate-50 border border-slate-100' : 'bg-slate-100 border border-transparent'">
                                {{ ach.icon }}
                                
                                <!-- Tooltip -->
                                <div v-if="hoveredAchId === ach.id" class="absolute bottom-full mb-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl z-20 pointer-events-none animate-fade-in">
                                    <div class="font-bold mb-1 text-yellow-400">{{ ach.name }}</div>
                                    <div class="leading-tight opacity-90">{{ ach.description }}</div>
                                    <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                </div>
                            </div>
                            
                            <!-- Label -->
                            <div class="text-[10px] font-bold text-slate-600 leading-tight px-1">{{ ach.name }}</div>

                            <!-- Lock Overlay -->
                            <div v-if="!isUnlocked(ach.id)" class="absolute top-0 right-2 z-10">
                                <i class="fas fa-lock text-[8px] text-slate-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
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
