
const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '../server/prisma/vocab.ts');
let content = fs.readFileSync(vocabPath, 'utf8');

// 1. Regex Fixes (Prefix cleanup)
const cleanups = [
    { from: /"adj\. adj\./g, to: '"adj.' },
    { from: /"adj\. n\./g, to: '"n.' },
    { from: /"adj\. v\./g, to: '"v.' },
    { from: /"adj\. adv\./g, to: '"adv.' },
    { from: /"n\. n\./g, to: '"n.' },
    { from: /"v\. v\./g, to: '"v.' },
    { from: /"v\. adj\./g, to: '"adj.' },
    // Spacing
    { from: /"(adj\.|n\.|v\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.)([^ ])/g, to: '"$1 $2' },
];

cleanups.forEach(({ from, to }) => {
    content = content.replace(from, to);
});

// 2. Specific Fixes
const specifics = [
    { from: /"adj\. 祷告"/g, to: '"v. 祷告"' },
    { from: /"adj\. 崇拜"/g, to: '"v. 崇拜"' },
];
specifics.forEach(({ from, to }) => {
    content = content.replace(from, to);
});

// 3. Strict English Suffix Inference
const entryRegex = /"([a-zA-Z -]+)":\s*\{\s*\n\s*"phonetic":\s*".*?",\s*\n\s*"meanings":\s*\[\s*\n\s*"([^"]+)"/g;

content = content.replace(entryRegex, (match, word, meaning) => {
    // If meaning already has valid POS, skip
    if (/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.)/.test(meaning)) {
        return match;
    }

    let p = '';
    // Strict Suffixes
    if (word.endsWith('tion') || word.endsWith('ment') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ance') || word.endsWith('ence') || word.endsWith('ist') || word.endsWith('sion')) {
        p = 'n.';
    } else if (word.endsWith('ize') || word.endsWith('ise') || word.endsWith('ate') || word.endsWith('fy')) {
        p = 'v.';
    } else if (word.endsWith('ous') || word.endsWith('ive') || word.endsWith('al') || word.endsWith('ic') || word.endsWith('ful') || word.endsWith('ble')) {
        p = 'adj.';
    } else if (word.endsWith('ly')) {
        p = 'adv.';
    }

    // NO Chinese Heuristics to avoid "camp -> adv" error

    if (p) {
        console.log(`Inferring ${p} for ${word}: ${meaning}`);
        return match.replace(`"${meaning}"`, `"${p} ${meaning}"`);
    }

    return match;
});

fs.writeFileSync(vocabPath, content, 'utf8');
console.log('Cleaned vocab.ts safely');
