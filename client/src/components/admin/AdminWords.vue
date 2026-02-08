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
        alert('Word Added!');
        newWord.value = { text: '', partOfSpeech: 'n.', meanings: '', examples: '', category: 'GENERAL' };
    } else {
        alert('Failed to add word');
    }
    loading.value = false;
};

const fileInput = ref(null);
const handleImport = () => {
    fileInput.value.click();
};

const onFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            loading.value = true;
            const text = e.target.result;
            let wordsToImport = [];

            if (file.name.endsWith('.json')) {
                wordsToImport = JSON.parse(text);
            } else {
                // CSV Parse
                const lines = text.split('\n').filter(l => l.trim());
                for (const line of lines) {
                    const parts = line.split(',');
                    if (parts.length >= 3) {
                        const [word, pos, meaning, example, cat] = parts.map(s => s.trim());
                        if (word.toLowerCase() === 'word') continue; // Skip header

                        wordsToImport.push({
                            text: word,
                            partOfSpeech: pos || 'n.',
                            meanings: JSON.stringify([meaning]),
                            examples: JSON.stringify([example || '']),
                            category: cat || 'GENERAL'
                        });
                    }
                }
            }

            if (wordsToImport.length > 0) {
                const res = await API.importWords(wordsToImport);
                if (res && res.count !== undefined) {
                    alert(`Successfully imported ${res.count} words!`);
                } else {
                    alert('Import failed or partial success.');
                }
            } else {
                alert('No valid words found to import.');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to parse file.');
        } finally {
            loading.value = false;
            event.target.value = ''; // Reset input
        }
    };
    reader.readAsText(file);
};

const handleExport = async () => {
    loading.value = true;
    const words = await API.exportWords();
    loading.value = false;

    if (!words || words.length === 0) {
        alert('No words to export.');
        return;
    }

    // Convert to CSV
    const header = 'word,part_of_speech,meaning,example_sentence,category\n';
    const rows = words.map(w => {
        const meaning = w.meanings ? JSON.parse(w.meanings)[0] : '';
        const example = w.examples ? JSON.parse(w.examples)[0] : '';
        // Escape commas in fields if necessary (simple replacement for now)
        const clean = (str) => str ? str.replace(/,/g, ';').replace(/\n/g, ' ') : '';
        return `${clean(w.text)},${clean(w.partOfSpeech)},${clean(meaning)},${clean(example)},${clean(w.category)}`;
    }).join('\n');

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vocab_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
};
</script>

<template>
    <div class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-black text-slate-800 dark:text-white">单词管理</h2>
                <p class="text-slate-500 text-sm">Add, edit, or remove vocabulary.</p>
            </div>
            <div class="flex gap-2">
                <input type="file" ref="fileInput" @change="onFileSelected" accept=".csv" class="hidden" />
                <button @click="handleImport" :disabled="loading" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <i class="fas fa-file-import"></i> 导入 CSV
                </button>
                <button @click="handleExport" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <i class="fas fa-file-export"></i> 导出 CSV
                </button>
            </div>
        </div>

        <!-- Add Word Form -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 animate-slide-up" style="animation-duration: 0.5s; animation-fill-mode: forwards;">
            <h3 class="font-bold text-lg mb-4 text-slate-800 dark:text-white">添加新单词</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="newWord.text" placeholder="Word (e.g. Ephemeral)" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all" />
                <select v-model="newWord.partOfSpeech" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all">
                    <option>n.</option>
                    <option>v.</option>
                    <option>adj.</option>
                    <option>adv.</option>
                </select>
                <input v-model="newWord.meanings" placeholder="Meaning" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all" />
                <input v-model="newWord.examples" placeholder="Example Sentence" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all" />
                <select v-model="newWord.category" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all">
                    <option v-for="cat in wordCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <button @click="addWord" :disabled="loading" class="bg-primary text-white font-bold py-3 rounded-xl hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                    <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
                    <span v-else>Add Word</span>
                </button>
            </div>
        </div>
        
        <!-- CSV Info -->
        <div class="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl text-xs text-indigo-600 dark:text-indigo-300 flex gap-3 items-start">
            <i class="fas fa-info-circle text-lg mt-0.5"></i>
            <div>
                <p class="font-bold mb-1">CSV Format Guide</p>
                <p>Ensure your CSV follows this order: <code>word, part_of_speech, meaning, example_sentence, category</code>.</p>
                <p class="mt-1">Example: <code>Apple, n., A fruit, I ate an apple., GENERAL</code></p>
            </div>
        </div>
    </div>
</template>
