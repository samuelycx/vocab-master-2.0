import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockClearAuth = vi.fn();
const mockSetView = vi.fn();

vi.mock('./state.js', () => ({
  Actions: {
    clearAuth: mockClearAuth,
    setView: mockSetView,
  },
}));

describe('API web contract adapters', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    localStorage.clear();
    mockClearAuth.mockClear();
    mockSetView.mockClear();
  });

  it('syncs progress without sending legacy userId and unwraps mistakes payloads', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, saved: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'w1', text: 'alpha' },
          { id: 'w2', text: 'beta' },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-1', targetCategory: 'GRE' }),
      });

    vi.stubGlobal('fetch', fetchMock);
    localStorage.setItem('vocab_token', 'token-123');

    const { API } = await import('./api.js');

    const syncResult = await API.syncProgress('word-1', 'MASTERED', 10, 1);
    const mistakes = await API.getMistakes();
    await API.updateCategory('GRE');

    expect(syncResult).toEqual({ success: true, saved: true });
    expect(mistakes).toEqual([
      { id: 'w1', text: 'alpha' },
      { id: 'w2', text: 'beta' },
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/progress/sync',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
        body: JSON.stringify({
          wordId: 'word-1',
          status: 'MASTERED',
          xpGained: 10,
          coinsGained: 1,
          mode: 'learn',
        }),
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/word/mistakes',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/progress/set-category',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ category: 'GRE' }),
      }),
    );
  });

  it('uses dedicated admin endpoint when changing another users category', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { API } = await import('./api.js');
    await API.setUserCategory('user-9', 'BUSINESS');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/set-category',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ userId: 'user-9', category: 'BUSINESS' }),
      }),
    );
  });

  it('attaches auth headers for admin GET and POST requests', async () => {
    localStorage.setItem('vocab_token', 'token-123');

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'user-1', username: 'alice' },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'word-1', text: 'alpha' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'word-1', text: 'alpha' },
        ]),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { API } = await import('./api.js');
    await API.getUsers();
    await API.createWord({ text: 'alpha' });
    await API.exportWords();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/admin/users',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/admin/word',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ text: 'alpha' }),
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/admin/words/export',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
      }),
    );
  });

  it('clears auth and redirects on 401 when a token is present', async () => {
    localStorage.setItem('vocab_token', 'token-401');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Session expired' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { API } = await import('./api.js');
    const result = await API.getStats();

    expect(result).toBeNull();
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
    expect(mockSetView).toHaveBeenCalledWith('auth');
    expect(localStorage.getItem('vocab_token')).toBeNull();
  });
});
