import { PkGateway } from './pk.gateway';

describe('PkGateway', () => {
    const pkService = {
        setServer: jest.fn(),
        handleDisconnect: jest.fn(),
        joinQueue: jest.fn(),
        handleScore: jest.fn(),
        createPrivateMatch: jest.fn(),
        joinPrivateMatch: jest.fn(),
    };

    let gateway: PkGateway;

    beforeEach(() => {
        jest.clearAllMocks();
        gateway = new PkGateway(pkService as any);
    });

    it('forwards token-based queue join payloads', () => {
        const client = { id: 'socket-1' };
        gateway.handleJoinQueue(client as any, { token: 'token-1' } as any);
        expect(pkService.joinQueue).toHaveBeenCalledWith(client, { token: 'token-1' });
    });

    it('forwards token-based private match creation payloads', () => {
        const client = { id: 'socket-1' };
        gateway.handleCreatePrivate(client as any, { token: 'token-1' } as any);
        expect(pkService.createPrivateMatch).toHaveBeenCalledWith(client, { token: 'token-1' });
    });

    it('forwards token-based private match join payloads with invite code', () => {
        const client = { id: 'socket-1' };
        gateway.handleJoinPrivate(client as any, { token: 'token-1', inviteCode: 'ABC123' } as any);
        expect(pkService.joinPrivateMatch).toHaveBeenCalledWith(client, { token: 'token-1', inviteCode: 'ABC123' }, 'ABC123');
    });
});
