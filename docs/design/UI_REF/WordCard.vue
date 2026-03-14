<script setup>
import { ref } from 'vue';

defineProps({
  word: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: true
  },
  phonetic: {
    type: String,
    default: ''
  }
});

// 控制卡片翻转状态
const isFlipped = ref(false);

const flipCard = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<template>
  <div class="relative w-full max-w-sm mx-auto h-[420px] [perspective:1000px] cursor-pointer" @click="flipCard">
    
    <div 
      class="relative w-full h-full duration-500 ease-out transition-transform [transform-style:preserve-3d]"
      :class="{ '[transform:rotateY(180deg)]': isFlipped }"
    >
      
      <div class="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white shadow-xl rounded-4xl [backface-visibility:hidden]">
        <h2 class="text-5xl font-black tracking-tight text-gray-900">{{ word }}</h2>
        
        <div v-if="phonetic" class="mt-4 text-lg font-medium text-gray-400">
          {{ phonetic }}
        </div>
        
        <button class="p-3 mt-6 transition-colors bg-gray-100 rounded-full hover:bg-gray-200 text-brand-purple" @click.stop="/* 触发发音逻辑 */">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 5v14l-5-4H4V9h4l5-4zm2 2.5v9c1.5-.7 2.5-2.2 2.5-4.5S16.5 8.2 15 7.5zM15 3v2c3.5.8 6 4 6 7s-2.5 6.2-6 7v2c4.5-.9 8-4.9 8-9s-3.5-8.1-8-9z"/>
          </svg>
        </button>

        <p class="absolute text-sm font-medium text-gray-400 bottom-8">
          Tap to show translation
        </p>
      </div>

      <div class="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white shadow-xl rounded-4xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
        <h2 class="text-4xl font-bold text-brand-purple">{{ translation }}</h2>
        
        <div class="w-16 h-1 mt-6 rounded-full bg-brand-light/30"></div>
        <p class="mt-6 text-lg text-center text-gray-500">
          </p>
      </div>

    </div>
  </div>
</template>