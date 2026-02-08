<script setup>
import { ref } from 'vue';
import AdminLayout from './admin/AdminLayout.vue';
import AdminOverview from './admin/AdminOverview.vue';
import AdminWords from './admin/AdminWords.vue';
import AdminUsers from './admin/AdminUsers.vue';
import AdminSystem from './admin/AdminSystem.vue';

const activeTab = ref('overview');

// Tab Switch Handler
const handleTabChange = (tab) => {
    activeTab.value = tab;
};
</script>

<template>
    <AdminLayout :currentTab="activeTab" :onTabChange="handleTabChange">
        
        <component :is="AdminOverview" v-if="activeTab === 'overview'" />
        
        <component :is="AdminWords" v-if="activeTab === 'words'" />

        <component :is="AdminUsers" v-if="activeTab === 'users'" />

        <component :is="AdminSystem" v-if="activeTab === 'modules'" />

    </AdminLayout>
</template>
