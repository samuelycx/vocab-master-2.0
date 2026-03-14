<script setup>
import { onMounted } from 'vue';
import { Actions } from '../state.js';

onMounted(() => {
  Actions.setView('dashboard');
});
</script>

<template>
  <div class="redirect-page" aria-hidden="true"></div>
</template>

<style scoped>
.redirect-page {
  display: none;
}
</style>
