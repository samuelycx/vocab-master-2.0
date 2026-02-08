
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Rank {
    level: number;
    title: string;
    vocabRequired: number;
    icon: string;
}

export const RANKS: Rank[] = [
    { level: 1, title: '流浪者 (Wanderer)', vocabRequired: 0, icon: '🍂' },
    { level: 2, title: '新手 (Novice)', vocabRequired: 30, icon: '🌱' },
    { level: 3, title: '学徒 (Apprentice)', vocabRequired: 80, icon: '🪵' },
    { level: 4, title: '巡林客 (Ranger)', vocabRequired: 150, icon: '🏹' },
    { level: 5, title: '探索者 (Explorer)', vocabRequired: 250, icon: '🧭' },
    { level: 6, title: '冒险家 (Adventurer)', vocabRequired: 350, icon: '🎒' },
    { level: 7, title: '佣兵 (Mercenary)', vocabRequired: 480, icon: '⚔️' },
    { level: 8, title: '老兵 (Veteran)', vocabRequired: 600, icon: '🛡️' },
    { level: 9, title: '骑士 (Knight)', vocabRequired: 750, icon: '🐴' },
    { level: 10, title: '学者 (Scholar)', vocabRequired: 900, icon: '📜' },
    { level: 11, title: '魔导师 (Mage)', vocabRequired: 1050, icon: '🔮' },
    { level: 12, title: '大师 (Master)', vocabRequired: 1150, icon: '🏆' },
    { level: 13, title: '宗师 (Grandmaster)', vocabRequired: 1250, icon: '👑' },
    { level: 14, title: '传说 (Legend)', vocabRequired: 1300, icon: '🐲' },
    { level: 15, title: '半神 (Demigod)', vocabRequired: 1301, icon: '🌟' },
];

@Injectable()
export class AchievementService {
    constructor(private prisma: PrismaService) { }

    async checkAchievements(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { achievements: true, progress: true }
        });

        if (!user) return [];

        const masteredCount = user.progress.filter(p => p.status === 'MASTERED').length;
        const earnedIds = new Set(user.achievements.map(a => a.achievementId));
        const newEarned: any[] = [];

        // Check Volume (Words Mastered)
        const volumeMap = {
            'vol_10': 10,
            'vol_30': 30,
            'vol_50': 50,
            'vol_100': 100,
            'vol_200': 200,
            'vol_500': 500,
            'vol_650': 650,
            'vol_1000': 1000,
            'vol_1300': 1300
        };

        for (const [id, req] of Object.entries(volumeMap)) {
            if (masteredCount >= req && !earnedIds.has(id)) {
                newEarned.push(id);
            }
        }

        // Check Consistency (Streak)
        const streakMap = {
            'cons_3': 3,
            'cons_5': 5,
            'cons_7': 7,
            'cons_10': 10,
            'cons_14': 14,
            'cons_21': 21,
            'cons_30': 30
        };
        for (const [id, req] of Object.entries(streakMap)) {
            if (user.streak >= req && !earnedIds.has(id)) {
                newEarned.push(id);
            }
        }

        // Check Growth (XP / Total Correct)
        if (user.totalCorrect >= 1 && !earnedIds.has('growth_1')) {
            newEarned.push('growth_1'); // First Blood
        }
        const xpMap = {
            'growth_xp_100': 100,
            'growth_xp_1000': 1000
        };
        for (const [id, req] of Object.entries(xpMap)) {
            if (user.xp >= req && !earnedIds.has(id)) {
                newEarned.push(id);
            }
        }

        // Check Wealth (Coins)
        const wealthMap = {
            'wealth_50': 50,
            'wealth_100': 100,
            'wealth_500': 500,
            'wealth_1000': 1000,
            'wealth_5000': 5000
        };
        for (const [id, req] of Object.entries(wealthMap)) {
            if (user.coins >= req && !earnedIds.has(id)) {
                newEarned.push(id);
            }
        }

        // Check Precision (Max Combo)
        // Note: ProgressService doesn't pass maxCombo in payload, but updates User.
        // We assume user.maxCombo is updated.
        // Check schema to ensure maxCombo exists on User. We did add it.
        const comboMap = {
            'prec_5': 5,
            'prec_10': 10,
            'prec_20': 20,
            'prec_30': 30,
            'prec_50': 50
        };
        // Use user.maxCombo if available, else standard fallback
        // The User model has maxCombo.
        const currentMaxCombo = (user as any).maxCombo || 0;
        for (const [id, req] of Object.entries(comboMap)) {
            if (currentMaxCombo >= req && !earnedIds.has(id)) {
                newEarned.push(id);
            }
        }

        // Check Special (Night Owl / Early Bird)
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 4 && !earnedIds.has('spec_night')) {
            newEarned.push('spec_night');
        }
        if (hour >= 5 && hour < 7 && !earnedIds.has('spec_morning')) {
            newEarned.push('spec_morning');
        }

        if (newEarned.length > 0) {
            await this.prisma.userAchievement.createMany({
                data: newEarned.map(aid => ({
                    userId,
                    achievementId: aid
                }))
            });

            // Fetch the details of new achievements
            return this.prisma.achievement.findMany({
                where: { id: { in: newEarned } }
            });
        }

        return [];
    }

    async getAllAchievements() {
        return this.prisma.achievement.findMany();
    }

    getRankByVocab(vocabCount: number): Rank {
        let currentRank = RANKS[0];
        for (const rank of RANKS) {
            if (vocabCount >= rank.vocabRequired) {
                currentRank = rank;
            } else {
                break;
            }
        }
        return currentRank;
    }
}
