import 'reflect-metadata';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('AdminController', () => {
    const adminService = {
        createWord: jest.fn(),
        deleteWord: jest.fn(),
        getUsers: jest.fn(),
        setUserCategory: jest.fn(),
        getSystemConfigs: jest.fn(),
        toggleModule: jest.fn(),
    };
    const prisma = {
        word: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    } as unknown as PrismaService;

    let controller: AdminController;
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService({} as any);
        controller = new AdminController(
            adminService as unknown as AdminService,
            prisma,
            authService as any,
        );
    });

    it('rejects non-admin callers for admin endpoints', async () => {
        jest
            .spyOn(authService, 'requireUserFromAuthorization')
            .mockResolvedValue({ id: 'user-1', role: 'USER' } as any);

        await expect(controller.getUsers('Bearer token')).rejects.toThrow('Admin access required');
    });

    it('rejects non-admin callers for other admin read and write endpoints', async () => {
        jest
            .spyOn(authService, 'requireUserFromAuthorization')
            .mockResolvedValue({ id: 'user-1', role: 'USER' } as any);

        await expect((controller as any).exportWords('Bearer token')).rejects.toThrow('Admin access required');
        await expect((controller as any).deleteWord('word-1', 'Bearer token')).rejects.toThrow('Admin access required');

        expect(prisma.word.findMany).not.toHaveBeenCalled();
        expect(adminService.deleteWord).not.toHaveBeenCalled();
    });

    it('returns sanitized user rows for admin user listing', async () => {
        jest
            .spyOn(authService, 'requireUserFromAuthorization')
            .mockResolvedValue({ id: 'admin-1', role: 'ADMIN' } as any);
        adminService.getUsers.mockResolvedValue([
            { id: 'user-1', username: 'alice', passwordHash: 'x', sessionToken: 'y', role: 'USER' },
        ]);

        const users = await controller.getUsers('Bearer admin');

        expect(users).toEqual([
            expect.objectContaining({ id: 'user-1', username: 'alice', role: 'USER' }),
        ]);
        expect(users[0]).not.toHaveProperty('passwordHash');
        expect(users[0]).not.toHaveProperty('sessionToken');
    });

    it('declares concrete constructor dependencies for Nest DI', () => {
        expect(Reflect.getMetadata('design:paramtypes', AdminController)).toEqual([
            AdminService,
            PrismaService,
            AuthService,
        ]);
    });
});
