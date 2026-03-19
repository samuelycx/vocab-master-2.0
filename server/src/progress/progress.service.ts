import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { AchievementService } from './achievement.service';

@Injectable()
export class ProgressService {
    constructor(
        private prisma: PrismaService,
        private achievementService: AchievementService
    ) { }

    async syncProgress(dto: UpdateProgressDto) {
        // 1. Get existing record to calculate SRS
        const existingRecord = await this.prisma.studyRecord.findUnique({
            where: {
                userId_wordId: {
                    userId: dto.userId,
                    wordId: dto.wordId
                }
            }
        }) || { interval: 0, repetition: 0, easeFactor: 2.5, mistakeCount: 0, reviewStage: 0 }; // Default if new

        // Calculate SRS
        const isCorrect = dto.status === 'MASTERED' || (dto.status === 'LEARNING' && (dto.xpGained || 0) > 0);
        const isReview = dto.mode === 'review';
        // Note: The frontend sends STATUS based on its own logic. 
        // A better approach: define 'quality' based on if it was a "correct answer" event.
        // Assuming dto.xpGained > 0 implies correct.
        // Or we can infer "Mistake" if status didn't improve?
        // Let's assume: if status is provided, we use it.
        // But for SRS, we need to know if it was *correct* this time.
        // Let's use a heuristic: if coinsGained > 0 or xpGained > 0, it's correct.
        // If it's a "mistake", the frontend usually wouldn't send MASTERED.

        const quality = ((dto.xpGained || 0) > 0 || (dto.coinsGained || 0) > 0) ? 5 : 0;
        const srsData = this.calculateNextReview(existingRecord, quality);
        const now = new Date();
        const fixedReviewData = this.calculateNextReviewFixed(existingRecord, isCorrect, isReview, now);

        // Keep mistake count from permanently pinning words in review pool:
        // wrong answers increment, correct review answers clear the active mistake flag.
        const currentMistakeCount = Math.max(0, Number(existingRecord.mistakeCount) || 0);
        let newMistakeCount = currentMistakeCount;
        if (!isCorrect) {
            newMistakeCount = currentMistakeCount + 1;
        } else if (isReview) {
            newMistakeCount = 0;
        }

        // 1. Update/Create Study Record
        const record = await this.prisma.studyRecord.upsert({
            where: {
                userId_wordId: {
                    userId: dto.userId,
                    wordId: dto.wordId
                }
            },
            update: {
                status: dto.status,
                nextReview: isReview ? fixedReviewData.nextReview : (isCorrect ? srsData.nextReview : fixedReviewData.nextReview),
                interval: srsData.interval,
                repetition: srsData.repetition,
                easeFactor: srsData.easeFactor,
                mistakeCount: newMistakeCount,
                reviewStage: isReview || !isCorrect ? fixedReviewData.reviewStage : (existingRecord.reviewStage || 0)
            },
            create: {
                userId: dto.userId,
                wordId: dto.wordId,
                status: dto.status,
                nextReview: isReview ? fixedReviewData.nextReview : (isCorrect ? srsData.nextReview : fixedReviewData.nextReview),
                interval: srsData.interval,
                repetition: srsData.repetition,
                easeFactor: srsData.easeFactor,
                mistakeCount: newMistakeCount,
                reviewStage: isReview || !isCorrect ? fixedReviewData.reviewStage : (existingRecord.reviewStage || 0)
            }
        });

        // 2. Handle Gamification
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            include: { progress: true }
        });

        if (user) {
            let newXp = user.xp + (dto.xpGained || 0);
            let newCoins = user.coins + (dto.coinsGained || 0);
            let newTotalCorrect = user.totalCorrect + (dto.status === 'MASTERED' ? 1 : 0);

            // Streak Logic
            let newStreak = user.streak;
            const now = new Date();
            const lastActive = user.lastActive;

            if (!lastActive) {
                newStreak = 1;
            } else {
                const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    newStreak++;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            }

            // Rank Logic based on Mastered Vocab (per AchievementService design)
            const masteredCount = user.progress.filter(p => p.status === 'MASTERED').length;
            const targetRank = this.achievementService.getRankByVocab(masteredCount);
            const newLevel = targetRank.level;

            const updatedUser = await this.prisma.user.update({
                where: { id: dto.userId },
                data: {
                    xp: newXp,
                    coins: newCoins,
                    level: newLevel,
                    totalCorrect: newTotalCorrect,
                    streak: newStreak,
                    lastActive: now
                }
            });

            // Check Achievements
            const newlyUnlocked = await this.achievementService.checkAchievements(dto.userId);

            return {
                record,
                user: {
                    ...this.toSafeUser(updatedUser),
                    rankTitle: targetRank.title,
                    rankIcon: targetRank.icon
                },
                leveledUp: newLevel > user.level,
                achievements: newlyUnlocked
            };
        }

        return { record };
    }

    async getUserStats(userId: string) {
        let user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { achievements: { include: { achievement: true } } }
        });

        if (user && (!Array.isArray(user.achievements) || user.achievements.length === 0)) {
            await this.achievementService.ensureFirstUseAchievement(userId);
            user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { achievements: { include: { achievement: true } } }
            });
        }

        const records = await this.prisma.studyRecord.findMany({
            where: { userId },
            include: { word: true }
        });

        // Calculate progress per category
        const categories = ['GENERAL', 'TOEFL', 'GRE', 'BUSINESS'];
        const categoryStats: Record<string, { learned: number, mastered: number, total: number }> = {};
        const normalizeCategory = (value: unknown) => {
            const text = String(value || '').trim().toUpperCase();
            return categories.includes(text) ? text : 'GENERAL';
        };

        for (const cat of categories) {
            const catRecords = records.filter((r) => normalizeCategory(r.word?.category) === cat);
            const totalInCat = await this.prisma.word.count({ where: { category: cat } });
            categoryStats[cat] = {
                learned: catRecords.length,
                mastered: catRecords.filter(r => r.status === 'MASTERED' || (r.reviewStage || 0) >= 3).length,
                total: totalInCat
            };
        }

        const masteredCount = records.filter(r => r.status === 'MASTERED' || (r.reviewStage || 0) >= 3).length;
        const currentRank = this.achievementService.getRankByVocab(masteredCount);

        return {
            total: records.length,
            mastered: masteredCount,
            categoryStats,
            user: user ? {
                ...this.toSafeUser(user),
                rankTitle: currentRank.title,
                rankIcon: currentRank.icon
            } : null
        };
    }
    async getAllAchievements() {
        return this.achievementService.getAllAchievements();
    }

    async getLeaderboard(limit: number = 10) {
        return this.prisma.user.findMany({
            orderBy: { xp: 'desc' },
            take: limit,
            select: {
                id: true,
                username: true,
                avatar: true,
                level: true,
                xp: true,
                coins: true,
                totalCorrect: true,
                streak: true
            }
        });
        // checked schema.prisma, User model has level, xp, coins.
        // It does NOT have rankTitle stored. It's calculated in service.
        // So we might need to calculate it or just send level.
    }

    async resetProgress(userId: string) {
        return this.prisma.$transaction(async (prisma) => {
            // 1. Delete all study records
            await prisma.studyRecord.deleteMany({
                where: { userId }
            });

            // 2. Delete all user achievements
            await prisma.userAchievement.deleteMany({
                where: { userId }
            });

            // 3. Reset user stats
            await prisma.user.update({
                where: { id: userId },
                data: {
                    level: 1,
                    xp: 0,
                    coins: 100,
                    streak: 1,
                    totalCorrect: 0,
                    maxCombo: 0,
                    lastActive: new Date()
                }
            });

            return { success: true };
        });
    }

    async updateTargetCategory(userId: string, category: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { targetCategory: category }
        });
    }

    // --- SRS Logic ---

    private readonly fixedReviewSteps = [
        { minutes: 10 },
        { days: 1 },
        { days: 3 },
        { days: 7 },
        { days: 15 },
        { days: 30 },
        { days: 60 },
        { days: 120 },
    ];

    // Calculate next review based on SM-2 algorithm (simplified)
    private calculateNextReview(currentRecord: any, quality: number): { interval: number, repetition: number, easeFactor: number, nextReview: Date } {
        let interval = currentRecord.interval || 0;
        let repetition = currentRecord.repetition || 0;
        let easeFactor = currentRecord.easeFactor || 2.5;

        if (quality >= 3) { // Correct answer (3-5 range usually, here we simplify to >=3 is correct)
            if (repetition === 0) {
                interval = 1;
            } else if (repetition === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetition++;
            // EF adjustment: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
            // Here we assume "CORRECT" is quality 5.
            easeFactor = easeFactor + 0.1;
        } else { // Incorrect
            repetition = 0;
            interval = 1;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
        }

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        // Randomize slightly to prevent bunching? Maybe later.

        return { interval, repetition, easeFactor, nextReview };
    }

    private calculateNextReviewFixed(
        currentRecord: any,
        isCorrect: boolean,
        isReview: boolean,
        now: Date = new Date()
    ): { reviewStage: number, nextReview: Date } {
        const currentStage = currentRecord.reviewStage || 0;
        const maxStage = this.fixedReviewSteps.length - 1;

        if (!isCorrect) {
            const resetReview = new Date(now.getTime() + 10 * 60 * 1000);
            return { reviewStage: 0, nextReview: resetReview };
        }

        if (!isReview) {
            return { reviewStage: currentStage, nextReview: new Date(now) };
        }

        const stepIndex = Math.min(currentStage, maxStage);
        const step = this.fixedReviewSteps[stepIndex];
        const nextReview = new Date(now);

        if (step.minutes) {
            nextReview.setTime(nextReview.getTime() + step.minutes * 60 * 1000);
        } else if (step.days) {
            nextReview.setDate(nextReview.getDate() + step.days);
        }

        const nextStage = Math.min(currentStage + 1, maxStage);
        return { reviewStage: nextStage, nextReview };
    }

    private toSafeUser(user: any) {
        if (!user) return user;
        const { passwordHash, sessionToken, sessionExpiresAt, ...safeUser } = user;
        return safeUser;
    }

    async getReviews(userId: string) {
        const now = new Date();
        const reviews = await this.prisma.studyRecord.findMany({
            where: {
                userId,
                OR: [
                    { mistakeCount: { gt: 0 } },
                    { nextReview: { lte: now } }
                ]
            },
            include: { word: true },
            orderBy: { nextReview: 'asc' },
            take: 20
        });
        return reviews;
    }

    async getReviewPoolCount(userId: string) {
        const now = new Date();
        return this.prisma.studyRecord.count({
            where: {
                userId,
                OR: [
                    { mistakeCount: { gt: 0 } },
                    { nextReview: { lte: now } }
                ]
            }
        });
    }

    async getReviewSessionWords(userId: string, limit = 30) {
        const now = new Date();
        const records = await this.prisma.studyRecord.findMany({
            where: {
                userId,
                OR: [
                    { mistakeCount: { gt: 0 } },
                    { nextReview: { lte: now } }
                ]
            },
            include: { word: true },
        });

        const shuffled = records.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
    }

    async getMistakes(userId: string) {
        return this.prisma.studyRecord.findMany({
            where: {
                userId,
                mistakeCount: { gt: 0 }
            },
            include: { word: true },
            orderBy: { mistakeCount: 'desc' },
            take: 20
        });
    }
    async getLearnedWords(userId: string, page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;
        const whereClause: any = {
            userId,
            status: { not: 'NEW' } // Only show words that have been interacted with
        };

        if (search) {
            whereClause.word = {
                word: { contains: search }
            };
        }

        const [words, total] = await Promise.all([
            this.prisma.studyRecord.findMany({
                where: whereClause,
                include: { word: true },
                orderBy: { id: 'desc' }, // Show recently learned first (by ID as proxy)
                skip,
                take: limit
            }),
            this.prisma.studyRecord.count({ where: whereClause })
        ]);

        return {
            data: words,
            total,
            page,
            lastPage: Math.ceil(total / limit)
        };
    }
}
