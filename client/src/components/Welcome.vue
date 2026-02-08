<script setup>
import { Actions } from '../state.js';
import { API } from '../api.js';

const start = async () => {
    // Auto-login for now
    const username = 'player_' + Math.floor(Math.random() * 10000);
    const storedUser = localStorage.getItem('vocab_user');
    
    const userToLogin = storedUser ? JSON.parse(storedUser).username : username;

    const res = await API.login(userToLogin);
    if (res.success) {
        Actions.setUser(res.user);
        localStorage.setItem('vocab_user', JSON.stringify(res.user));
    }
    
    Actions.setView('dashboard');
};
</script>

<template>
    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        
        <div class="mb-12 relative">
            <div class="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-10 relative">
                <i class="fas fa-graduation-cap text-6xl text-primary transform -rotate-12"></i>
            </div>
            <!-- Decorative blobs -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-60 animate-bounce-in" style="animation-delay: 0.2s"></div>
            <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-300 rounded-full opacity-60 animate-bounce-in" style="animation-delay: 0.5s"></div>
        </div>

        <h1 class="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
            Vocab <span class="text-primary">Master</span>
        </h1>
        <p class="text-slate-400 mb-12 font-medium">让单词成为你的超能力</p>

        <button 
            @click="start"
            class="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 btn-press flex items-center justify-center gap-3"
        >
            开始冒险 <i class="fas fa-arrow-right"></i>
        </button>

        <p class="mt-8 text-xs text-slate-400">Ver 2.0 Alpha</p>
    </div>
</template>
