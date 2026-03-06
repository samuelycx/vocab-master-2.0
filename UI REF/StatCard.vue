<script setup>
defineProps({
  title: String,
  count: [Number, String],
  trend: String,
  trendLabel: String,
  bgColor: String, // 传入 tailwind 颜色类名，例如 'bg-mint-green'
})
</script>

<template>
  <div 
    :class="[bgColor]" 
    class="relative flex flex-col justify-between p-5 overflow-hidden shadow-sm rounded-4xl"
  >
    <div class="absolute top-4 right-4 text-black/20">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 19l16-16m0 0H9m11 0v11"></path>
      </svg>
    </div>

    <h3 class="text-lg font-semibold tracking-wide text-gray-800">{{ title }}</h3>
    
    <div class="mt-2">
      <span class="font-black tracking-tighter text-6xl text-gray-900">{{ count }}</span>
    </div>

    <div v-if="trend" class="flex items-center gap-2 mt-4">
      <div class="px-3 py-1 text-sm font-bold text-gray-900 bg-white/50 rounded-full">
        {{ trend }}
      </div>
      <span class="text-sm font-medium text-gray-600">{{ trendLabel }}</span>
    </div>
  </div>
</template>