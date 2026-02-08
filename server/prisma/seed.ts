import { PrismaClient } from '@prisma/client';
import { VOCABULARY } from './vocab';
import { TOEFL_VOCAB, GRE_VOCAB, BUSINESS_VOCAB } from './extra_vocab';

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
    { id: 'streak_3', key: 'STREAK_3', name: '坚持不懈 I', description: '连续打卡 3 天', category: 'CONSISTENCY', icon: '🔥' },
    { id: 'streak_7', key: 'STREAK_7', name: '坚持不懈 II', description: '连续打卡 7 天', category: 'CONSISTENCY', icon: '🔥🔥' },
    { id: 'streak_30', key: 'STREAK_30', name: '自律大师', description: '连续打卡 30 天', category: 'CONSISTENCY', icon: '🧘' },
    { id: 'master_50', key: 'MASTER_50', name: '初级学者', description: '掌握 50 个单词', category: 'VOLUME', icon: '📚' },
    { id: 'master_200', key: 'MASTER_200', name: '中级学者', description: '掌握 200 个单词', category: 'VOLUME', icon: '🎓' },
    { id: 'master_1000', key: 'MASTER_1000', name: '词汇大师', description: '掌握 1000 个单词', category: 'VOLUME', icon: '👑' },
    { id: 'wealth_1000', key: 'WEALTH_1000', name: '第一桶金', description: '累计获得 1000 金币', category: 'WEALTH', icon: '💰' },
    { id: 'pk_1', key: 'PK_WIN_1', name: '初出茅庐', description: '在 PK 竞技场赢得 1 场胜利', category: 'SOCIAL', icon: '⚔️' },
    { id: 'pk_10', key: 'PK_WIN_10', name: '角斗士', description: '在 PK 竞技场赢得 10 场胜利', category: 'SOCIAL', icon: '🛡️' },
    { id: 'pk_streak_3', key: 'PK_STREAK_3', name: '无人能挡', description: '在 PK 竞技场获得 3 连胜', category: 'SOCIAL', icon: '🔥' },
    { id: 'toefl_100', key: 'TOEFL_100', name: '托福起航', description: '在 TOEFL 词书中掌握 100 个单词', category: 'SPECIALTY', icon: '🗽' },
    { id: 'gre_100', key: 'GRE_100', name: 'GRE 进阶', description: '在 GRE 词书中掌握 100 个单词', category: 'SPECIALTY', icon: '🏛️' },
    { id: 'biz_50', key: 'BIZ_50', name: '职场达人', description: '在 Business 词书中掌握 50 个单词', category: 'SPECIALTY', icon: '💼' }
];

async function main() {
    console.log('Start seeding...');
    for (const ach of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { key: ach.key },
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

            await prisma.word.upsert({
                where: { text },
                update: {
                    phonetic: phonetic || null,
                    partOfSpeech: partOfSpeech || null,
                    meanings: JSON.stringify(meanings || []),
                    examples: JSON.stringify(examples || []),
                    mnemonic: mnemonic || null,
                    category: finalCategory,
                },
                create: {
                    text,
                    phonetic: phonetic || null,
                    partOfSpeech: partOfSpeech || null,
                    meanings: JSON.stringify(meanings || []),
                    examples: JSON.stringify(examples || []),
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
