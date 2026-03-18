import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

const mockRestoreSession = vi.fn();
const mockGetSystemConfigs = vi.fn();
const mockGetStats = vi.fn();
const mockSetModules = vi.fn();
const mockSetUser = vi.fn();
const mockSetView = vi.fn();

vi.mock('./auth-session.js', () => ({
  AuthSession: {
    restoreSession: mockRestoreSession,
  },
}));

vi.mock('./api.js', () => ({
  API: {
    getSystemConfigs: mockGetSystemConfigs,
    getStats: mockGetStats,
  },
}));

vi.mock('./state.js', () => ({
  GameState: {
    user: { id: null },
    game: { view: 'auth' },
    overlay: { current: null, queue: [] },
  },
  Actions: {
    setModules: mockSetModules,
    setUser: mockSetUser,
    setView: mockSetView,
  },
}));

vi.mock('./components/AuthView.vue', () => ({ default: { template: '<div data-test="auth-view">auth</div>' } }));
vi.mock('./components/Welcome.vue', () => ({ default: { template: '<div>welcome</div>' } }));
vi.mock('./components/Dashboard.vue', () => ({ default: { template: '<div>dashboard</div>' } }));
vi.mock('./components/GameArena.vue', () => ({ default: { template: '<div>arena</div>' } }));
vi.mock('./components/PKArena.vue', () => ({ default: { template: '<div>pk</div>' } }));
vi.mock('./components/Result.vue', () => ({ default: { template: '<div>result</div>' } }));
vi.mock('./components/Settings.vue', () => ({ default: { template: '<div>settings</div>' } }));
vi.mock('./components/ProfileSetup.vue', () => ({ default: { template: '<div data-test="profile-setup-view">profile setup</div>' } }));
vi.mock('./components/VocabularyList.vue', () => ({ default: { template: '<div>vocabulary</div>' } }));
vi.mock('./components/AchievementWall.vue', () => ({ default: { template: '<div>achievement</div>' } }));
vi.mock('./components/LevelUpModal.vue', () => ({ default: { template: '<div>levelup</div>' } }));
vi.mock('./components/AchievementUnlockModal.vue', () => ({ default: { template: '<div>achievement-unlock</div>' } }));
vi.mock('./components/AdminDashboard.vue', () => ({ default: { template: '<div>admin</div>' } }));
vi.mock('./components/SocialView.vue', () => ({ default: { template: '<div>social</div>' } }));
vi.mock('./components/BookSelection.vue', () => ({ default: { template: '<div>book</div>' } }));

describe('App shell', () => {
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    await nextTick();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSystemConfigs.mockResolvedValue({ pk_arena_enabled: true });
    mockGetStats.mockResolvedValue(null);
  });

  it('falls back to auth view when session restore fails', async () => {
    mockRestoreSession.mockResolvedValue(false);

    const { default: App } = await import('./App.vue');
    mount(App);
    await flush();

    expect(mockRestoreSession).toHaveBeenCalledWith();
    expect(mockSetView).toHaveBeenCalledWith('auth');
    expect(mockSetModules).toHaveBeenCalledWith({ pk_arena_enabled: true });
    expect(mockGetStats).not.toHaveBeenCalled();
  });

  it('refreshes stats when a valid user session exists', async () => {
    mockRestoreSession.mockResolvedValue(true);
    const { GameState } = await import('./state.js');
    GameState.user.id = 'user-1';
    mockGetStats.mockResolvedValue({ user: { id: 'user-1', username: 'alice' } });

    const { default: App } = await import('./App.vue');
    mount(App);
    await flush();

    expect(mockGetStats).toHaveBeenCalledWith();
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-1', username: 'alice' });
  });

  it('renders profile setup view when requested', async () => {
    mockRestoreSession.mockResolvedValue(true);
    const { GameState } = await import('./state.js');
    GameState.game.view = 'profile-setup';

    const { default: App } = await import('./App.vue');
    const wrapper = mount(App);
    await flush();

    expect(wrapper.find('[data-test="profile-setup-view"]').exists()).toBe(true);
  });
});
