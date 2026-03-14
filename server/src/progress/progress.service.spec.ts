import { ProgressService } from './progress.service';

describe('ProgressService', () => {
    const prisma = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        userAchievement: {
            createMany: jest.fn(),
        },
        studyRecord: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
        word: {
            count: jest.fn(),
        },
    };
    const achievementService = {
        getRankByVocab: jest.fn(() => ({ title: 'Rookie', icon: '🌱', level: 1 })),
        ensureFirstUseAchievement: jest.fn(),
    };

    let service: ProgressService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new ProgressService(prisma as any, achievementService as any);
    });

    it('does not expose auth secrets in user stats payload', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            username: 'alice',
            passwordHash: 'secret-hash',
            sessionToken: 'secret-token',
            sessionExpiresAt: new Date('2026-03-20T00:00:00.000Z'),
            achievements: [],
        });
        prisma.studyRecord.findMany.mockResolvedValue([]);
        prisma.word.count.mockResolvedValue(0);

        const result = await service.getUserStats('user-1');

        expect(result.user).toEqual(expect.objectContaining({ id: 'user-1', username: 'alice' }));
        expect(result.user.passwordHash).toBeUndefined();
        expect(result.user.sessionToken).toBeUndefined();
        expect(result.user.sessionExpiresAt).toBeUndefined();
    });

    it('auto grants first-use achievement in user stats when user has no achievements yet', async () => {
        prisma.user.findUnique
            .mockResolvedValueOnce({
                id: 'user-1',
                username: 'alice',
                achievements: [],
            })
            .mockResolvedValueOnce({
                id: 'user-1',
                username: 'alice',
                achievements: [{ achievementId: 'growth_first_use' }],
            });
        prisma.studyRecord.findMany.mockResolvedValue([]);
        prisma.word.count.mockResolvedValue(0);
        achievementService.ensureFirstUseAchievement.mockResolvedValue(undefined);

        const result = await service.getUserStats('user-1');

        expect(achievementService.ensureFirstUseAchievement).toHaveBeenCalledWith('user-1');
        expect(result.user.achievements).toEqual([{ achievementId: 'growth_first_use' }]);
    });

    it('normalizes record categories when calculating category stats', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            username: 'alice',
            achievements: [],
        });
        prisma.studyRecord.findMany.mockResolvedValue([
            {
                id: 1,
                status: 'MASTERED',
                reviewStage: 1,
                word: { id: 'word-1', category: 'general' },
            },
            {
                id: 2,
                status: 'LEARNING',
                reviewStage: 0,
                word: { id: 'word-2', category: null },
            },
        ]);
        prisma.word.count
            .mockResolvedValueOnce(1200)
            .mockResolvedValueOnce(4)
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(2);

        const result = await service.getUserStats('user-1');

        expect(result.categoryStats.GENERAL).toEqual({
            learned: 2,
            mastered: 1,
            total: 1200,
        });
    });

    it('counts mastered words based on review stage threshold', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            username: 'alice',
            achievements: [],
        });
        prisma.studyRecord.findMany.mockResolvedValue([
            {
                id: 1,
                status: 'MASTERED',
                reviewStage: 1,
                word: { id: 'word-1', category: 'GENERAL' },
            },
            {
                id: 2,
                status: 'LEARNING',
                reviewStage: 3,
                word: { id: 'word-2', category: 'GENERAL' },
            },
        ]);
        prisma.word.count.mockResolvedValue(2);

        const result = await service.getUserStats('user-1');

        expect(result.mastered).toBe(2);
    });

    it('does not expose auth secrets in sync progress user payload', async () => {
        prisma.studyRecord.findUnique.mockResolvedValue({
            interval: 0,
            repetition: 0,
            easeFactor: 2.5,
            mistakeCount: 0,
        });
        prisma.studyRecord.upsert.mockResolvedValue({ id: 1 });
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            xp: 0,
            coins: 0,
            totalCorrect: 0,
            streak: 0,
            level: 1,
            lastActive: null,
            progress: [],
        });
        prisma.user.update.mockResolvedValue({
            id: 'user-1',
            username: 'alice',
            passwordHash: 'secret-hash',
            sessionToken: 'secret-token',
            sessionExpiresAt: new Date('2026-03-20T00:00:00.000Z'),
            xp: 10,
            coins: 1,
            level: 1,
            totalCorrect: 1,
            streak: 1,
            lastActive: new Date('2026-03-13T00:00:00.000Z'),
        });
        achievementService.checkAchievements = jest.fn().mockResolvedValue([]);

        const result = await service.syncProgress({
            userId: 'user-1',
            wordId: 'word-1',
            status: 'MASTERED',
            xpGained: 10,
            coinsGained: 1,
        } as any);

        expect(result.user).toEqual(expect.objectContaining({ id: 'user-1', username: 'alice' }));
        expect(result.user.passwordHash).toBeUndefined();
        expect(result.user.sessionToken).toBeUndefined();
        expect(result.user.sessionExpiresAt).toBeUndefined();
    });
});

describe('ProgressService review schedule', () => {
    it('advances fixed review steps on correct review answers', () => {
        const service = new ProgressService({} as any, {} as any);
        const now = new Date('2026-03-14T00:00:00.000Z');

        const first = (service as any).calculateNextReviewFixed({ reviewStage: 0 }, true, true, now);
        expect(first.reviewStage).toBe(1);
        expect(first.nextReview.getTime()).toBe(now.getTime() + 10 * 60 * 1000);

        const second = (service as any).calculateNextReviewFixed({ reviewStage: 1 }, true, true, now);
        expect(second.reviewStage).toBe(2);
        expect(second.nextReview.toISOString().slice(0, 10)).toBe('2026-03-15');
    });

    it('resets to first step on wrong review answers', () => {
        const service = new ProgressService({} as any, {} as any);
        const now = new Date('2026-03-14T00:00:00.000Z');

        const result = (service as any).calculateNextReviewFixed({ reviewStage: 4 }, false, true, now);
        expect(result.reviewStage).toBe(0);
        expect(result.nextReview.getTime()).toBe(now.getTime() + 10 * 60 * 1000);
    });

    it('counts mixed review pool candidates', async () => {
        const prisma = {
            studyRecord: {
                count: jest.fn().mockResolvedValue(12),
            },
        } as any;
        const service = new ProgressService(prisma, {} as any);

        const total = await service.getReviewPoolCount('user-1');
        expect(total).toBe(12);
        expect(prisma.studyRecord.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 'user-1',
                    OR: [
                        { mistakeCount: { gt: 0 } },
                        { nextReview: { lte: expect.any(Date) } },
                    ],
                }),
            })
        );
    });
});
