import { PkService } from './pk.service';

describe('PkService', () => {
    const prisma = {
        match: { create: jest.fn() },
        user: { findFirst: jest.fn() },
    };
    const authService = {
        requireUserFromAuthorization: jest.fn(),
    };

    let service: PkService;
    let server: { to: jest.Mock };
    let emitMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        emitMock = jest.fn();
        server = { to: jest.fn(() => ({ emit: emitMock })) };
        service = new PkService(prisma as any, authService as any);
        service.setServer(server as any);
    });

    it('resolves player from auth token before joining queue', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({
            id: 'user-1',
            username: 'alice',
            avatar: 'avatar.png',
        });

        const client = {
            id: 'socket-1',
            emit: jest.fn(),
            handshake: { auth: { token: 'token-1' }, headers: {} },
        };

        await service.joinQueue(client as any, { token: 'token-1' } as any);

        expect(authService.requireUserFromAuthorization).toHaveBeenCalledWith('Bearer token-1');
        expect(client.emit).toHaveBeenCalledWith('queue_joined', { position: 1 });
    });

    it('rejects payload-only queue joins without a token', async () => {
        const client = {
            id: 'socket-1',
            emit: jest.fn(),
            handshake: { auth: {}, headers: {} },
        };

        await service.joinQueue(client as any, { id: 'spoof', username: 'fake' } as any);

        expect(client.emit).toHaveBeenCalledWith(
            'error',
            expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }),
        );
        expect(client.emit).not.toHaveBeenCalledWith('queue_joined', expect.anything());
    });

    it('rejects invalid queue join tokens instead of throwing', async () => {
        authService.requireUserFromAuthorization.mockRejectedValue(new Error('invalid token'));

        const client = {
            id: 'socket-invalid',
            emit: jest.fn(),
            handshake: { auth: { token: 'bad-token' }, headers: {} },
        };

        await expect(service.joinQueue(client as any, { token: 'bad-token' } as any)).resolves.toBeUndefined();

        expect(client.emit).toHaveBeenCalledWith(
            'error',
            expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }),
        );
    });

    it('resolves player from auth token when creating a private match', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({
            id: 'user-2',
            username: 'bob',
            avatar: 'avatar-2.png',
        });

        const client = {
            id: 'socket-2',
            emit: jest.fn(),
            handshake: { auth: { token: 'token-2' }, headers: {} },
        };

        await service.createPrivateMatch(client as any, { token: 'token-2' } as any);

        expect(authService.requireUserFromAuthorization).toHaveBeenCalledWith('Bearer token-2');
        expect(client.emit).toHaveBeenCalledWith(
            'private_created',
            expect.objectContaining({ inviteCode: expect.any(String) }),
        );
    });

    it('rejects payload-only private match creation without a token', async () => {
        const client = {
            id: 'socket-2',
            emit: jest.fn(),
            handshake: { auth: {}, headers: {} },
        };

        await expect(
            service.createPrivateMatch(client as any, { id: 'spoof', username: 'fake' } as any),
        ).resolves.toBeNull();

        expect(client.emit).toHaveBeenCalledWith(
            'error',
            expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }),
        );
        expect(client.emit).not.toHaveBeenCalledWith('private_created', expect.anything());
    });

    it('resolves player from auth token when joining a private match', async () => {
        authService.requireUserFromAuthorization
            .mockResolvedValueOnce({ id: 'host-1', username: 'host', avatar: 'host.png' })
            .mockResolvedValueOnce({ id: 'guest-1', username: 'guest', avatar: 'guest.png' });

        const hostClient = {
            id: 'socket-host',
            emit: jest.fn(),
            handshake: { auth: { token: 'host-token' }, headers: {} },
        };
        const guestClient = {
            id: 'socket-guest',
            emit: jest.fn(),
            handshake: { auth: { token: 'guest-token' }, headers: {} },
        };

        const inviteCode = await service.createPrivateMatch(hostClient as any, { token: 'host-token' } as any);
        await service.joinPrivateMatch(guestClient as any, { token: 'guest-token' } as any, inviteCode);

        expect(authService.requireUserFromAuthorization).toHaveBeenNthCalledWith(1, 'Bearer host-token');
        expect(authService.requireUserFromAuthorization).toHaveBeenNthCalledWith(2, 'Bearer guest-token');
        expect(server.to).toHaveBeenCalledWith('socket-host');
        expect(server.to).toHaveBeenCalledWith('socket-guest');
        expect(emitMock).toHaveBeenCalledWith(
            'match_found',
            expect.objectContaining({ gameId: `private_${inviteCode}` }),
        );
    });

    it('rejects payload-only private match joins without a token', async () => {
        authService.requireUserFromAuthorization.mockResolvedValue({
            id: 'host-1',
            username: 'host',
            avatar: 'host.png',
        });

        const hostClient = {
            id: 'socket-host',
            emit: jest.fn(),
            handshake: { auth: { token: 'host-token' }, headers: {} },
        };
        const guestClient = {
            id: 'socket-guest',
            emit: jest.fn(),
            handshake: { auth: {}, headers: {} },
        };

        const inviteCode = await service.createPrivateMatch(hostClient as any, { token: 'host-token' } as any);
        await service.joinPrivateMatch(guestClient as any, { id: 'spoof', username: 'fake' } as any, inviteCode!);

        expect(guestClient.emit).toHaveBeenCalledWith(
            'error',
            expect.objectContaining({ message: expect.stringMatching(/unauthorized/i) }),
        );
        expect(server.to).not.toHaveBeenCalledWith('socket-guest');
    });
});
