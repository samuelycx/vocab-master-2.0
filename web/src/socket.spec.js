import { beforeEach, describe, expect, it, vi } from 'vitest';

const onHandlers = {};
const emit = vi.fn();
const disconnect = vi.fn();
const socket = {
  id: 'socket-1',
  connected: false,
  on: vi.fn((event, handler) => { onHandlers[event] = handler; }),
  emit,
  disconnect,
};
const ioMock = vi.fn(() => socket);

vi.mock('socket.io-client', () => ({ io: ioMock }));
vi.mock('./engine.js', () => ({
  GameEngine: {
    startOnlinePK: vi.fn(),
    checkPKWinner: vi.fn(),
    playAudio: vi.fn(),
  },
}));
vi.mock('./state.js', () => ({
  GameState: {
    game: { pk: { isActive: false, opponent: { score: 0 } } },
  },
  Actions: {
    endPK: vi.fn(),
  },
}));

describe('SocketManager', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    Object.keys(onHandlers).forEach((key) => delete onHandlers[key]);
    socket.connected = false;
    localStorage.clear();
  });

  it('connects with auth token in socket auth payload', async () => {
    localStorage.setItem('vocab_token', 'socket-token');
    const { SocketManager } = await import('./socket.js');

    SocketManager.connect();

    expect(ioMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/pk$/),
      expect.objectContaining({ auth: { token: 'socket-token' } }),
    );
  });

  it('joins queue and private rooms with token payloads', async () => {
    localStorage.setItem('vocab_token', 'socket-token');
    const { SocketManager } = await import('./socket.js');

    SocketManager.joinQueue();
    SocketManager.createPrivateMatch();
    SocketManager.joinPrivateMatch('ABC123');

    expect(emit).toHaveBeenCalledWith('join_queue', { token: 'socket-token' });
    expect(emit).toHaveBeenCalledWith('create_private', { token: 'socket-token' });
    expect(emit).toHaveBeenCalledWith('join_private', { token: 'socket-token', inviteCode: 'ABC123' });
  });

  it('exposes disconnect helper for leaving pk sessions', async () => {
    const { SocketManager } = await import('./socket.js');

    SocketManager.connect();
    SocketManager.disconnect();

    expect(disconnect).toHaveBeenCalled();
  });
});
