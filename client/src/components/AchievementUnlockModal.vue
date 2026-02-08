
<script setup>
import { onMounted } from 'vue';
import confetti from 'canvas-confetti';

const props = defineProps({
    achievement: Object, // { name, description, icon }
    onClose: Function
});

onMounted(() => {
    // Burst from center
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
});
</script>

<template>
    <div class="fixed inset-0 bg-black/80 backdrop-blur z-[60] flex items-center justify-center p-6" @click.self="onClose">
        <div class="relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl overflow-hidden animate-slide-up">
            
            <div class="relative z-10 flex flex-col items-center">
                <div class="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center text-5xl shadow-inner mb-6 animate-pulse-slow">
                    {{ achievement?.icon || '🏆' }}
                </div>
                
                <h2 class="text-2xl font-black text-slate-800 mb-2">解锁新成就!</h2>
                
                <div class="text-slate-800 font-bold text-xl mb-1">{{ achievement?.name }}</div>
                <p class="text-slate-400 text-sm mb-8 px-4 leading-relaxed">{{ achievement?.description }}</p>

                <button @click="onClose" class="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                    太棒了!
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-slide-up {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-pulse-slow {
    animation: pulse 3s infinite;
}

@keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
</style>
