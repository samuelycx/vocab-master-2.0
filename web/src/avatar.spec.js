import { describe, expect, it } from 'vitest';
import { resolveAvatarUrl, DEFAULT_AVATAR } from './avatar.js';

describe('avatar resolver', () => {
  it('keeps absolute avatar urls', () => {
    expect(resolveAvatarUrl('https://cdn.example.com/avatar.png')).toBe('https://cdn.example.com/avatar.png');
  });

  it('supports local uploads paths', () => {
    expect(resolveAvatarUrl('/uploads/avatars/avatar.png')).toBe('/uploads/avatars/avatar.png');
  });

  it('falls back for empty avatar values', () => {
    expect(resolveAvatarUrl('')).toBe(DEFAULT_AVATAR);
  });
});
