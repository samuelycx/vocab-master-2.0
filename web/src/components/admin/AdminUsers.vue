<script setup>
import { ref, onMounted } from 'vue';
import { API } from '../../api.js';

const users = ref([]);
const loading = ref(false);
const wordCategories = ['GENERAL', 'TOEFL', 'GRE', 'BUSINESS'];

const fetchUsers = async () => {
    loading.value = true;
    users.value = await API.getUsers();
    loading.value = false;
};

const setUserCategory = async (userId, category) => {
    await API.setCategory(userId, category);
    await fetchUsers(); 
};

const toggleBan = async (user) => {
    if (!confirm(`Are you sure you want to ${user.role === 'BANNED' ? 'unban' : 'ban'} ${user.username}?`)) return;
    
    await API.banUser(user.id);
    await fetchUsers();
};

onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <div>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white">用户管理</h2>
            <p class="text-slate-500 text-sm">Manage user accounts and progress.</p>
        </div>
        
        <div v-if="loading" class="text-center py-12">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-400 font-bold">Loading users...</p>
        </div>

        <div v-else class="grid gap-4">
            <div v-for="u in users" :key="u.id" class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="text-3xl w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center">{{ u.avatar }}</div>
                    <div>
                        <div class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            {{ u.username }}
                            <span v-if="u.role === 'ADMIN'" class="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded font-black uppercase">Admin</span>
                        </div>
                        <div class="text-xs text-slate-400">Level {{ u.level }} • {{ u.xp }} XP</div>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <div class="flex-1 md:flex-none">
                        <span class="text-xs font-bold text-slate-400 block mb-1">Target</span>
                        <select 
                            :value="u.targetCategory" 
                            @change="(e) => setUserCategory(u.id, e.target.value)"
                            class="w-full md:w-32 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:ring-2 ring-primary/20"
                        >
                            <option v-for="cat in wordCategories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <button 
                        @click="toggleBan(u)"
                        class="p-2 rounded-lg transition-colors border"
                        :class="u.role === 'BANNED' ? 'bg-green-50 text-green-500 hover:bg-green-100 border-green-100' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-100'"
                        :title="u.role === 'BANNED' ? 'Unban User' : 'Ban User'"
                    >
                        <i class="fas" :class="u.role === 'BANNED' ? 'fa-user-check' : 'fa-ban'"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
