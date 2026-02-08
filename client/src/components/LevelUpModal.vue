
<script setup>
import { onMounted } from 'vue';
import confetti from 'canvas-confetti';

const props = defineProps({
    level: Number,
    rankTitle: String,
    rankIcon: String,
    onClose: Function
});

onMounted(() => {
    // Fire confetti from bottom corners
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ['#6366f1', '#8b5cf6', '#f43f5e']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ['#6366f1', '#8b5cf6', '#f43f5e'] 
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
});
</script>

<template>
    <div class="fixed inset-0 bg-black/80 backdrop-blur z-[60] flex items-center justify-center p-6" @click.self="onClose">
        <div class="relative bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl overflow-hidden animate-pop-in">
            <!-- Confetti / Background Decorations -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div class="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.2)_30deg,transparent_60deg)] animate-spin-slow"></div>
            </div>

            <div class="relative z-10">
                <div class="text-6xl mb-4 animate-bounce-custom">
                    {{ rankIcon || '🎉' }}
                </div>
                
                <h2 class="text-3xl font-black text-slate-800 mb-2">升级了!</h2>
                <div class="text-orange-500 font-bold uppercase tracking-widest text-sm mb-6">解锁新头衔</div>
                
                <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div class="text-slate-400 text-xs uppercase font-bold mb-1">当前头衔</div>
                    <div class="text-2xl font-black text-slate-800">{{ rankTitle || '未知' }}</div>
                    <div class="text-primary font-bold mt-2">等级 {{ level }}</div>
                </div>

                <button @click="onClose" class="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform">
                    继续冒险
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-pop-in {
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-spin-slow {
    animation: spin 10s linear infinite;
}

.animate-bounce-custom {
    animation: bounce 2s infinite;
}

@keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
</style>
