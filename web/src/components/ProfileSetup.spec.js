import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const mockUpdateProfile = vi.fn();
const mockSetUser = vi.fn();
const mockSetView = vi.fn();

vi.mock('../api.js', () => ({
  API: {
    updateProfile: mockUpdateProfile,
  },
}));

vi.mock('../state.js', () => ({
  GameState: {
    user: {
      id: 'user-1',
      username: 'sam',
      nickname: 'Sam',
      avatar: '/uploads/avatars/original.png',
    },
  },
  Actions: {
    setUser: mockSetUser,
    setView: mockSetView,
  },
}));

describe('ProfileSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current profile and allows avatar selection', async () => {
    const { default: ProfileSetup } = await import('./ProfileSetup.vue');
    const wrapper = mount(ProfileSetup);

    expect(wrapper.text()).toContain('头像');
    expect(wrapper.text()).toContain('保存资料');

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    });
    await input.trigger('change');

    expect(wrapper.find('[data-test="avatar-preview"]').attributes('src')).toContain('blob:');
  });

  it('saves nickname and optional avatar in a single request, then returns to settings', async () => {
    mockUpdateProfile.mockResolvedValue({
      success: true,
      user: { id: 'user-1', username: 'sam', nickname: 'Samuel', avatar: '/uploads/avatars/new.png' },
    });

    const { default: ProfileSetup } = await import('./ProfileSetup.vue');
    const wrapper = mount(ProfileSetup);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    });
    await input.trigger('change');

    await wrapper.get('.field-input').setValue('Samuel');
    await wrapper.get('.save-btn').trigger('click');

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      nickname: 'Samuel',
      avatar: file,
    });
    expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
      nickname: 'Samuel',
      avatar: '/uploads/avatars/new.png',
    }));
    expect(mockSetView).toHaveBeenCalledWith('settings');
  });

  it('shows an error and does not partially update state when atomic save fails', async () => {
    mockUpdateProfile.mockResolvedValue({
      success: false,
      error: 'Avatar file extension does not match MIME type',
    });

    const { default: ProfileSetup } = await import('./ProfileSetup.vue');
    const wrapper = mount(ProfileSetup);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    });
    await input.trigger('change');
    await wrapper.get('.save-btn').trigger('click');

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockSetView).not.toHaveBeenCalledWith('settings');
    expect(wrapper.text()).toContain('Avatar file extension does not match MIME type');
  });

  it('shows an error and stays on profile setup when profile save fails', async () => {
    mockUpdateProfile.mockResolvedValue({
      success: false,
      error: 'Nickname must be 1-24 characters',
    });

    const { default: ProfileSetup } = await import('./ProfileSetup.vue');
    const wrapper = mount(ProfileSetup);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    });
    await input.trigger('change');
    await wrapper.get('.field-input').setValue('');
    await wrapper.get('.save-btn').trigger('click');

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockSetView).not.toHaveBeenCalledWith('settings');
    expect(wrapper.text()).toContain('Nickname must be 1-24 characters');
  });
});
