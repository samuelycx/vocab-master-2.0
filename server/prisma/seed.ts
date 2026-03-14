import { PrismaClient } from '@prisma/client';
import { VOCABULARY } from './vocab';
import { TOEFL_VOCAB, GRE_VOCAB, BUSINESS_VOCAB } from './extra_vocab';
import { ACHIEVEMENT_DEFINITIONS } from '../src/progress/achievement-definitions';

const prisma = new PrismaClient();
const POS_SET = new Set(['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'pron.', 'num.', 'art.', 'int.', 'vt.', 'vi.']);
const MANUAL_POS_FIX: Record<string, string> = {
    accurate: 'adj.',
    adequate: 'adj.',
    approximate: 'adj.',
    intermediate: 'adj.',
    precise: 'adj.',
    private: 'adj.',
    candidate: 'n.',
    climate: 'n.',
    aim: 'n.',
    arrive: 'v.',
    deceive: 'v.',
    enable: 'v.',
    finding: 'n.',
    service: 'n.',
    assign: 'v.',
    borrow: 'v.',
    browse: 'v.',
    burn: 'v.',
    bury: 'v.',
    contact: 'v.',
    continue: 'v.',
    define: 'v.',
    instruct: 'v.',
    interrupt: 'v.',
    learn: 'v.',
    remove: 'v.',
    remain: 'v.',
    solve: 'v.',
    retrieve: 'v.',
    save: 'v.',
    seek: 'v.',
    surround: 'v.',
    toward: 'prep.',
    training: 'n.',
    painting: 'n.',
    opening: 'n.',
    feeling: 'n.',
    twinkle: 'v.',
    refuse: 'v.',
    reject: 'v.',
    seldom: 'adv.',
    understanding: 'n.',
};

function normalizePos(pos: any): string | null {
    if (!pos) return null;
    const p = String(pos).trim().toLowerCase().replace(/\s+/g, '');
    if (!p) return null;
    const withDot = p.endsWith('.') ? p : `${p}.`;
    return POS_SET.has(withDot) ? withDot : null;
}

function cleanChunk(text: any): string {
    if (text == null) return '';
    let s = String(text);
    s = s.replace(/\r?\n+/g, ' ');
    s = s.replace(/【释[^】\]]*[】\]]?/g, ' ');
    s = s.replace(/[【\[]\s*释[^】\]]*[】\]]?/g, ' ');
    s = s.replace(/^\s*[\]\[【】.。,，;；:：]+\s*/g, '');
    s = s.replace(/\s{2,}/g, ' ').trim();
    return s;
}

function normalizeArray(raw: any): string[] {
    const arr = Array.isArray(raw) ? raw : [raw];
    return [...new Set(arr.map(cleanChunk).filter(Boolean))];
}

function inferPos(word: string, meanings: string[]): string | null {
    const w = String(word || '').trim().toLowerCase();
    if (!w || /\s/.test(w) || /\.\.\./.test(w)) return null;
    const m = meanings[0] || '';
    if (!m) return null;
    if (/的$/.test(m)) return 'adj.';
    if (/地$/.test(m)) return 'adv.';
    if (/(人|者|性|度|力|率|学|术|法|品|物|体|气候|历史|语言|环境|细胞|世纪|类别|概念)$/.test(m)) return 'n.';
    if (/^(使|让|把|将|进行|做|提高|改善|沟通|传达|阻止|探索|调查|分类|补偿|提倡|影响|买得起|承认|采用|调整|钦佩|预测|偏爱|创作|妥协)/.test(m)) return 'v.';
    if (/(tion|sion|ment|ness|ity|er|or|ist|ship|age)$/.test(w)) return 'n.';
    if (/(ous|ful|less|able|ible|al|ive|ic|ary|ory|ent|ant)$/.test(w)) return 'adj.';
    if (/ly$/.test(w)) return 'adv.';
    if (/(ize|ise|ate|fy|en)$/.test(w)) return 'v.';
    return null;
}

async function main() {
    console.log('Start seeding...');
    for (const ach of ACHIEVEMENT_DEFINITIONS) {
        await prisma.achievement.upsert({
            where: { id: ach.id },
            update: ach,
            create: ach
        });
    }
    console.log('Achievements seeded.');

    const allVocabSets = [
        { data: VOCABULARY, defaultCategory: 'GENERAL' },
        { data: TOEFL_VOCAB, defaultCategory: 'TOEFL' },
        { data: GRE_VOCAB, defaultCategory: 'GRE' },
        { data: BUSINESS_VOCAB, defaultCategory: 'BUSINESS' }
    ];

    let totalCount = 0;
    for (const set of allVocabSets) {
        console.log(`Seeding ${set.defaultCategory} set...`);
        let setCount = 0;
        for (const [text, data] of Object.entries(set.data)) {
            const { phonetic, meanings, examples, mnemonic, category, partOfSpeech } = data as any;
            if (!text) continue;

            let finalCategory = category || set.defaultCategory;
            if (set.defaultCategory === 'GENERAL') finalCategory = 'GENERAL';
            const normalizedMeanings = normalizeArray(meanings);
            const normalizedExamples = normalizeArray(examples);
            const manualPos = MANUAL_POS_FIX[String(text).toLowerCase()];
            const finalPos = manualPos || normalizePos(partOfSpeech) || inferPos(text, normalizedMeanings);

            await prisma.word.upsert({
                where: { text },
                update: {
                    phonetic: phonetic || null,
                    partOfSpeech: finalPos,
                    meanings: JSON.stringify(normalizedMeanings),
                    examples: JSON.stringify(normalizedExamples),
                    mnemonic: mnemonic || null,
                    category: finalCategory,
                },
                create: {
                    text,
                    phonetic: phonetic || null,
                    partOfSpeech: finalPos,
                    meanings: JSON.stringify(normalizedMeanings),
                    examples: JSON.stringify(normalizedExamples),
                    mnemonic: mnemonic || null,
                    category: finalCategory,
                },
            });
            setCount++;
            totalCount++;
            if (totalCount % 500 === 0) console.log(`Processed ${totalCount} words total...`);
        }
        console.log(`${set.defaultCategory} seeded with ${setCount} words.`);
    }
    console.log(`Seeding finished. Processed ${totalCount} words total.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
