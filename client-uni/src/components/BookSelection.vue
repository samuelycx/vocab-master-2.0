<script setup>
import { Actions } from '../state.js';

// 词书系统已移除，直接返回Dashboard
Actions.setView('dashboard');
</script>

<template>
    <view></view>
</template>
