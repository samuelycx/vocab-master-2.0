import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../auth-session.js', () => ({
  AuthSession: {
    login: mockLogin,
    register: mockRegister,
  },
}));

describe('AuthView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits login credentials in default mode', async () => {
    const { default: AuthView } = await import('./AuthView.vue');
    const wrapper = mount(AuthView);

    await wrapper.get('[data-test="username"]').setValue('alice');
    await wrapper.get('[data-test="password"]').setValue('secret123');
    await wrapper.get('[data-test="submit"]').trigger('submit');

    expect(mockLogin).toHaveBeenCalledWith({ username: 'alice', password: 'secret123' });
  });

  it('switches to register mode and submits registration credentials', async () => {
    const { default: AuthView } = await import('./AuthView.vue');
    const wrapper = mount(AuthView);

    await wrapper.get('[data-test="switch-register"]').trigger('click');
    await wrapper.get('[data-test="username"]').setValue('carol');
    await wrapper.get('[data-test="password"]').setValue('secret123');
    await wrapper.get('[data-test="submit"]').trigger('submit');

    expect(mockRegister).toHaveBeenCalledWith({ username: 'carol', password: 'secret123' });
  });
});
