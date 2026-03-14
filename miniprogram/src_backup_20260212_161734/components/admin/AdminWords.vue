<script setup>
import { ref } from 'vue';
import { API } from '../../api.js';

const newWord = ref({ text: '', partOfSpeech: 'n.', meanings: '', examples: '', category: 'GENERAL' });
const wordCategories = ['GENERAL', 'TOEFL', 'GRE', 'BUSINESS'];
const loading = ref(false);

const addWord = async () => {
    if (!newWord.value.text) return;
    loading.value = true;
    
    // Format meanings/examples as JSON array strings if simple text is entered
    const payload = {
        ...newWord.value,
        meanings: JSON.stringify([newWord.value.meanings]),
        examples: JSON.stringify([newWord.value.examples])
    };

    const res = await API.createWord(payload);
    if (res) {
        uni.showModal({ title: '成功', content: '单词已添加!', showCancel: false });
        newWord.value = { text: '', partOfSpeech: 'n.', meanings: '', examples: '', category: 'GENERAL' };
    } else {
        uni.showModal({ title: '错误', content: '添加单词失败', showCancel: false });
    }
    loading.value = false;
};

const handleImport = () => {
    uni.showModal({ title: '提示', content: '小程序环境暂不支持直接文件导入，请使用管理后台网页版。', showCancel: false });
};

const handleExport = async () => {
     uni.showModal({ title: '提示', content: '小程序环境暂不支持直接文件导出，请使用管理后台网页版。', showCancel: false });
};
</script>

<template>
    <view class="flex flex-col gap-6 animate-fade-in">
        <view class="flex justify-between items-center">
            <view>
                <text class="text-2xl font-black text-slate-800 dark_text-white block">单词管理</text>
                <text class="text-slate-500 text-sm block">Add, edit, or remove vocabulary.</text>
            </view>
            <view class="flex gap-2">
                <button @click="handleImport" :disabled="loading" class="bg-surface border border-slate-200 dark_border-slate-800 text-slate-600 dark_text-slate-300 px-4 py-2 rounded-xl font-bold text-sm active_scale-95 flex items-center gap-2">
                    <text>📥</text>
                    <text>导入 CSV</text>
                </button>
                <button @click="handleExport" class="bg-surface border border-slate-200 dark_border-slate-800 text-slate-600 dark_text-slate-300 px-4 py-2 rounded-xl font-bold text-sm active_scale-95 flex items-center gap-2">
                    <text>📤</text>
                    <text>导出 CSV</text>
                </button>
            </view>
        </view>

        <!-- Add Word Form -->
        <view class="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100 dark_border-slate-800 animate-slide-up">
            <text class="font-bold text-lg mb-4 text-slate-800 dark_text-white block">添加新单词</text>
            <view class="grid grid-cols-1 md_grid-cols-2 gap-4">
                <input v-model="newWord.text" placeholder="Word (e.g. Ephemeral)" class="p-4 bg-slate-50 dark_bg-slate-900 border border-slate-200 dark_border-slate-700 rounded-xl outline-none transition-all" />
                <picker mode="selector" :range="['n.', 'v.', 'adj.', 'adv.']" @change="(e) => newWord.partOfSpeech = ['n.', 'v.', 'adj.', 'adv.'][e.detail.value]">
                    <view class="p-4 bg-slate-50 dark_bg-slate-900 border border-slate-200 dark_border-slate-700 rounded-xl">
                        <text>{{ newWord.partOfSpeech }}</text>
                    </view>
                </picker>
                <input v-model="newWord.meanings" placeholder="Meaning" class="p-4 bg-slate-50 dark_bg-slate-900 border border-slate-200 dark_border-slate-700 rounded-xl outline-none transition-all" />
                <input v-model="newWord.examples" placeholder="Example Sentence" class="p-4 bg-slate-50 dark_bg-slate-900 border border-slate-200 dark_border-slate-700 rounded-xl outline-none transition-all" />
                <picker mode="selector" :range="wordCategories" @change="(e) => newWord.category = wordCategories[e.detail.value]">
                    <view class="p-4 bg-slate-50 dark_bg-slate-900 border border-slate-200 dark_border-slate-700 rounded-xl">
                        <text>{{ newWord.category }}</text>
                    </view>
                </picker>
                <button @click="addWord" :disabled="loading" class="bg-primary text-white font-bold py-3 rounded-xl active_scale-95 shadow-lg shadow-primary-20">
                    <text v-if="loading">Adding...</text>
                    <text v-else>Add Word</text>
                </button>
            </view>
        </view>
        
        <!-- CSV Info -->
        <view class="bg-indigo-50 dark_bg-indigo-opacity-10 p-4 rounded-xl text-xs text-indigo-600 dark_text-indigo-300 flex gap-3 items-start">
            <text class="text-lg mt-0-5">💡</text>
            <view>
                <text class="font-bold mb-1 block">CSV Format Guide</text>
                <text class="block">Ensure your CSV follows this order: word, part_of_speech, meaning, example_sentence, category.</text>
                <text class="mt-1 block">Example: Apple, n., A fruit, I ate an apple., GENERAL</text>
            </view>
        </view>
    </view>
</template>
