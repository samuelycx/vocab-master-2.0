import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const mockResetProgress = vi.fn();
const mockLogout = vi.fn();
const mockReset = vi.fn();
const mockSetView = vi.fn();
const mockUpdateSettings = vi.fn();

vi.mock('../api.js', () => ({
  API: {
    resetProgress: mockResetProgress,
  },
}));

vi.mock('../auth-session.js', () => ({
  AuthSession: {
    logout: mockLogout,
  },
}));

vi.mock('../state.js', () => ({
  GameState: {
    user: { id: 'user-1', username: 'alice' },
    settings: { soundEnabled: true, theme: 'academic' },
  },
  Actions: {
    reset: mockReset,
    setView: mockSetView,
    updateSettings: mockUpdateSettings,
  },
}));

describe('Settings', () => {
  const reload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    });
    mockResetProgress.mockResolvedValue({ success: true });
  });

  it('resets progress through authenticated api without requiring userId argument', async () => {
    const { default: Settings } = await import('./Settings.vue');
    const wrapper = mount(Settings, { props: { onBack: vi.fn() } });

    const buttons = wrapper.findAll('button');
    await buttons.find((node) => node.text().includes('重置学习进度')).trigger('click');
    await wrapper.findAll('button').find((node) => node.text().includes('确定重置')).trigger('click');

    expect(mockResetProgress).toHaveBeenCalledWith();
    expect(mockReset).toHaveBeenCalled();
    expect(reload).toHaveBeenCalled();
  });

  it('delegates logout to auth session', async () => {
    const { default: Settings } = await import('./Settings.vue');
    const wrapper = mount(Settings, { props: { onBack: vi.fn() } });

    await wrapper.findAll('button').find((node) => node.text().includes('退出登录')).trigger('click');

    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders the core mobile settings sections', async () => {
    const { default: Settings } = await import('./Settings.vue');
    const wrapper = mount(Settings, { props: { onBack: vi.fn() } });

    expect(wrapper.get('[data-test="settings-header"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="settings-preferences"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="settings-account"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="settings-danger"]').exists()).toBe(true);
  });
});
