<script setup>
import { ref, onMounted } from 'vue';
import { API } from '../../api.js';
import { GameState, Actions } from '../../state.js';

const systemModules = ref({});
const loading = ref(false);

const fetchModules = async () => {
    loading.value = true;
    systemModules.value = await API.getSystemConfigs();
    loading.value = false;
};

const toggleModule = async (key) => {
    const current = systemModules.value[key];
    await API.toggleModule(key, !current);
    systemModules.value[key] = !current;
    
    // Update global state immediately
    const newModules = { ...GameState.system?.modules, [key]: !current };
    Actions.setModules(newModules);
};

onMounted(() => {
    fetchModules();
});
</script>

<template>
    <div class="space-y-6 animate-fade-in">
         <div>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white">功能开关</h2>
            <p class="text-slate-500 text-sm">Toggle system features on or off.</p>
        </div>

        <div v-if="loading" class="text-center py-12">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-400 font-bold">Loading configs...</p>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 class="font-bold text-lg mb-4 text-slate-800 dark:text-white">Feature Flags</h3>
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                    <div>
                        <div class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <i class="fas fa-fist-raised text-rose-500"></i>
                            PK Arena
                        </div>
                        <div class="text-xs text-slate-400 mt-1">Enable/Disable Multiplayer & Bot Arena</div>
                    </div>
                    <div 
                        @click="toggleModule('pk_arena_enabled')"
                        class="w-14 h-8 rounded-full p-1 cursor-pointer transition-colors"
                        :class="systemModules['pk_arena_enabled'] ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'"
                    >
                        <div 
                            class="w-6 h-6 bg-white rounded-full shadow-md transition-transform"
                            :class="systemModules['pk_arena_enabled'] ? 'translate-x-6' : 'translate-x-0'"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
