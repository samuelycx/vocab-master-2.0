import 'reflect-metadata';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { WordController } from './word/word.controller';
import { ProgressController } from './progress/progress.controller';
import { AppController } from './app.controller';

describe('Web API contract', () => {
  const authService = {
    register: jest.fn(async (body) => ({ success: true, token: 'token-register', user: { id: 'user-1', username: body.username } })),
    login: jest.fn(async (body) => ({ success: true, token: 'token-login', user: { id: 'user-1', username: body.username } })),
    getCurrentUser: jest.fn(async () => ({ success: true, user: { id: 'user-1', username: 'alice' } })),
    updateProfile: jest.fn(async (_userId, body, avatar) => ({
      success: true,
      user: {
        id: 'user-1',
        nickname: body.nickname,
        avatar: avatar?.avatarUrl ?? '/uploads/avatars/original.png',
      },
    })),
    requireUserFromAuthorization: jest.fn(async () => ({
      id: 'user-1',
      username: 'alice',
      avatar: '/uploads/avatars/original.png',
    })),
  };
  const wordService = {
    getWordsForSession: jest.fn(async (count) => ([{ id: 'w1', text: 'hello', count }])),
  };
  const progressService = {
    getUserStats: jest.fn(async () => ({ total: 12, mastered: 7, user: { id: 'user-1' } })),
    getReviewPoolCount: jest.fn(async () => 1),
    getLeaderboard: jest.fn(async () => ([{ id: 'user-1', username: 'alice', xp: 100 }])),
  };
  const appService = { getHello: jest.fn(() => 'Hello World!') };
  const adminService = { getSystemConfigs: jest.fn(async () => ({})) };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps register/login/me routes for web auth flow', async () => {
    const controller = new AuthController(authService as any);

    expect(Reflect.getMetadata(PATH_METADATA, AuthController)).toBe('auth');
    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.login)).toBe('login');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.login)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.register)).toBe('register');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.register)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.me)).toBe('me');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.me)).toBe(RequestMethod.GET);

    await expect(controller.register({ username: 'alice', password: 'secret123' } as any)).resolves.toEqual(
      expect.objectContaining({ success: true, token: 'token-register' }),
    );
    await expect(controller.login({ username: 'alice', password: 'secret123' } as any)).resolves.toEqual(
      expect.objectContaining({ success: true, token: 'token-login' }),
    );
    await expect(controller.me('Bearer token-login')).resolves.toEqual({
      success: true,
      user: { id: 'user-1', username: 'alice' },
    });
  });

  it('exposes a single local profile editing route for atomic nickname/avatar updates', async () => {
    const controller = new AuthController(authService as any);

    expect(Reflect.getMetadata(PATH_METADATA, AuthController.prototype.updateProfile)).toBe('profile');
    expect(Reflect.getMetadata(METHOD_METADATA, AuthController.prototype.updateProfile)).toBe(RequestMethod.PATCH);
    expect(AuthController.prototype).not.toHaveProperty('uploadAvatar');

    await expect(controller.updateProfile('Bearer token', { nickname: 'Sam' } as any)).resolves.toEqual({
      success: true,
      user: { id: 'user-1', nickname: 'Sam', avatar: '/uploads/avatars/original.png' },
    });

    await expect((controller as any).updateProfile('Bearer token', { nickname: 'Sam' }, { filename: 'avatar.webp' })).resolves.toEqual({
      success: true,
      user: { id: 'user-1', nickname: 'Sam', avatar: '/uploads/avatars/avatar.webp' },
    });
  });

  it('supports /words/session via controller metadata and stable data envelope', async () => {
    const controller = new WordController(wordService as any, progressService as any, authService as any);
    const controllerPath = Reflect.getMetadata(PATH_METADATA, WordController);

    expect(controllerPath).toEqual(expect.arrayContaining(['word', 'words']));
    expect(Reflect.getMetadata(PATH_METADATA, WordController.prototype.getSessionWords)).toBe('session');
    expect(Reflect.getMetadata(METHOD_METADATA, WordController.prototype.getSessionWords)).toBe(RequestMethod.GET);

    await expect(controller.getSessionWords(30, 'GENERAL')).resolves.toEqual({
      success: true,
      data: {
        words: [{ id: 'w1', text: 'hello', count: 30 }],
        total: 1,
      },
    });
  });

  it('supports /progress/stats and /progress/reviews with authenticated envelopes', async () => {
    const controller = new ProgressController(progressService as any, authService as any);

    expect(Reflect.getMetadata(PATH_METADATA, ProgressController)).toBe('progress');
    expect(Reflect.getMetadata(PATH_METADATA, ProgressController.prototype.getStats)).toBe('stats');
    expect(Reflect.getMetadata(PATH_METADATA, ProgressController.prototype.getReviews)).toBe('reviews');

    await expect(controller.getStats('Bearer token-login')).resolves.toEqual({
      success: true,
      data: { total: 12, mastered: 7, user: { id: 'user-1' } },
    });

    await expect(controller.getReviews('Bearer token-login')).resolves.toEqual({
      success: true,
      data: { total: 1 },
    });
  });

  it('supports top-level /leaderboard route with stable data envelope', async () => {
    const controller = new AppController(appService as any, adminService as any, progressService as any);

    expect(Reflect.getMetadata(PATH_METADATA, AppController.prototype.getLeaderboard)).toBe('leaderboard');
    expect(Reflect.getMetadata(METHOD_METADATA, AppController.prototype.getLeaderboard)).toBe(RequestMethod.GET);

    await expect(controller.getLeaderboard('20')).resolves.toEqual({
      success: true,
      data: {
        entries: [{ id: 'user-1', username: 'alice', xp: 100 }],
        total: 1,
      },
    });
  });
});
