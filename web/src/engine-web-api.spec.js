import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = {
  resetCombo: vi.fn(),
  setView: vi.fn(),
  initPK: vi.fn(),
  updatePKScore: vi.fn(),
  addXP: vi.fn(),
  incrementCombo: vi.fn(),
  addCoins: vi.fn(),
  setUser: vi.fn(),
  showOverlay: vi.fn(),
};

vi.mock('./socket.js', () => ({
  SocketManager: {
    joinQueue: vi.fn(),
    updateScore: vi.fn(),
  },
}));

vi.mock('./state.js', () => ({
  GameState: {
    user: { id: 'user-1', targetCategory: 'GENERAL' },
    game: { todayLearned: 0, pk: { userScore: 0 } },
  },
  Actions: actions,
}));

vi.mock('./api.js', () => ({
  API: {
    getSessionWords: vi.fn(),
    getReviews: vi.fn(),
    getMistakes: vi.fn(),
    syncProgress: vi.fn(),
  },
}));

describe('GameEngine web api migration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('starts a learn session from the new words api payload', async () => {
    const { API } = await import('./api.js');
    API.getSessionWords.mockResolvedValue([
      { id: 'w1', text: 'alpha', meanings: ['含义1'], examples: ['example 1'] },
      { id: 'w2', text: 'beta', meanings: ['含义2'], examples: ['example 2'] },
    ]);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.startSession(30);

    expect(API.getSessionWords).toHaveBeenCalledWith(30, 'GENERAL');
    expect(actions.setView).toHaveBeenCalledWith('arena');
    expect(GameEngine.session.currentWord.text).toBe('alpha');
    expect(GameEngine.session.options).toContain('含义1');
  });

  it('starts a review session from authenticated reviews api without user id', async () => {
    const { API } = await import('./api.js');
    API.getReviews.mockResolvedValue([
      { id: 'w3', text: 'gamma', meanings: ['含义3'], examples: ['example 3'] },
    ]);

    const { GameEngine } = await import('./engine.js');
    const started = await GameEngine.startReview();

    expect(API.getReviews).toHaveBeenCalledWith();
    expect(actions.setView).toHaveBeenCalledWith('arena');
    expect(GameEngine.session.mode).toBe('review');
    expect(GameEngine.session.currentWord.text).toBe('gamma');
    expect(started).toBe(true);
  });

  it('returns false when no review words are available', async () => {
    const { API } = await import('./api.js');
    API.getReviews.mockResolvedValue([]);

    const { GameEngine } = await import('./engine.js');
    const started = await GameEngine.startReview();

    expect(started).toBe(false);
  });
});
