import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetUser = vi.fn();
const mockSetView = vi.fn();
const mockReset = vi.fn();

vi.mock('./api.js', () => ({
  API: {
    loginWithPassword: vi.fn(),
    registerWithPassword: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('./state.js', () => ({
  GameState: {
    user: { id: null, username: 'Guest' },
    auth: { token: null, status: 'anonymous' },
  },
  Actions: {
    setUser: mockSetUser,
    setView: mockSetView,
    reset: mockReset,
    setAuthToken: vi.fn(),
    setAuthStatus: vi.fn(),
    clearAuth: vi.fn(),
  },
}));

describe('auth session', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('restores a persisted session token into the current user', async () => {
    localStorage.setItem('vocab_token', 'saved-token');

    const { API } = await import('./api.js');
    API.getCurrentUser.mockResolvedValue({
      success: true,
      user: { id: 'user-1', username: 'alice' },
    });

    const { AuthSession } = await import('./auth-session.js');
    const restored = await AuthSession.restoreSession();

    expect(restored).toBe(true);
    expect(API.getCurrentUser).toHaveBeenCalledWith('saved-token');
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-1', username: 'alice' });
    expect(mockSetView).toHaveBeenCalledWith('dashboard');
  });

  it('logs in with username and password and persists token', async () => {
    const { API } = await import('./api.js');
    API.loginWithPassword.mockResolvedValue({
      success: true,
      token: 'login-token',
      user: { id: 'user-2', username: 'bob' },
    });

    const { AuthSession } = await import('./auth-session.js');
    const result = await AuthSession.login({ username: 'bob', password: 'secret123' });

    expect(result.success).toBe(true);
    expect(localStorage.getItem('vocab_token')).toBe('login-token');
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-2', username: 'bob' });
    expect(mockSetView).toHaveBeenCalledWith('dashboard');
  });

  it('registers with username and password and persists token', async () => {
    const { API } = await import('./api.js');
    API.registerWithPassword.mockResolvedValue({
      success: true,
      token: 'register-token',
      user: { id: 'user-3', username: 'carol' },
    });

    const { AuthSession } = await import('./auth-session.js');
    const result = await AuthSession.register({ username: 'carol', password: 'secret123' });

    expect(result.success).toBe(true);
    expect(localStorage.getItem('vocab_token')).toBe('register-token');
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-3', username: 'carol' });
    expect(mockSetView).toHaveBeenCalledWith('dashboard');
  });

  it('logs out and clears persisted auth state', async () => {
    localStorage.setItem('vocab_token', 'logout-token');

    const { API } = await import('./api.js');
    API.logout.mockResolvedValue({ success: true });

    const { AuthSession } = await import('./auth-session.js');
    await AuthSession.logout();

    expect(API.logout).toHaveBeenCalledWith('logout-token');
    expect(localStorage.getItem('vocab_token')).toBeNull();
    expect(mockReset).toHaveBeenCalled();
    expect(mockSetView).toHaveBeenCalledWith('auth');
  });
});
