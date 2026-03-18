import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createAvatarUploadOptions } from './avatar-upload';

describe('AuthController', () => {
    const authService = {
        requireUserFromAuthorization: jest.fn(),
        updateProfile: jest.fn(),
    };

    let controller: AuthController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new AuthController(authService as unknown as AuthService);
    });

    it('accepts nickname-only profile updates through the single profile endpoint', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1', avatar: '/uploads/avatars/original.png' });
        authService.updateProfile.mockResolvedValue({
            success: true,
            user: { id: 'user-1', nickname: 'Sam' },
        });

        await expect(controller.updateProfile('Bearer token', { nickname: 'Sam' } as any)).resolves.toEqual({
            success: true,
            user: { id: 'user-1', nickname: 'Sam' },
        });
        expect(authService.updateProfile).toHaveBeenCalledWith('user-1', { nickname: 'Sam' }, undefined);
    });

    it('passes an uploaded avatar into the single profile save call', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({ id: 'user-1', avatar: '/uploads/avatars/original.png' });
        authService.updateProfile.mockResolvedValue({
            success: true,
            user: { id: 'user-1', nickname: 'Sam', avatar: '/uploads/avatars/new.webp' },
        });

        await expect(
            (controller as any).updateProfile(
                'Bearer token',
                { nickname: 'Sam' },
                { filename: 'new.webp' },
            ),
        ).resolves.toEqual({
            success: true,
            user: { id: 'user-1', nickname: 'Sam', avatar: '/uploads/avatars/new.webp' },
        });
        expect(authService.updateProfile).toHaveBeenCalledWith(
            'user-1',
            { nickname: 'Sam' },
            {
                avatarUrl: '/uploads/avatars/new.webp',
                previousAvatarUrl: '/uploads/avatars/original.png',
            },
        );
    });
});

describe('avatar upload options', () => {
    it('rejects unsupported avatar mime types', () => {
        const options = createAvatarUploadOptions();
        const callback = jest.fn();

        options.fileFilter?.({} as any, { mimetype: 'image/gif', originalname: 'avatar.gif' } as any, callback);

        expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
    });

    it('rejects avatars whose extension does not match the mime type', () => {
        const options = createAvatarUploadOptions();
        const callback = jest.fn();

        options.fileFilter?.({} as any, { mimetype: 'image/png', originalname: 'avatar.jpg' } as any, callback);

        expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
    });

    it('enforces the avatar file size limit', () => {
        expect(createAvatarUploadOptions().limits?.fileSize).toBe(2 * 1024 * 1024);
    });
});

describe('AuthService profile persistence', () => {
    const prisma = {
        user: {
            update: jest.fn(),
        },
    };

    let service: AuthService;
    let sandboxRoot: string;

    const writeAvatarFile = (filename: string) => {
        const avatarDir = join(sandboxRoot, 'server', 'uploads', 'avatars');
        mkdirSync(avatarDir, { recursive: true });
        const filePath = join(avatarDir, filename);
        writeFileSync(filePath, filename);
        return {
            filePath,
            publicUrl: `/uploads/avatars/${filename}`,
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AuthService(prisma as any);
        sandboxRoot = mkdtempSync(join(tmpdir(), 'auth-profile-'));
    });

    afterEach(() => {
        rmSync(sandboxRoot, { force: true, recursive: true });
    });

    it('cleans up the newly written avatar when the db update fails', async () => {
        const uploadedAvatar = writeAvatarFile('fresh.png');
        prisma.user.update.mockRejectedValue(new Error('db write failed'));

        await expect(
            (service as any).updateProfile(
                'user-1',
                { nickname: 'Sam' },
                { avatarUrl: uploadedAvatar.publicUrl, uploadRootCwd: sandboxRoot },
            ),
        ).rejects.toThrow('db write failed');

        expect(existsSync(uploadedAvatar.filePath)).toBe(false);
    });

    it('removes the old local avatar after a successful replacement', async () => {
        const oldAvatar = writeAvatarFile('old.png');
        const uploadedAvatar = writeAvatarFile('fresh.webp');
        prisma.user.update.mockResolvedValue({
            id: 'user-1',
            username: 'sam',
            nickname: 'Sam',
            avatar: uploadedAvatar.publicUrl,
            passwordHash: null,
            sessionToken: null,
            sessionExpiresAt: null,
        });

        await expect(
            (service as any).updateProfile(
                'user-1',
                { nickname: 'Sam' },
                {
                    avatarUrl: uploadedAvatar.publicUrl,
                    previousAvatarUrl: oldAvatar.publicUrl,
                    uploadRootCwd: sandboxRoot,
                },
            ),
        ).resolves.toEqual({
            success: true,
            user: expect.objectContaining({
                id: 'user-1',
                avatar: uploadedAvatar.publicUrl,
            }),
        });

        expect(existsSync(oldAvatar.filePath)).toBe(false);
        expect(existsSync(uploadedAvatar.filePath)).toBe(true);
    });
});
