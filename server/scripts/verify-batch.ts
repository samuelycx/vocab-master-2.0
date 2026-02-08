async function verifyBatch() {
    const API_URL = 'http://localhost:3000/api';
    const uniqueId = Date.now();
    const words = [
        { text: `BatchTest1_${uniqueId}`, partOfSpeech: 'n.', meanings: JSON.stringify(['test1']), examples: JSON.stringify(['ex1']), category: 'GENERAL' },
        { text: `BatchTest2_${uniqueId}`, partOfSpeech: 'v.', meanings: JSON.stringify(['test2']), examples: JSON.stringify(['ex2']), category: 'TOEFL' }
    ];

    console.log(`Payload: ${JSON.stringify(words)}`);

    // 1. Import
    console.log('--- Testing Import ---');
    const importRes = await fetch(`${API_URL}/admin/words/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(words)
    });

    if (!importRes.ok) {
        throw new Error(`Import failed: ${importRes.status} ${importRes.statusText}`);
    }

    const importData = await importRes.json();
    console.log('Import Response:', importData);

    if (importData.count !== 2) {
        // It might be 0 if they already exist, but with uniqueId they shouldn't.
        // If they exist, create returns count of NEW words.
        console.warn(`Expected count 2, got ${importData.count}. (Might be duplicates if run fast)`);
    }

    // 2. Export
    console.log('--- Testing Export ---');
    const exportRes = await fetch(`${API_URL}/admin/words/export`);
    if (!exportRes.ok) {
        throw new Error(`Export failed: ${exportRes.status}`);
    }

    const exportData = await exportRes.json();
    console.log(`Exported ${exportData.length} words.`);

    // 3. Verify
    const found1 = exportData.find((w: any) => w.text === words[0].text);
    const found2 = exportData.find((w: any) => w.text === words[1].text);

    if (found1 && found2) {
        console.log('✅ Batch Import/Export verification passed!');
    } else {
        throw new Error('❌ Imported words not found in export!');
    }
}

verifyBatch().catch(err => {
    console.error(err);
    process.exit(1);
});
