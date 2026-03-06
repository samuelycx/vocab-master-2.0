<script setup>
import StatCard from '../components/StatCard.vue';
import confetti from 'canvas-confetti';

const triggerCheer = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#A8F0C6', '#A0D8F1', '#F9E975', '#FFB5D0'] // 使用UI主题色
  });
};
</script>

<template>
  <div class="max-w-md min-h-screen px-4 pt-8 mx-auto pb-24">
    <div class="flex items-end justify-between mb-8 h-32 bg-brand-purple rounded-4xl p-6 text-white">
      <h1 class="text-3xl font-black">Learn new<br>words easily</h1>
      </div>

    <div class="grid grid-cols-2 gap-4">
      <StatCard 
        title="Total" 
        count="799" 
        trend="+10" 
        trendLabel="today"
        bg-color="bg-mint-green" 
      />
      <StatCard 
        title="Learning" 
        count="257" 
        trend="+5" 
        trendLabel="today"
        bg-color="bg-sky-blue" 
      />
      <StatCard 
        title="Known" 
        count="542" 
        trend="+25" 
        trendLabel="today"
        bg-color="bg-lemon-yellow" 
      />
      
      <button 
        @click="triggerCheer"
        class="flex flex-col items-start justify-center p-5 transition-transform active:scale-95 bg-candy-pink rounded-4xl text-left"
      >
        <span class="text-3xl font-black leading-tight text-gray-900">Start<br>learning</span>
        <div class="w-10 h-10 mt-2 bg-white rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-candy-pink" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </button>
    </div>
  </div>
</template>