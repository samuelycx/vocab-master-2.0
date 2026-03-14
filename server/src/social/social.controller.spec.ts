import { SocialController } from './social.controller';

describe('SocialController', () => {
    const authService = {
        requireUserFromAuthorization: jest.fn(),
    };
    const socialService = {
        followUser: jest.fn(),
        unfollowUser: jest.fn(),
        getSocialFeed: jest.fn(),
        getFriends: jest.fn(),
        searchUsers: jest.fn(),
        getLeaderboard: jest.fn(),
    };

    let controller: SocialController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new SocialController(socialService as any, authService as any);
    });

    it('uses authorized user id for follow and unfollow', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1' });

        await controller.follow('Bearer token', { followingId: 'user-2' } as any);
        await controller.unfollow('Bearer token', { followingId: 'user-2' } as any);

        expect(socialService.followUser).toHaveBeenCalledWith('user-1', 'user-2');
        expect(socialService.unfollowUser).toHaveBeenCalledWith('user-1', 'user-2');
    });

    it('uses authorized user id for feed and friends', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-3' });

        await controller.getFeed('Bearer token');
        await controller.getFriends('Bearer token');

        expect(socialService.getSocialFeed).toHaveBeenCalledWith('user-3');
        expect(socialService.getFriends).toHaveBeenCalledWith('user-3');
    });
});
