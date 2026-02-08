
import * as fs from 'fs';
import * as path from 'path';
import { VOCABULARY } from '../prisma/vocab';

// Define the interface for our word data
interface WordData {
    phonetic: string;
    meanings: string[];
    examples: string[];
    mnemonic: string;
    category: string;
    partOfSpeech?: string;
}

// Helper to pre-clean meaning
function preCleanMeaning(meaning: string): string {
    let m = meaning;
    // Fix common double POS
    m = m.replace('adj. n.', 'n.');
    m = m.replace('adj. v.', 'v.');
    m = m.replace('adj. adj.', 'adj.');
    m = m.replace('adj. adv.', 'adv.');
    m = m.replace('n. n.', 'n.');
    m = m.replace('v. v.', 'v.');
    m = m.replace('v. adj.', 'adj.');
    return m;
}

// POS Extraction Logic
function extractPos(meanings: string[]): string | null {
    if (!meanings || meanings.length === 0) return null;
    const firstMeaning = meanings[0];
    const match = firstMeaning.match(/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.)/);
    return match ? match[0] : null;
}

function cleanMeaning(meaning: string, pos: string | null): string {
    if (!pos) return meaning;
    // Replace "n. meaning" -> "meaning"
    // Also trim space
    return meaning.replace(pos, '').trim();
}

function inferPos(word: string, meanings: string[]): string | null {
    const meaning = meanings[0] || '';

    // 1. Suffix Heuristics
    if (word.endsWith('tion') || word.endsWith('ment') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ance') || word.endsWith('ence') || word.endsWith('ist') || word.endsWith('sion') || word.endsWith('er') || word.endsWith('or')) return 'n.';
    if (word.endsWith('ize') || word.endsWith('ise') || word.endsWith('ate') || word.endsWith('fy')) return 'v.';
    if (word.endsWith('ous') || word.endsWith('ive') || word.endsWith('al') || word.endsWith('ic') || word.endsWith('ful') || word.endsWith('ble')) return 'adj.';
    if (word.endsWith('ly')) return 'adv.';

    // 2. Manual Overrides
    const verbs = ['sign up', 'pray', 'access', 'affect', 'agree', 'allow', 'admire', 'adopt', 'advise', 'advocate', 'afford', 'aim', 'analyze', 'annoy', 'answer', 'anticipate', 'appear', 'apply', 'appreciate', 'approach', 'approve', 'argue', 'arise', 'arrange', 'arrest', 'arrive', 'ask', 'assess', 'assist', 'attach', 'attack', 'attempt', 'attend', 'attract', 'avoid', 'force', 'hop', 'focus', 'doubt', 'guarantee', 'destroy', 'pay', 'fuel', 'absorb', 'accept', 'achieve', 'acquire', 'adapt', 'adjust', 'admit', 'advance', 'alert', 'alter', 'amaze', 'annoy'];
    if (verbs.includes(word)) return 'v.';

    if (['apart from'].includes(word)) return 'prep.';
    if (['furthermore', 'although'].includes(word)) return 'conj.';

    const nouns = ['deadline', 'tube', 'career', 'obstacle', 'angle', 'ancestor', 'academy', 'accident', 'accommodation', 'account', 'action', 'activity', 'addition', 'adult', 'advance', 'advantage', 'adventure', 'advertisement', 'advice', 'aim', 'amount', 'appetite', 'applicant'];
    if (nouns.includes(word)) return 'n.';

    return null;
}

const newVocab: Record<string, WordData> = {};

for (const [word, data] of Object.entries(VOCABULARY)) {
    const typedData = data as WordData;

    // 1. Pre-clean meanings (remove double POS)
    const preCleanedMeanings = typedData.meanings.map(m => preCleanMeaning(m));

    // 2. Extract POS
    let pos = extractPos(preCleanedMeanings);

    // 3. Infer if missing
    if (!pos) {
        pos = inferPos(word, preCleanedMeanings);
    }

    // 4. Clean meanings of the extracted POS
    let finalMeanings = preCleanedMeanings.map(m => cleanMeaning(m, pos));

    // 5. Clean Examples (remove [Type] prefixes)
    const cleanExamples = (typedData.examples || []).map(ex => {
        // Remove "[名词]..." at start
        // Pattern: [anything]text -> text
        return ex.replace(/^\[[^\]]+\]/, '');
    }).filter(ex => ex.trim().length > 0);

    newVocab[word] = {
        ...typedData,
        meanings: finalMeanings,
        examples: cleanExamples,
        partOfSpeech: pos || undefined
    };
}

// Generate File Content
const fileContent = `// Migrated Vocabulary Data
export const VOCABULARY: Record<string, any> = ${JSON.stringify(newVocab, null, 4)};`;

const outputPath = path.join(__dirname, '../prisma/vocab.ts');
fs.writeFileSync(outputPath, fileContent);

console.log(`Refactored vocab.ts safely. Processed ${Object.keys(newVocab).length} words.`);
