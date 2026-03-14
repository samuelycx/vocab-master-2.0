import { AchievementService } from './achievement.service';
import { ACHIEVEMENT_DEFINITION_MAP } from './achievement-definitions';

describe('AchievementService', () => {
    const prisma = {
        user: {
            findUnique: jest.fn(),
        },
        achievement: {
            upsert: jest.fn(),
            findMany: jest.fn(),
        },
        userAchievement: {
            createMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };

    let service: AchievementService;

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.userAchievement.findFirst.mockResolvedValue(null);
        service = new AchievementService(prisma as any);
    });

    it('ensures unlocked achievements exist before linking them to user', async () => {
        prisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            streak: 0,
            xp: 0,
            coins: 0,
            totalCorrect: 1,
            maxCombo: 0,
            achievements: [],
            progress: [],
        });
        prisma.achievement.findMany.mockResolvedValue([
            { id: 'growth_1', name: '初次出手', description: '首次答对 1 题', icon: '✨' },
        ]);

        const unlocked = await service.checkAchievements('user-1');

        expect(prisma.achievement.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'growth_1' },
        }));
        expect(prisma.userAchievement.createMany).toHaveBeenCalledWith({
            data: [{ userId: 'user-1', achievementId: 'growth_1' }],
        });
        expect(unlocked).toEqual([
            { id: 'growth_1', name: '初次出手', description: '首次答对 1 题', icon: '✨' },
        ]);
    });

    it('keeps growth achievements in the GROWTH category and includes first-use definition', () => {
        expect(ACHIEVEMENT_DEFINITION_MAP.get('growth_first_use')).toEqual(
            expect.objectContaining({
                id: 'growth_first_use',
                category: 'GROWTH',
            }),
        );
        expect(ACHIEVEMENT_DEFINITION_MAP.get('growth_1')).toEqual(
            expect.objectContaining({
                id: 'growth_1',
                category: 'GROWTH',
            }),
        );
        expect(ACHIEVEMENT_DEFINITION_MAP.get('growth_xp_100')).toEqual(
            expect.objectContaining({
                id: 'growth_xp_100',
                category: 'GROWTH',
            }),
        );
        expect(ACHIEVEMENT_DEFINITION_MAP.get('growth_xp_1000')).toEqual(
            expect.objectContaining({
                id: 'growth_xp_1000',
                category: 'GROWTH',
            }),
        );
    });

    it('returns only current achievement definitions and filters legacy records from the database', async () => {
        prisma.achievement.findMany.mockResolvedValue([
            { id: 'growth_first_use', category: 'GROWTH' },
            { id: 'biz_50', category: 'SPECIALTY' },
            { id: 'pk_1', category: 'SOCIAL' },
            { id: 'wealth_50', category: 'WEALTH' },
        ]);

        const result = await service.getAllAchievements();

        expect(result).toEqual([
            { id: 'growth_first_use', category: 'GROWTH' },
            { id: 'wealth_50', category: 'WEALTH' },
        ]);
        expect(result.some((item) => item.id === 'biz_50')).toBe(false);
        expect(result.some((item) => item.id === 'pk_1')).toBe(false);
    });
});
