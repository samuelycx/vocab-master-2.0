import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
};

const mockGetSocialFeed = vi.fn();
const mockGetLeaderboard = vi.fn();
const mockSetView = vi.fn();

vi.mock('../api.js', () => ({
  API: {
    getSocialFeed: mockGetSocialFeed,
    getLeaderboard: mockGetLeaderboard,
  },
}));

vi.mock('../state.js', () => ({
  GameState: {
    user: { id: 'user-1', username: 'alice', level: 1, xp: 0, rank: 0 },
  },
  Actions: {
    setView: mockSetView,
  },
}));

describe('SocialView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSocialFeed.mockResolvedValue([{ id: 'feed-1', username: 'bob', title: '刚完成 30 词挑战', timestamp: '2026-03-13T00:00:00.000Z' }]);
    mockGetLeaderboard.mockResolvedValue([{ id: 'user-1', username: 'alice', level: 1, xp: 10 }]);
  });

  it('loads leaderboard and feed through authenticated helpers without userId params', async () => {
    const { default: SocialView } = await import('./SocialView.vue');
    mount(SocialView);
    await flushPromises();

    expect(mockGetSocialFeed).toHaveBeenCalledWith();
    expect(mockGetLeaderboard).toHaveBeenCalledWith();
  });

  it('renders leaderboard first and can switch to feed tab', async () => {
    const { default: SocialView } = await import('./SocialView.vue');
    const wrapper = mount(SocialView);
    await flushPromises();

    expect(wrapper.text()).toContain('alice');
    await wrapper.findAll('button').find((node) => node.text().includes('动态')).trigger('click');
    expect(wrapper.text()).toContain('刚完成 30 词挑战');
  });

  it('shows current user rank when present in leaderboard', async () => {
    mockGetLeaderboard.mockResolvedValue([
      { id: 'user-1', username: 'alice', level: 1, xp: 10 },
      { id: 'user-2', username: 'bob', level: 1, xp: 9 },
    ]);

    const { default: SocialView } = await import('./SocialView.vue');
    const wrapper = mount(SocialView);
    await flushPromises();

    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('名');
  });
});
