
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const achievements = [
    // GROWTH (New Category for basics)
    { id: 'growth_1', key: 'FIRST_BLOOD', name: '第一滴血', description: '完成第一次答对', category: 'GROWTH', icon: '🩸' },
    { id: 'growth_xp_100', key: 'XP_100', name: '初露锋芒', description: '累计获得 100 经验值', category: 'GROWTH', icon: '✨' },
    { id: 'growth_xp_1000', key: 'XP_1000', name: '经验丰富', description: '累计获得 1000 经验值', category: 'GROWTH', icon: '🌟' },

    // CONSISTENCY
    { id: 'cons_3', key: 'STREAK_3', name: '初出茅庐', description: '连续打卡 3 天', category: 'CONSISTENCY', icon: '🌱' },
    { id: 'cons_5', key: 'STREAK_5', name: '坚持不懈', description: '连续打卡 5 天', category: 'CONSISTENCY', icon: '🌿' },
    { id: 'cons_7', key: 'STREAK_7', name: '习惯成自然', description: '连续打卡 7 天', category: 'CONSISTENCY', icon: '📅' },
    { id: 'cons_10', key: 'STREAK_10', name: '十全十美', description: '连续打卡 10 天', category: 'CONSISTENCY', icon: '🍂' },
    { id: 'cons_14', key: 'STREAK_14', name: '风雨无阻', description: '连续打卡 14 天', category: 'CONSISTENCY', icon: '🛡️' },
    { id: 'cons_21', key: 'STREAK_21', name: '自律大师', description: '连续打卡 21 天', category: 'CONSISTENCY', icon: '🧘' },
    { id: 'cons_30', key: 'STREAK_30', name: '月度模范', description: '连续打卡 30 天', category: 'CONSISTENCY', icon: '🏆' },

    // PRECISION
    { id: 'prec_perf', key: 'PERFECT_SESSION', name: '小试牛刀', description: '单局准确率 100%', category: 'PRECISION', icon: '🎯' },
    { id: 'prec_5', key: 'COMBO_5', name: '五连绝世', description: '连续答对 5 题', category: 'PRECISION', icon: '⚡' },
    { id: 'prec_10', key: 'COMBO_10', name: '不可阻挡', description: '连续答对 10 题', category: 'PRECISION', icon: '🔥' },
    { id: 'prec_20', key: 'COMBO_20', name: '神射手', description: '连续答对 20 题', category: 'PRECISION', icon: '🏹' },
    { id: 'prec_30', key: 'COMBO_30', name: '超神', description: '连续答对 30 题', category: 'PRECISION', icon: '💫' },
    { id: 'prec_50', key: 'COMBO_50', name: '鹰眼', description: '连续答对 50 题', category: 'PRECISION', icon: '🦅' },

    // VOLUME
    { id: 'vol_10', key: 'WORDS_10', name: '积跬步', description: '掌握 10 个单词', category: 'VOLUME', icon: '🦶' },
    { id: 'vol_30', key: 'WORDS_30', name: '入门', description: '掌握 30 个单词', category: 'VOLUME', icon: '🚪' },
    { id: 'vol_50', key: 'WORDS_50', name: '第一桶金', description: '掌握 50 个单词', category: 'VOLUME', icon: '💰' },
    { id: 'vol_100', key: 'WORDS_100', name: '百词斩', description: '掌握 100 个单词', category: 'VOLUME', icon: '🗡️' },
    { id: 'vol_200', key: 'WORDS_200', name: '积少成多', description: '掌握 200 个单词', category: 'VOLUME', icon: '📚' },
    { id: 'vol_500', key: 'WORDS_500', name: '博闻强识', description: '掌握 500 个单词', category: 'VOLUME', icon: '🧠' },
    { id: 'vol_650', key: 'WORDS_650', name: '半壁江山', description: '掌握 650 个单词 (50%)', category: 'VOLUME', icon: '⚔️' },
    { id: 'vol_1000', key: 'WORDS_1000', name: '千词斩', description: '掌握 1000 个单词', category: 'VOLUME', icon: '🔥' },
    { id: 'vol_1300', key: 'WORDS_1300', name: '大满贯', description: '掌握全库 1300+ 个单词', category: 'VOLUME', icon: '👑' },

    // WEALTH
    { id: 'wealth_50', key: 'COINS_50', name: '零花钱', description: '累计获得 50 金币', category: 'WEALTH', icon: '🪙' },
    { id: 'wealth_100', key: 'COINS_100', name: '储蓄罐', description: '累计获得 100 金币', category: 'WEALTH', icon: '🐷' },
    { id: 'wealth_500', key: 'COINS_500', name: '第一桶金', description: '累计获得 500 金币', category: 'WEALTH', icon: '💰' },
    { id: 'wealth_1000', key: 'COINS_1000', name: '小富翁', description: '累计获得 1000 金币', category: 'WEALTH', icon: '💸' },
    { id: 'wealth_5000', key: 'COINS_5000', name: '财阀', description: '累计获得 5000 金币', category: 'WEALTH', icon: '🏦' },

    // SPECIAL
    { id: 'spec_night', key: 'NIGHT_OWL', name: '夜猫子', description: '在凌晨 0:00 - 4:00 之间完成一次学习', category: 'SPECIAL', icon: '🦉' },
    { id: 'spec_morning', key: 'EARLY_BIRD', name: '早起的鸟儿', description: '在清晨 5:00 - 7:00 之间完成一次学习', category: 'SPECIAL', icon: '🐦' },
];

async function main() {
    for (const ach of achievements) {
        await prisma.achievement.upsert({
            where: { id: ach.id },
            update: ach,
            create: ach,
        });
    }
    console.log(`Seeded ${achievements.length} achievements.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
