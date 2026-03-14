export type AchievementDefinition = {
    id: string;
    key: string;
    name: string;
    description: string;
    category: string;
    icon: string;
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    { id: 'growth_first_use', key: 'FIRST_USE', name: '初来乍到', description: '第一次使用程序', category: 'GROWTH', icon: '🌟' },
    { id: 'vol_10', key: 'VOLUME_10', name: '初窥词海', description: '掌握 10 个单词', category: 'VOLUME', icon: '📘' },
    { id: 'vol_30', key: 'VOLUME_30', name: '渐入佳境', description: '掌握 30 个单词', category: 'VOLUME', icon: '📗' },
    { id: 'vol_50', key: 'VOLUME_50', name: '小有积累', description: '掌握 50 个单词', category: 'VOLUME', icon: '📚' },
    { id: 'vol_100', key: 'VOLUME_100', name: '百词斩', description: '掌握 100 个单词', category: 'VOLUME', icon: '🎓' },
    { id: 'vol_200', key: 'VOLUME_200', name: '双百进阶', description: '掌握 200 个单词', category: 'VOLUME', icon: '🧠' },
    { id: 'vol_500', key: 'VOLUME_500', name: '半卷词典', description: '掌握 500 个单词', category: 'VOLUME', icon: '🏛️' },
    { id: 'vol_650', key: 'VOLUME_650', name: '稳步攀升', description: '掌握 650 个单词', category: 'VOLUME', icon: '🗺️' },
    { id: 'vol_1000', key: 'VOLUME_1000', name: '千词达人', description: '掌握 1000 个单词', category: 'VOLUME', icon: '👑' },
    { id: 'vol_1300', key: 'VOLUME_1300', name: '词汇宗师', description: '掌握 1300 个单词', category: 'VOLUME', icon: '🏆' },
    { id: 'cons_3', key: 'CONSISTENCY_3', name: '三日不辍', description: '连续学习 3 天', category: 'CONSISTENCY', icon: '🔥' },
    { id: 'cons_5', key: 'CONSISTENCY_5', name: '渐成习惯', description: '连续学习 5 天', category: 'CONSISTENCY', icon: '🕯️' },
    { id: 'cons_7', key: 'CONSISTENCY_7', name: '坚持一周', description: '连续学习 7 天', category: 'CONSISTENCY', icon: '🛡️' },
    { id: 'cons_10', key: 'CONSISTENCY_10', name: '十日之功', description: '连续学习 10 天', category: 'CONSISTENCY', icon: '⛰️' },
    { id: 'cons_14', key: 'CONSISTENCY_14', name: '半月如一', description: '连续学习 14 天', category: 'CONSISTENCY', icon: '🌤️' },
    { id: 'cons_21', key: 'CONSISTENCY_21', name: '习惯养成', description: '连续学习 21 天', category: 'CONSISTENCY', icon: '🌱' },
    { id: 'cons_30', key: 'CONSISTENCY_30', name: '月度自律', description: '连续学习 30 天', category: 'CONSISTENCY', icon: '🏅' },
    { id: 'growth_1', key: 'GROWTH_1', name: '初次出手', description: '首次答对 1 题', category: 'GROWTH', icon: '✨' },
    { id: 'growth_xp_100', key: 'GROWTH_XP_100', name: '渐有火候', description: '累计获得 100 XP', category: 'GROWTH', icon: '⚡' },
    { id: 'growth_xp_1000', key: 'GROWTH_XP_1000', name: '经验老手', description: '累计获得 1000 XP', category: 'GROWTH', icon: '🌟' },
    { id: 'wealth_50', key: 'WEALTH_50', name: '零钱包', description: '累计获得 50 金币', category: 'WEALTH', icon: '🪙' },
    { id: 'wealth_100', key: 'WEALTH_100', name: '储蓄罐', description: '累计获得 100 金币', category: 'WEALTH', icon: '💰' },
    { id: 'wealth_500', key: 'WEALTH_500', name: '第一桶金', description: '累计获得 500 金币', category: 'WEALTH', icon: '💵' },
    { id: 'wealth_1000', key: 'WEALTH_1000', name: '小富翁', description: '累计获得 1000 金币', category: 'WEALTH', icon: '💎' },
    { id: 'wealth_5000', key: 'WEALTH_5000', name: '财阀', description: '累计获得 5000 金币', category: 'WEALTH', icon: '🏦' },
    { id: 'prec_5', key: 'PRECISION_5', name: '五连击', description: '达成 5 连击', category: 'PRECISION', icon: '🎯' },
    { id: 'prec_10', key: 'PRECISION_10', name: '十连击', description: '达成 10 连击', category: 'PRECISION', icon: '🏹' },
    { id: 'prec_20', key: 'PRECISION_20', name: '二十连击', description: '达成 20 连击', category: 'PRECISION', icon: '🚀' },
    { id: 'prec_30', key: 'PRECISION_30', name: '三十连击', description: '达成 30 连击', category: 'PRECISION', icon: '☄️' },
    { id: 'prec_50', key: 'PRECISION_50', name: '神射手', description: '达成 50 连击', category: 'PRECISION', icon: '🏆' },
    { id: 'spec_night', key: 'SPECIAL_NIGHT', name: '夜猫子', description: '在凌晨 0 点到 4 点完成一次学习', category: 'SPECIAL', icon: '🌙' },
    { id: 'spec_morning', key: 'SPECIAL_MORNING', name: '早起鸟', description: '在清晨 5 点到 7 点完成一次学习', category: 'SPECIAL', icon: '🌅' },
];

export const ACHIEVEMENT_DEFINITION_MAP = new Map(
    ACHIEVEMENT_DEFINITIONS.map(def => [def.id, def]),
);
