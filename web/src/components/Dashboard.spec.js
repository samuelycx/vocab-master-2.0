import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
};

const mockGetStats = vi.fn();
const mockGetReviews = vi.fn();
const mockGetReviewCount = vi.fn();
const mockGetAchievements = vi.fn();
const mockStartSession = vi.fn();
const mockStartReview = vi.fn();
const mockStartMistake = vi.fn();
const mockSetUser = vi.fn();
const mockSetView = vi.fn();

vi.mock('../api.js', () => ({
  API: {
    getStats: mockGetStats,
    getReviews: mockGetReviews,
    getReviewCount: mockGetReviewCount,
    getAchievements: mockGetAchievements,
  },
}));

vi.mock('../engine.js', () => ({
  GameEngine: {
    startSession: mockStartSession,
    startReview: mockStartReview,
    startMistake: mockStartMistake,
  },
}));

vi.mock('../state.js', () => ({
  GameState: {
    user: {
      id: 'user-1',
      username: 'alice',
      streak: 2,
      coins: 10,
      targetCategory: 'GENERAL',
      achievements: [{ achievementId: 'growth_first_use' }, { achievementId: 'pk_1' }],
    },
    game: { todayLearned: 0 },
    system: { achievements: [] },
    settings: {},
  },
  Actions: {
    setUser: mockSetUser,
    setView: mockSetView,
  },
}));

vi.mock('./AchievementWall.vue', () => ({ default: { template: '<div />' } }));
vi.mock('./VocabularyList.vue', () => ({ default: { template: '<div />' } }));
vi.mock('./Settings.vue', () => ({ default: { template: '<div />' } }));

describe('Dashboard web auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStats.mockResolvedValue({ user: { id: 'user-1', username: 'alice', streak: 3 } });
    mockGetReviews.mockResolvedValue([{ id: 'w1' }, { id: 'w2' }]);
    mockGetReviewCount.mockResolvedValue(2);
    mockGetAchievements.mockResolvedValue([]);
  });

  it('loads stats and reviews through authenticated api helpers without userId params', async () => {
    const { default: Dashboard } = await import('./Dashboard.vue');
    mount(Dashboard);
    await flushPromises();

    expect(mockGetStats).toHaveBeenCalledWith();
    expect(mockGetReviewCount).toHaveBeenCalledWith();
    expect(mockSetUser).toHaveBeenCalledWith({ id: 'user-1', username: 'alice', streak: 3 });
  });

  it('starts review when there are pending review words', async () => {
    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await wrapper.get('[data-test="start-review"]').trigger('click');

    expect(mockStartReview).toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('shows alert when there are no pending review words', async () => {
    mockGetReviewCount.mockResolvedValue(0);
    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await wrapper.get('[data-test="start-review"]').trigger('click');

    expect(mockStartReview).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('starts the default 30-word learn session from the hero action', async () => {
    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    await wrapper.get('[data-test="start-learn"]').trigger('click');

    expect(mockStartSession).toHaveBeenCalledWith(30);
  });

  it('renders the core mobile dashboard sections', async () => {
    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    expect(wrapper.get('[data-test="dashboard-hero"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="dashboard-stats"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="dashboard-actions"]').exists()).toBe(true);
  });

  it('renders achievement rail chips with shared svg icons', async () => {
    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    const icon = wrapper.find('.achievement-chip img.achievement-chip-image');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('/static/achievements/default.svg');
  });

  it('counts only achievements that exist in the current system definition list', async () => {
    mockGetAchievements.mockResolvedValue([
      { id: 'growth_first_use', name: '初来乍到', category: 'GROWTH' },
    ]);

    const { default: Dashboard } = await import('./Dashboard.vue');
    const wrapper = mount(Dashboard);
    await flushPromises();

    expect(wrapper.text()).toContain('1 已点亮');
  });
});
