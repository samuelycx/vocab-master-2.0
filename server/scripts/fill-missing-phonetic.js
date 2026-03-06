const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VOCAB_PATH = path.join(__dirname, '../prisma/vocab.ts');
const REPORT_PATH = path.join(__dirname, '../missing_phonetic_words.json');

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadVocabulary() {
  let source = fs.readFileSync(VOCAB_PATH, 'utf8');
  source = source.replace(
    /export const\s+VOCABULARY\s*:\s*Record<string,\s*any>\s*=\s*/,
    'globalThis.VOCABULARY = ',
  );
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(source, ctx, { timeout: 10000 });
  return ctx.VOCABULARY || {};
}

function extractPhonetic(entry) {
  if (!entry || typeof entry !== 'object') return '';
  if (entry.phonetic && String(entry.phonetic).trim()) return String(entry.phonetic).trim();
  if (!Array.isArray(entry.phonetics)) return '';
  const hit = entry.phonetics.find((p) => p && p.text && String(p.text).trim());
  return hit ? String(hit.text).trim() : '';
}

async function fetchPhonetic(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'vocab-master-phonetic-filler/1.0',
      Accept: 'application/json',
    },
  });

  if (!res.ok) return '';
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return '';

  for (const entry of data) {
    const p = extractPhonetic(entry);
    if (p) return p;
  }
  return '';
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const vocab = loadVocabulary();
  const words = Object.keys(vocab);
  const missing = words.filter((word) => {
    const p = vocab[word]?.phonetic;
    return !String(p || '').trim();
  });
  const singleWordMissing = missing.filter((word) => /^[A-Za-z-]+$/.test(word));
  const skippedPhrases = missing.filter((word) => !/^[A-Za-z-]+$/.test(word));

  console.log(
    `Found ${missing.length} missing; ${singleWordMissing.length} single words to fill, ${skippedPhrases.length} phrases skipped.`,
  );

  const resolved = [];
  const unresolved = [];

  for (let i = 0; i < singleWordMissing.length; i++) {
    const word = singleWordMissing[i];
    const phonetic = await fetchPhonetic(word);
    if (phonetic) {
      resolved.push({ word, phonetic });
      console.log(`[${i + 1}/${singleWordMissing.length}] OK ${word} -> ${phonetic}`);
    } else {
      unresolved.push(word);
      console.log(`[${i + 1}/${singleWordMissing.length}] MISS ${word}`);
    }
    await sleep(120);
  }

  let source = fs.readFileSync(VOCAB_PATH, 'utf8');
  for (const item of resolved) {
    const blockRe = new RegExp(
      `("${escapeRegex(item.word)}"\\s*:\\s*\\{[\\s\\S]*?"phonetic"\\s*:\\s*)""`,
      'm',
    );
    source = source.replace(blockRe, `$1"${item.phonetic.replace(/"/g, '\\"')}"`);
  }
  fs.writeFileSync(VOCAB_PATH, source, 'utf8');

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        checked: missing.length,
        checkedSingleWords: singleWordMissing.length,
        skippedPhrases: skippedPhrases.length,
        skippedPhraseWords: skippedPhrases,
        filled: resolved.length,
        unresolved: unresolved.length,
        unresolvedWords: unresolved,
        filledWords: resolved,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`Filled: ${resolved.length}, Unresolved: ${unresolved.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
