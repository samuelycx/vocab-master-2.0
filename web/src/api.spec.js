import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('API web contract adapters', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    localStorage.clear();
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
});
