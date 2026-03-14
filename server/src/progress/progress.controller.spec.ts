import { ProgressController } from './progress.controller';

describe('ProgressController', () => {
    const authService = {
        requireUserFromAuthorization: jest.fn(),
    };
    const progressService = {
        syncProgress: jest.fn(),
        getUserStats: jest.fn(),
        resetProgress: jest.fn(),
        getAllAchievements: jest.fn(),
        getLeaderboard: jest.fn(),
        updateTargetCategory: jest.fn(),
        getReviewPoolCount: jest.fn(),
    };

    let controller: ProgressController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new ProgressController(progressService as any, authService as any);
    });

    it('uses authorized user id when syncing progress', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1' });
        progressService.syncProgress.mockResolvedValue({ ok: true });

        await controller.sync('Bearer token', {
            userId: 'client-user',
            wordId: 'word-1',
            status: 'MASTERED',
        } as any);

        expect(authService.requireUserFromAuthorization).toHaveBeenCalledWith('Bearer token');
        expect(progressService.syncProgress).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-1', wordId: 'word-1' }),
        );
    });

    it('uses authorized user id for stats and reset', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-2' });

        await controller.getStats('Bearer token');
        await controller.resetProgress('Bearer token');

        expect(progressService.getUserStats).toHaveBeenCalledWith('user-2');
        expect(progressService.resetProgress).toHaveBeenCalledWith('user-2');
    });

    it('returns total pending review count', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-3' });
        progressService.getReviewPoolCount.mockResolvedValue(12);

        const res = await controller.getReviews('Bearer token');

        expect(progressService.getReviewPoolCount).toHaveBeenCalledWith('user-3');
        expect(res).toEqual({ success: true, data: { total: 12 } });
    });
});
