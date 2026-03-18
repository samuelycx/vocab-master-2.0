import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = {
  resetCombo: vi.fn(),
  setView: vi.fn(),
  initPK: vi.fn(),
  updatePKScore: vi.fn(),
  endPK: vi.fn(),
  addXP: vi.fn(),
  incrementCombo: vi.fn(),
  addCoins: vi.fn(),
  setUser: vi.fn(),
  showOverlay: vi.fn(),
  setLastSession: vi.fn(),
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
    game: {
      todayLearned: 0,
      combo: 0,
      pk: { userScore: 0, opponent: { score: 0 }, isActive: true },
    },
    settings: { soundEnabled: true },
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

function mockSpeech({ speak = vi.fn(), cancel = vi.fn() } = {}) {
  Object.defineProperty(window, 'speechSynthesis', {
    value: { speak, cancel },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    value: class {
      constructor(text) {
        this.text = text;
      }
    },
    configurable: true,
  });
  return { speak, cancel };
}

function mockAudio(factory) {
  Object.defineProperty(globalThis, 'Audio', {
    value: factory,
    configurable: true,
  });
}

describe('GameEngine web api migration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
    delete globalThis.Audio;
    delete globalThis.SpeechSynthesisUtterance;
    delete window.speechSynthesis;
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

  it('autoplays each new word in learn mode', async () => {
    const { API } = await import('./api.js');
    API.getSessionWords.mockResolvedValue([
      { id: 'w1', text: 'alpha', meanings: ['含义1'], examples: ['example 1'] },
      { id: 'w2', text: 'beta', meanings: ['含义2'], examples: ['example 2'] },
    ]);

    const { GameEngine } = await import('./engine.js');
    const playSpy = vi.spyOn(GameEngine, 'playAudio').mockResolvedValue();

    await GameEngine.startSession(30);
    expect(playSpy.mock.calls[0][0]).toBe('alpha');

    GameEngine.session.currentIndex = 1;
    GameEngine.loadNextQuestion();
    expect(playSpy.mock.calls[1][0]).toBe('beta');
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

  it('prefers server-hosted mp3 for word playback', async () => {
    const audioInstances = [];
    const { speak } = mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 0;
        this.preload = '';
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.playAudio('extend');

    expect(audioInstances[0].src).toBe('/uploads/word-audio/extend.mp3');
    expect(audioInstances[0].play).toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });

  it('url-encodes phrase audio filenames', async () => {
    const audioInstances = [];
    mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 0;
        this.preload = '';
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.playAudio('in order to');

    expect(audioInstances[0].src).toBe('/uploads/word-audio/in%20order%20to.mp3');
  });

  it('falls back to browser tts when audio playback fails', async () => {
    const { speak } = mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 0;
        this.preload = '';
        this.pause = vi.fn();
        this.play = vi.fn().mockRejectedValue(new Error('missing file'));
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.playAudio('extend');

    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe('extend');
  });

  it('does not fall back to browser tts when autoplay is permission-blocked', async () => {
    const { speak } = mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 0;
        this.preload = '';
        this.pause = vi.fn();
        this.play = vi.fn().mockRejectedValue(Object.assign(new Error('play() failed because the user did not interact'), {
          name: 'NotAllowedError',
        }));
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.playAudio('extend');

    expect(speak).not.toHaveBeenCalled();
  });

  it('primes audio playback with a silent clip before session requests', async () => {
    const audioInstances = [];
    mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 0;
        this.preload = '';
        this.muted = false;
        this.volume = 1;
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { API } = await import('./api.js');
    API.getSessionWords.mockResolvedValue([
      { id: 'w1', text: 'alpha', meanings: ['含义1'], examples: ['example 1'] },
    ]);

    const { GameEngine } = await import('./engine.js');
    vi.spyOn(GameEngine, 'playAudio').mockResolvedValue();

    await GameEngine.startSession(30);

    expect(audioInstances[0].src.startsWith('data:audio/')).toBe(true);
    expect(audioInstances[0].muted).toBe(true);
    expect(audioInstances[0].play).toHaveBeenCalled();
  });

  it('stops active html audio and tts together', async () => {
    const audioInstances = [];
    const { cancel } = mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.currentTime = 8;
        this.preload = '';
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    await GameEngine.playAudio('extend');
    cancel.mockClear();

    GameEngine.stopAudio();

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('preloads current and next word audio when loading a question', async () => {
    const audioInstances = [];
    mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.preload = '';
        this.currentTime = 0;
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    GameEngine.startTimer = vi.fn();
    vi.spyOn(GameEngine, 'playAudio').mockResolvedValue();

    GameEngine.session.currentIndex = 0;
    GameEngine.session.mode = 'learn';
    GameEngine.session.queue = ['alpha', 'beta'];
    GameEngine.wordMap = {
      alpha: { text: 'alpha', meanings: ['含义1'], examples: [] },
      beta: { text: 'beta', meanings: ['含义2'], examples: [] },
    };
    GameEngine.distractorPool = ['含义1', '含义2', '含义3', '含义4'];

    GameEngine.loadNextQuestion();

    expect(audioInstances.map((item) => item.src)).toEqual([
      '/uploads/word-audio/alpha.mp3',
      '/uploads/word-audio/beta.mp3',
    ]);
    expect(audioInstances.every((item) => item.preload === 'auto')).toBe(true);
  });

  it('reuses cached preloaded audio instead of recreating it', async () => {
    const audioInstances = [];
    mockSpeech();

    class FakeAudio {
      constructor(src = '') {
        this.src = src;
        this.preload = '';
        this.currentTime = 0;
        this.pause = vi.fn();
        this.play = vi.fn().mockResolvedValue();
        audioInstances.push(this);
      }
    }

    mockAudio(FakeAudio);

    const { GameEngine } = await import('./engine.js');
    GameEngine.startTimer = vi.fn();
    vi.spyOn(GameEngine, 'playAudio').mockResolvedValue();

    GameEngine.session.mode = 'learn';
    GameEngine.session.queue = ['alpha', 'beta', 'alpha'];
    GameEngine.wordMap = {
      alpha: { text: 'alpha', meanings: ['含义1'], examples: [] },
      beta: { text: 'beta', meanings: ['含义2'], examples: [] },
    };
    GameEngine.distractorPool = ['含义1', '含义2', '含义3', '含义4'];

    GameEngine.session.currentIndex = 0;
    GameEngine.loadNextQuestion();
    GameEngine.session.currentIndex = 2;
    GameEngine.loadNextQuestion();

    expect(audioInstances.map((item) => item.src)).toEqual([
      '/uploads/word-audio/alpha.mp3',
      '/uploads/word-audio/beta.mp3',
    ]);
  });

  it('uses the configured bot difficulty when simulating PK answers', async () => {
    const { GameEngine } = await import('./engine.js');
    const randomSpy = vi.spyOn(Math, 'random');
    GameEngine.botSettings = { accuracy: 0.6, minPoints: 6, maxPoints: 10 };

    randomSpy.mockReturnValueOnce(0.2).mockReturnValueOnce(0);

    GameEngine._botLoop();

    expect(actions.updatePKScore).toHaveBeenCalledWith(false, 6);
    randomSpy.mockRestore();
  });
});
