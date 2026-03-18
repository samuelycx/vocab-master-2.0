import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    const authService = {
        requireUserFromAuthorization: jest.fn(),
        updateAvatar: jest.fn(),
    };

    let controller: AuthController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new AuthController(authService as unknown as AuthService);
    });

    it('rejects avatar uploads when no file is present', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1' });

        await expect(controller.uploadAvatar('Bearer token', undefined as any)).rejects.toThrow(
            new BadRequestException('Avatar file is required'),
        );
        expect(authService.updateAvatar).not.toHaveBeenCalled();
    });
});
