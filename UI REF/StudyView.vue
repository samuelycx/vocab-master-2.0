<script setup>
import { ref, computed } from 'vue';
import WordCard from '../components/WordCard.vue';
import confetti from 'canvas-confetti';

// 模拟学习数据
const wordsToLearn = ref([
  { id: 1, word: 'obvious', translation: '明显的，显而易见的', phonetic: '/ˈɒbviəs/' },
  { id: 2, word: 'enchanted', translation: '着迷的，施过魔法的', phonetic: '/ɪnˈtʃɑːntɪd/' },
  { id: 3, word: 'suddenly', translation: '突然地，出乎意料地', phonetic: '/ˈsʌdənli/' },
]);
const currentIndex = ref(0);

const currentWord = computed(() => wordsToLearn.value[currentIndex.value]);
const progressPercentage = computed(() => {
  return ((currentIndex.value) / wordsToLearn.value.length) * 100;
});

const markAsKnown = () => {
  if (currentIndex.value < wordsToLearn.value.length - 1) {
    // 切换到下一个单词，Vue 的 Transition 会根据 key 的变化自动触发动画
    currentIndex.value++;
  } else {
    // 进度拉满
    currentIndex.value++; 
    // 触发完结撒花特效
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#A8F0C6', '#A0D8F1', '#F9E975', '#FFB5D0']
    });
    // 延迟一秒后，可以执行路由跳转回到首页
    // setTimeout(() => router.push('/'), 1500);
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen px-4 py-8 overflow-hidden bg-brand-purple">
    
    <header class="flex items-center justify-between mb-8 z-10">
      <button class="p-2 text-white/80 hover:text-white transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      
      <div class="flex-1 max-w-xs mx-4 h-2.5 bg-black/20 rounded-full overflow-hidden shadow-inner">
        <div 
          class="h-full transition-all duration-700 ease-out rounded-full bg-mint-green shadow-[0_0_10px_rgba(168,240,198,0.5)]" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      
      <div class="w-10"></div> 
    </header>

    <main class="relative flex flex-col justify-center flex-1 w-full max-w-sm mx-auto">
      
      <Transition name="card-swipe">
        <WordCard 
          v-if="currentWord"
          :key="currentWord.id"
          :word="currentWord.word"
          :translation="currentWord.translation"
          :phonetic="currentWord.phonetic"
          class="absolute w-full"
        />
      </Transition>

      <div v-if="!currentWord" class="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div class="w-20 h-20 mb-6 bg-white rounded-full flex items-center justify-center text-brand-purple">
          <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <h2 class="text-3xl font-bold">All done!</h2>
        <p class="mt-2 text-white/80">Great job today.</p>
      </div>
      
    </main>

    <footer class="flex justify-center gap-4 mt-12 z-10" :class="{ 'opacity-0 pointer-events-none': !currentWord }">
      <button 
        @click="markAsKnown"
        class="flex items-center gap-2 px-12 py-4 text-xl font-bold transition-transform bg-white text-brand-purple rounded-4xl active:scale-90 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
      >
        <span>Know</span>
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </footer>
    
  </div>
</template>

<style scoped>
/* 定义动画持续时间和缓动函数 */
.card-swipe-enter-active,
.card-swipe-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* 带有微弹性的曲线，更生动 */
}

/* 离开动画（旧卡片）：向左侧倾斜并飞出屏幕，同时透明度降低 */
.card-swipe-leave-to {
  opacity: 0;
  transform: translateX(-150%) translateY(-20px) rotate(-15deg) scale(0.9);
}

/* 进入动画初始状态（新卡片）：从右侧略微缩小、倾斜着准备进入 */
.card-swipe-enter-from {
  opacity: 0;
  transform: translateX(100%) translateY(20px) rotate(10deg) scale(0.95);
}

/* 默认状态：卡片在正中间 */
.card-swipe-enter-to,
.card-swipe-leave-from {
  opacity: 1;
  transform: translateX(0) translateY(0) rotate(0) scale(1);
}
</style>